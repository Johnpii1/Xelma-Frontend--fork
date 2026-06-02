import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { priceApi, type PricePoint } from "../lib/api-client";
import { socketService } from "../lib/socket";
import { LoadingState, ErrorState } from "./ui/StatusStates";
import { useConnectionStatus } from "../hooks/useConnectionStatus";
import { ConnectionStatus } from "./ConnectionStatus";

interface PriceChartProps {
  height?: number;
}

type PriceUpdatePayload = {
  time?: number | string;
  timestamp?: number | string;
  value?: number | string;
  price?: number | string;
  data?: unknown;
  payload?: unknown;
  prices?: unknown;
  history?: unknown;
};

function toPricePoint(value: unknown): PricePoint | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const rawTime = record.time ?? record.timestamp;
  const rawPrice = record.value ?? record.price;
  const time = typeof rawTime === "string" ? Number(rawTime) : rawTime;
  const price = typeof rawPrice === "string" ? Number(rawPrice) : rawPrice;

  if (!Number.isFinite(time) || !Number.isFinite(price)) return null;
  const normalizedTime = (time as number) > 9999999999 ? Math.floor((time as number) / 1000) : Math.floor(time as number);
  return { time: normalizedTime, value: price as number };
}

function extractPricePoints(payload: unknown): PricePoint[] {
  if (Array.isArray(payload)) {
    return payload.map(toPricePoint).filter((point): point is PricePoint => point !== null);
  }

  if (!payload || typeof payload !== "object") return [];
  const event = payload as PriceUpdatePayload;
  const nested = event.data ?? event.payload ?? event.prices ?? event.history;

  if (nested) return extractPricePoints(nested);
  const point = toPricePoint(event);
  return point ? [point] : [];
}

function mergePricePoints(existing: PricePoint[], incoming: PricePoint[]): PricePoint[] {
  if (incoming.length === 0) return existing;

  const merged = new Map<number, PricePoint>();
  for (const point of existing) merged.set(point.time, point);
  for (const point of incoming) merged.set(point.time, point);

  return Array.from(merged.values())
    .sort((a, b) => a.time - b.time)
    .slice(-500);
}

function buildPriceLabels(points: PricePoint[]): number[] {
  if (points.length === 0) return [];

  const prices = points.map((point) => point.value);
  const latest = prices[prices.length - 1];
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || Math.max(latest * 0.002, 0.000001);
  const steps = 5;
  const stepSize = range / steps;

  const labels: number[] = [];
  for (let i = 0; i <= steps; i += 1) {
    labels.push(max - i * stepSize);
  }

  const nearestIndex = labels.reduce((best, label, index) => {
    const bestDistance = Math.abs(labels[best] - latest);
    const currentDistance = Math.abs(label - latest);
    return currentDistance < bestDistance ? index : best;
  }, 0);

  labels[nearestIndex] = latest;

  return Array.from(new Set(labels.map((value) => Number(value.toFixed(6))))).sort((a, b) => b - a);
}

