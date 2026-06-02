import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const RouteProgressBar = () => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Start the progress bar when the route changes or on initial load
    const initTimeout = setTimeout(() => {
      setVisible(true);
      setProgress(prefersReducedMotion ? 100 : 0);
    }, 0);

    let startTimeout: number | null = null;
    let middleTimeout: number | null = null;
    let finishTimeout: number | null = null;
    let hideTimeout: number | null = null;

    if (!prefersReducedMotion) {
      // Initial rapid progress
      startTimeout = window.setTimeout(() => {
        setProgress(30);
      }, 50);

      // Continue progress to simulate loading
      middleTimeout = window.setTimeout(() => {
        setProgress(70);
      }, 300);

      // Finish the progress bar
      finishTimeout = window.setTimeout(() => {
        setProgress(100);
      }, 600);

      // Hide the bar after it finishes
      hideTimeout = window.setTimeout(() => {
        setVisible(false);
        // Reset progress slightly after hiding to be ready for next time without jumping
        setTimeout(() => setProgress(0), 200);
      }, 1000);
    } else {
      hideTimeout = window.setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 200);
    }

    return () => {
      clearTimeout(initTimeout);
      if (startTimeout) clearTimeout(startTimeout);
      if (middleTimeout) clearTimeout(middleTimeout);
      if (finishTimeout) clearTimeout(finishTimeout);
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 pointer-events-none">
      <div
        className="h-full bg-[#2C4BFD] transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:duration-0"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default RouteProgressBar;
