import { BookOpen, Clock, ChevronRight } from "lucide-react";
import type { Guide } from "../../types/education";
import { cn } from "../../lib/utils";

interface GuideCardProps {
    guide: Guide;
    className?: string;
}

export const GuideCard = ({ guide, className }: GuideCardProps) => {
    return (
        <article
            className={cn(
                "group relative flex flex-col overflow-hidden rounded-2xl glass-card transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(44,75,253,0.15)]",
                className
            )}
            aria-labelledby={`guide-title-${guide.id}`}
        >
            <div className="aspect-[16/9] w-full overflow-hidden bg-[#111827]/80">
                {guide.imageUrl ? (
                    <img
                        src={guide.imageUrl}
                        alt={guide.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-xelma-bg/60 border-b border-white/5">
                        <BookOpen className="h-10 w-10 text-xelma-teal/40" aria-hidden />
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-xelma-blue/10 border border-xelma-blue/20 px-2.5 py-0.5 text-xs font-semibold text-[#BEC7FE]">
                        {guide.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {guide.readTime}
                    </span>
                </div>

                <h3
                    id={`guide-title-${guide.id}`}
                    className="mb-2 text-xl font-bold text-white group-hover:text-xelma-teal transition-colors"
                >
                    {guide.title}
                </h3>

                <p className="mb-4 line-clamp-2 text-sm text-gray-400">
                    {guide.description}
                </p>

                <div className="mt-auto flex items-center justify-between gap-2">
                    <a
                        href={guide.externalLink || "#"}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-400 hover:text-cyan-300 hover:underline transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xelma-teal focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0F1A]"
                        aria-label={guide.externalLink ? `Read guide: ${guide.title} (opens in a new tab)` : `Read guide: ${guide.title}`}
                        target={guide.externalLink ? "_blank" : undefined}
                        rel={guide.externalLink ? "noopener noreferrer" : undefined}
                    >
                        Read Guide
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                    </a>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold tabular-nums">
                        {new Date(guide.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>
                </div>
            </div>
        </article>
    );
};
