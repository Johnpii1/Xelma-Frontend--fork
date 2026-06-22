import type { ReactNode } from "react";

export type ChipStatus = "active" | "inactive" | "loading" | "error" | "warning" | "info";

export interface StatusChipProps {
  label: string;
  value?: string;
  status: ChipStatus;
  icon?: ReactNode;
  className?: string;
}

const statusStyles: Record<ChipStatus, string> = {
  active:
    "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
  inactive:
    "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700",
  loading:
    "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  error:
    "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border-red-200 dark:border-red-800",
  warning:
    "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
  info:
    "bg-[#2C4BFD]/8 dark:bg-[#2C4BFD]/20 text-[#2C4BFD] dark:text-blue-300 border-[#2C4BFD]/20 dark:border-[#2C4BFD]/40",
};

const dotStyles: Record<ChipStatus, string> = {
  active: "bg-green-500",
  inactive: "bg-gray-400 dark:bg-gray-500",
  loading: "bg-blue-500 animate-pulse",
  error: "bg-red-500",
  warning: "bg-yellow-500 animate-pulse",
  info: "bg-[#2C4BFD]",
};

export const StatusChip = ({
  label,
  value,
  status,
  icon,
  className = "",
}: StatusChipProps) => {
  return (
    <div
      className={[
        "inline-flex items-center gap-1.5",
        "px-2.5 py-1",
        "rounded-full border text-xs font-medium",
        "transition-colors duration-200",
        statusStyles[status],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon ? (
        <span className="w-3.5 h-3.5 flex-shrink-0">{icon}</span>
      ) : (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotStyles[status]}`}
          aria-hidden
        />
      )}
      <span className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
        {label}
      </span>
      {value && (
        <span className="font-semibold">{value}</span>
      )}
    </div>
  );
};

export default StatusChip;
