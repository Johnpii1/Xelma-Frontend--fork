import { Lightbulb, Sparkles } from "lucide-react";
import type { Tip } from "../../types/education";
import { cn } from "../../lib/utils";

interface TipCardProps {
    tip: Tip;
    className?: string;
}

export const TipCard = ({ tip, className }: TipCardProps) => {
    return (
        <article
            className={cn(
                "relative overflow-hidden rounded-2xl glass-card accent-border-teal p-6 text-white shadow-[0_8px_32px_rgba(6,182,212,0.08)]",
                className
            )}
            aria-labelledby={`tip-title-${tip.id}`}
        >
            <div className="absolute -right-4 -top-4 text-xelma-teal/10 pointer-events-none" aria-hidden>
                <Sparkles size={120} />
            </div>

            <div className="relative flex flex-col gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-xelma-teal/10 border border-xelma-teal/20 backdrop-blur-sm" aria-hidden>
                    <Lightbulb className="h-6 w-6 text-xelma-teal-bright" />
                </div>

                <div>
                    <h3
                        id={`tip-title-${tip.id}`}
                        className="text-xs font-bold text-xelma-teal uppercase tracking-wider mb-1"
                    >
                        {tip.title || "Daily Alpha Tip"}
                    </h3>
                    <p className="text-lg font-semibold leading-relaxed text-white">
                        <span className="sr-only">Tip: </span>
                        &ldquo;{tip.content}&rdquo;
                    </p>
                </div>

                {tip.category && (
                    <div className="mt-2">
                        <span className="rounded-full bg-xelma-teal/10 border border-xelma-teal/20 px-3 py-1 text-xs font-semibold text-xelma-teal-bright backdrop-blur-sm">
                            #{tip.category}
                        </span>
                    </div>
                )}
            </div>
        </article>
    );
};
