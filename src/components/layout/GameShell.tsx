import type { ReactNode } from "react";

interface GameShellProps {
  children: ReactNode;
  showNewsRibbon?: boolean;
  className?: string;
}

/**
 * Centralizes header + ribbon offset, horizontal padding, and page background.
 * All major pages render inside this shell so spacing is consistent across
 * desktop, tablet, and mobile without per-page hardcoded offsets.
 */
export const GameShell = ({
  children,
  showNewsRibbon = true,
  className = "",
}: GameShellProps) => {
  return (
    <main
      id="main-content"
      className={[
        "min-h-screen",
        "px-4 lg:px-14",
        "bg-[#FAFAFA] dark:bg-gray-900",
        "transition-[padding] duration-200",
        showNewsRibbon ? "pt-32 lg:pt-44" : "pt-24 lg:pt-32",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </main>
  );
};

export default GameShell;