const PriceChart = ({ height = 300 }: PriceChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const [data, setData] = useState<PricePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  // y-coordinate of the last data point for the badge
  const [badgeY, setBadgeY] = useState<number | null>(null);
  // y-coordinates for each price label
  const [labelYs, setLabelYs] = useState<number[]>([]);

  const priceLabels = useMemo(() => buildPriceLabels(data), [data]);
  const latestPrice = data[data.length - 1]?.value ?? 0;
  const firstPrice = data[0]?.value ?? latestPrice;
  const priceChange = latestPrice - firstPrice;
  const priceChangePercent = firstPrice !== 0 ? (priceChange / firstPrice) * 100 : 0;
  const isPositive = priceChange >= 0;
  const hasData = data.length > 0;

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const container = chartContainerRef.current;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "transparent", // hide built-in labels
        fontFamily: "inherit",
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      width: container.clientWidth,
      height: height,
      rightPriceScale: {
        visible: false, // hide the built-in price scale entirely
      },
      leftPriceScale: {
        visible: false,
      },
      timeScale: {
        visible: false,
        borderVisible: false,
        rightOffset: 0,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      crosshair: {
        vertLine: { visible: false },
        horzLine: { visible: false },
      },
      handleScroll: false,
      handleScale: false,
    });

    chartRef.current = chart;

    const lineSeries = chart.addSeries(LineSeries, {
      color: "#FFFFFF",
      lineWidth: 3,
      priceFormat: { type: "price", precision: 6, minMove: 0.000001 },
      lastValueVisible: false,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
      lineType: 2, // LineType.Curved
    });

    seriesRef.current = lineSeries;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [height]);

  const updatePositions = useCallback(() => {
    if (!seriesRef.current) return;
    const lastPoint = data[data.length - 1];
    if (!lastPoint) {
      setBadgeY(null);
      setLabelYs([]);
      return;
    }

    const y = seriesRef.current.priceToCoordinate(lastPoint.value);
    setBadgeY(y ?? null);

    const ys = priceLabels.map((price) => seriesRef.current!.priceToCoordinate(price) ?? -9999);
    setLabelYs(ys);
  }, [data, priceLabels]);

  useEffect(() => {
    if (!seriesRef.current) return;

    const chartData = data.map((point) => ({
      time: point.time as UTCTimestamp,
      value: point.value,
    }));

    seriesRef.current.setData(chartData);
    chartRef.current?.timeScale().fitContent();
    requestAnimationFrame(updatePositions);
  }, [data, updatePositions]);

  useEffect(() => {
    if (!chartRef.current || !chartContainerRef.current) return;

    const handleResize = () => {
      if (!chartRef.current || !chartContainerRef.current) return;
      chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      requestAnimationFrame(updatePositions);
    };

    chartRef.current.timeScale().subscribeVisibleLogicalRangeChange(updatePositions);
    window.addEventListener("resize", handleResize);

    return () => {
      chartRef.current?.timeScale().unsubscribeVisibleLogicalRangeChange(updatePositions);
      window.removeEventListener("resize", handleResize);
    };
  }, [updatePositions]);

  const loadInitialPrices = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const prices = await priceApi.getPriceSeries();
      setData(prices);
      setLastUpdatedAt(new Date());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load price data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInitialPrices();
  }, [loadInitialPrices]);

  useEffect(() => {
    // Connect to socket only once when component mounts
    socketService.connect();
    
    const unsubscribe = socketService.onPriceUpdate((payload: unknown) => {
      const incomingPoints = extractPricePoints(payload);
      if (incomingPoints.length === 0) return;

      setData((previous) => mergePricePoints(previous, incomingPoints));
      setLoadError(null);
      setLastUpdatedAt(new Date());
    });

    return () => {
      unsubscribe();
      // Note: Don't disconnect socket here as other components may be using it
    };
  }, []); // Empty dependency array ensures this runs only once

  const { isConnected, isDisconnected } = useConnectionStatus();

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1e3a5f, #0a1929)" }}
          >
            <span className="text-white text-xs font-bold">XLM</span>
          </div>
          <div>
            <span className="font-bold text-[#292D32] dark:text-white text-lg">XLM/USD</span>
            <span className={`ml-2 text-xs ${isConnected ? 'text-green-500' : 'text-gray-400'} dark:text-gray-500`}>
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
        
        {/* Connection status for disconnected state */}
        {isDisconnected && (
          <ConnectionStatus className="mr-4" />
        )}
        <p className={`text-sm font-semibold tabular-nums ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {isPositive ? "+" : ""}{priceChangePercent.toFixed(2)}%
        </p>
      </div>

      {/* Chart area wrapper with padded border — azul marino */}
      <div className="relative w-full flex-1 rounded-2xl border-[3px] border-[#1e3a5f]" style={{ minHeight: height, background: "linear-gradient(180deg, #1e3a5f 0%, #13274F 50%, #0a1929 100%)" }}>

        <div className="relative w-full h-full rounded-xl overflow-hidden shadow-inner">
          {/* Montañas (imagen de fondo) */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/chart-bg.png')",
              backgroundPosition: "center 38%",
            }}
          />
          {/* Overlay azul marino suave para que se vean más las montañas */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, rgba(30, 58, 95, 0.45) 0%, rgba(19, 39, 79, 0.5) 50%, rgba(10, 25, 41, 0.55) 100%)",
            }}
          />
          {/* Chart — leaves space on the right so line terminates exactly at the badge */}
          <div ref={chartContainerRef} className="absolute inset-y-0 left-0 right-[105px]" />

          {/* Custom price labels on the right */}
          <div className="pointer-events-none absolute top-0 right-0 h-full w-[105px] flex flex-col">
            {priceLabels.map((price, i) => {
              const y = labelYs[i];
              if (y === undefined || y < 0 || y > height) return null;
              const isBadgePrice = Math.abs(price - latestPrice) < 0.000001;
              return (
                <div
                  key={`${price}-${i}`}
                  className="absolute right-2 tabular-nums whitespace-nowrap"
                  style={{
                    top: y,
                    transform: "translateY(-50%)",
                    fontSize: "11px",
                    color: isBadgePrice ? "#fff" : "rgba(255,255,255,0.9)",
                    fontWeight: isBadgePrice ? "700" : "500",
                  }}
                >
                  {price.toFixed(6)}
                </div>
              );
            })}
          </div>

          {/* Price dot and badge at the last point exactly on the boundary */}
          {badgeY !== null && hasData && (
            <div
              className="pointer-events-none absolute z-20 flex items-center transition-all duration-300"
              style={{
                right: "4px",
                width: "101px",
                top: badgeY,
                transform: "translateY(calc(-50% + 3px)) scale(0.96)",
                transformOrigin: "left center",
              }}
            >
              {/* Connecting dot exactly at the chart's right edge */}
              <div
                className="w-2.5 h-2.5 bg-white rounded-full absolute shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                style={{ left: "-5px" }}
              />
              {/* The badge box */}
              <div
                className="font-bold text-xs px-2 py-1 rounded shadow-sm tabular-nums whitespace-nowrap relative"
                style={{
                  background: "rgba(255,255,255,0.98)",
                  color: "#0a1929",
                  marginLeft: "8px",
                }}
              >
                ${latestPrice.toFixed(6)}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center bg-[#0a1929]/90 backdrop-blur-sm rounded-xl">
              <LoadingState
                message="Loading live price data..."
                variant="skeleton"
                skeletonLines={5}
                dark={true}
                className="max-w-md w-full"
              />
            </div>
          )}
          {loadError && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center rounded-xl">
              <ErrorState
                message={loadError}
                onRetry={loadInitialPrices}
                variant="dark"
                title="Failed to load prices"
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 px-2 text-xs text-gray-400 dark:text-gray-500">
        <span>Last update: {lastUpdatedAt ? lastUpdatedAt.toLocaleTimeString() : "Waiting for live data"}</span>
        <span>Live market feed</span>
      </div>
    </div>
  );
};

export default PriceChart;
