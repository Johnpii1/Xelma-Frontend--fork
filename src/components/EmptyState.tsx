import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../lib/utils';

export interface EmptyStateAction {
  /** Button label */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Optional additional class names for the button */
  className?: string;
}

export interface EmptyStateProps {
  /**
   * The primary headline — be specific about what's missing.
   * e.g. "No notifications yet" not "Nothing here"
   */
  title: string;

  /**
   * A single sentence that tells the user what to do next.
   * e.g. "Predictions you make will appear here once a round starts."
   */
  description: string;

  /**
   * Optional icon rendered above the title.
   * Defaults to a generic inbox icon when omitted.
   * Pass a Lucide icon or any React node sized to your context:
   *   <Trophy className="h-12 w-12 text-xelma-teal" />
   */
  icon?: React.ReactNode;

  /**
   * Optional call-to-action rendered below the description.
   * Use sparingly — only when there's a clear next step the user can take
   * directly from this empty state.
   */
  action?: EmptyStateAction;

  /** Additional Tailwind classes to override outer container sizing/spacing. */
  className?: string;
}

/**
 * EmptyState
 *
 * A shared presentational component for zero-content panels across Xelma:
 * notifications, leaderboard, chat, prediction history, and future terminal panels.
 *
 * Design tokens used:
 *   - Background:  bg-[#111827]/40  (--color-xelma-card with alpha)
 *   - Border:      border-white/10   (dashed, subtle glass edge)
 *   - Title:       text-white
 *   - Description: text-gray-400
 *   - Action:      bg-xelma-blue / hover:bg-xelma-blue-dark  (--color-xelma-blue)
 *
 * Dark mode is handled automatically — this component targets Xelma's
 * dark-first design system (bg-[#0a0f1a] base) but also carries
 * `dark:` variants so it degrades gracefully in any light-mode panel
 * (e.g. the NotificationsPanel which uses bg-white in light mode).
 *
 * @example — Notifications panel (no icon override needed)
 * ```tsx
 * <EmptyState
 *   title="No notifications"
 *   description="You're all caught up. New activity will appear here."
 * />
 * ```
 *
 * @example — Leaderboard panel with a custom icon
 * ```tsx
 * import { Trophy } from 'lucide-react';
 *
 * <EmptyState
 *   icon={<Trophy className="h-12 w-12 text-xelma-teal mb-4" />}
 *   title="No leaderboard data yet"
 *   description="Be the first to make a prediction and claim the top spot."
 *   action={{ label: 'Start predicting', onClick: () => navigate('/game') }}
 * />
 * ```
 *
 * @example — Chat sidebar (empty message history)
 * ```tsx
 * import { MessageCircle } from 'lucide-react';
 *
 * <EmptyState
 *   icon={<MessageCircle className="h-10 w-10 text-xelma-blue mb-3" />}
 *   title="No messages yet"
 *   description="Be the first to say something."
 *   className="min-h-[160px]"
 * />
 * ```
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        // Layout
        'flex flex-col items-center justify-center p-10 text-center rounded-2xl min-h-[200px]',
        // Dark-first glass surface — matches Xelma's panel aesthetic
        'border border-dashed border-white/10 bg-[#111827]/40 backdrop-blur-sm',
        // Light-mode fallback (e.g. NotificationsPanel white panel)
        'dark:bg-[#111827]/40 dark:border-white/10',
        'bg-gray-50/60 border-gray-200/60',
        className,
      )}
      // Assistive: treat as a status region so screen readers announce it
      role="status"
      aria-live="polite"
    >
      {/* Icon */}
      <span aria-hidden="true" className="mb-4 flex items-center justify-center">
        {icon ?? (
          <Inbox className="h-12 w-12 text-gray-400 dark:text-gray-500" />
        )}
      </span>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
        {description}
      </p>

      {/* Optional action */}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={cn(
            'mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold',
            'bg-xelma-blue hover:bg-xelma-blue-dark text-white',
            'transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xelma-blue focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0F1A]',
            action.className,
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;