import { Loader2, AlertCircle, Inbox, RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";

interface LoadingProps {
    message?: string;
    className?: string;
    variant?: "spinner" | "skeleton";
    skeletonLines?: number;
    dark?: boolean;
}

export const LoadingState = ({ message = "Loading content...", className, variant = "spinner", skeletonLines = 3, dark = false }: LoadingProps) => {
    if (variant === "skeleton") {
        return (
            <div className={cn("space-y-4 p-4", className)}>
                <div className={cn("h-4 rounded-full", dark ? "bg-white/10" : "bg-gray-200 dark:bg-gray-700")} style={{ width: "50%" }} />
                {Array.from({ length: skeletonLines }).map((_, i) => (
                    <div
                        key={i}
                        className={cn("h-4 rounded animate-pulse", dark ? "bg-white/10" : "bg-gray-200 dark:bg-gray-700")}
                        style={{ width: i === skeletonLines - 1 ? "75%" : "100%" }}
                    />
                ))}
                {message ? (
                    <p className={cn("mt-2 text-sm", dark ? "text-white/70" : "text-gray-500 dark:text-gray-400")}>{message}</p>
                ) : null}
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col items-center justify-center p-12 text-center min-h-[200px]", className)}>
            <Loader2 className={cn("h-10 w-10 animate-spin mb-4", dark ? "text-white" : "text-[#2C4BFD]")} />
            <p className={cn("font-medium", dark ? "text-white/90" : "text-gray-500 dark:text-gray-400")}>{message}</p>
        </div>
    );
};

interface ErrorProps {
    message: string;
    onRetry?: () => void;
    className?: string;
    title?: string;
    variant?: "default" | "dark";
}

export const ErrorState = ({ message, onRetry, className, title = "Oops! Something went wrong", variant = "default" }: ErrorProps) => {
    const isDark = variant === "dark";
    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-12 text-center rounded-2xl min-h-[200px]",
            isDark
                ? "border border-red-500/30 bg-red-900/20 backdrop-blur-sm"
                : "border border-red-100 bg-red-50 dark:bg-red-900/10 dark:border-red-900/20",
            className
        )}>
            <AlertCircle className={cn("h-10 w-10 mb-4", isDark ? "text-red-400" : "text-red-500")} />
            <h3 className={cn("text-lg font-bold mb-2", isDark ? "text-white" : "text-gray-900 dark:text-white")}>{title}</h3>
            <p className={cn("mb-6 max-w-md", isDark ? "text-red-200" : "text-red-600 dark:text-red-400")}>{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className={cn(
                        "inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all hover:scale-105 active:scale-95",
                        isDark
                            ? "bg-white text-gray-900 hover:bg-gray-100"
                            : "bg-gray-900 dark:bg-white dark:text-gray-900 text-white"
                    )}
                >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                </button>
            )}
        </div>
    );
};

interface EmptyProps {
    title: string;
    message: string;
    icon?: React.ReactNode;
    className?: string;
}

export const EmptyState = ({ title, message, icon, className }: EmptyProps) => (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 min-h-[200px]", className)}>
        {icon || <Inbox className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-4" />}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">{message}</p>
    </div>
);
