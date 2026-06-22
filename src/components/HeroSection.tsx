import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Trophy,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";

interface HeroSectionProps {
  isLoggedIn?: boolean;
  showNewsRibbon?: boolean;
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4BFD] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900";

const stats = [
  { label: "Round cadence", value: "Live" },
  { label: "Settlement rail", value: "Stellar" },
  { label: "Session goal", value: "Predict" },
];

const playSteps = [
  { icon: Wallet, label: "Connect wallet" },
  { icon: BarChart3, label: "Read the live market" },
  { icon: Trophy, label: "Compete for rewards" },
];

export const HeroSection = ({
  isLoggedIn = false,
  showNewsRibbon = true,
}: HeroSectionProps) => {
  const primaryCta = isLoggedIn
    ? { to: "/", label: "Enter live round", icon: ArrowRight }
    : { to: "/connect", label: "Connect wallet", icon: Wallet };
  const PrimaryIcon = primaryCta.icon;

  return (
    <section
      className={`relative -mx-4 lg:-mx-14 min-h-screen overflow-hidden bg-[#FAFAFA] text-[#292D32] dark:bg-gray-900 dark:text-gray-100 ${
        showNewsRibbon
          ? "pt-[8.75rem] lg:pt-[11rem]"
          : "pt-24 lg:pt-36"
      }`}
      aria-labelledby="landing-hero-title"
    >
      <div
        className="absolute inset-0 bg-[linear-gradient(rgba(44,75,253,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(44,75,253,0.08)_1px,transparent_1px)] bg-[size:44px_44px] dark:bg-[linear-gradient(rgba(190,199,254,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(190,199,254,0.06)_1px,transparent_1px)]"
        aria-hidden
      />
      <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(44,75,253,0.12),rgba(250,250,250,0))] dark:bg-[linear-gradient(180deg,rgba(44,75,253,0.16),rgba(17,24,39,0))]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-16 sm:px-6 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-[#BEC7FE] bg-white px-3 py-2 text-sm font-semibold text-[#2C4BFD] shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-[#BEC7FE]">
              <Sparkles className="h-4 w-4" aria-hidden />
              Stellar prediction arena
            </div>

            <h1
              id="landing-hero-title"
              className="text-4xl font-bold leading-tight text-[#292D32] sm:text-5xl lg:text-6xl dark:text-white"
            >
              Xelma turns market calls into live gameplay.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-[#4D4D4D] sm:text-lg dark:text-gray-300">
              Connect your wallet, join the active round, and predict where the
              market moves next in a fast Stellar-powered competition.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to={primaryCta.to}
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#2C4BFD] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-[#1a3bf0] ${focusRing}`}
              >
                <PrimaryIcon className="h-5 w-5" aria-hidden />
                {primaryCta.label}
              </Link>
              <Link
                to="/learn"
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#BEC7FE] bg-white px-6 py-3 text-base font-semibold text-[#2C4BFD] transition-colors hover:bg-[#F3F6FF] dark:border-gray-700 dark:bg-gray-800 dark:text-[#BEC7FE] dark:hover:bg-gray-700 ${focusRing}`}
              >
                See how rounds work
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
            </div>

            <dl className="mt-9 grid grid-cols-3 gap-3 sm:max-w-xl">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-gray-200 bg-white/85 px-3 py-4 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-800/85"
                >
                  <dt className="text-xs font-medium text-[#9B9B9B] dark:text-gray-400">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-lg font-bold text-[#292D32] dark:text-white">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="rounded-lg border border-[#BEC7FE] bg-white p-3 shadow-2xl shadow-blue-950/10 dark:border-gray-700 dark:bg-gray-800">
              <div className="rounded-lg border border-gray-100 bg-[#FAFAFA] p-4 dark:border-gray-700 dark:bg-gray-900">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4 dark:border-gray-700">
                  <div>
                    <p className="text-xs font-semibold uppercase text-[#9B9B9B] dark:text-gray-400">
                      Active round
                    </p>
                    <p className="mt-1 text-xl font-bold text-[#292D32] dark:text-white">
                      XLM price direction
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
                    Live
                  </span>
                </div>

                <div className="grid gap-4 pt-4 sm:grid-cols-[1.15fr_0.85fr]">
                  <div className="min-h-64 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm text-[#9B9B9B] dark:text-gray-400">
                          Stellar
                        </p>
                        <p className="text-2xl font-bold text-[#292D32] dark:text-white">
                          $0.1284
                        </p>
                      </div>
                      <p className="rounded-lg bg-green-50 px-3 py-1 text-sm font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        +3.2%
                      </p>
                    </div>
                    <img
                      src="/chart-bg.png"
                      alt="Xelma market chart preview"
                      className="h-44 w-full object-cover object-center opacity-90"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                      <p className="text-sm font-semibold text-[#292D32] dark:text-white">
                        Make your call
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-green-500 px-3 py-3 text-center text-sm font-bold text-white">
                          UP
                        </div>
                        <div className="rounded-lg bg-gray-100 px-3 py-3 text-center text-sm font-bold text-[#4D4D4D] dark:bg-gray-700 dark:text-gray-300">
                          DOWN
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-[#BEC7FE] bg-[#F3F6FF] p-4 dark:border-gray-700 dark:bg-gray-800">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#2C4BFD] dark:text-[#BEC7FE]">
                        <ShieldCheck className="h-4 w-4" aria-hidden />
                        Wallet gated
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#4D4D4D] dark:text-gray-300">
                        Your first action leads straight into the connect and
                        play flow.
                      </p>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                      <p className="text-sm text-[#9B9B9B] dark:text-gray-400">
                        Players online
                      </p>
                      <p className="mt-1 text-2xl font-bold text-[#292D32] dark:text-white">
                        142
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {playSteps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.label}
                className="flex min-h-20 items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2C4BFD] text-white">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <CheckCircle2
                    className="mb-1 h-4 w-4 text-green-500"
                    aria-hidden
                  />
                  <p className="font-semibold text-[#292D32] dark:text-white">
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
