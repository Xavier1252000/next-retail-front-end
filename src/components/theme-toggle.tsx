"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle theme"
        className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors shadow-xs flex items-center justify-center cursor-pointer"
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-amber-400 transition-transform rotate-0 scale-100" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 transition-transform rotate-0 scale-100" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-xl py-1 z-50 text-sm animate-in fade-in zoom-in-95 duration-100">
          <button
            onClick={() => {
              setTheme("light");
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer ${
              theme === "light"
                ? "text-blue-600 dark:text-blue-400 font-medium"
                : "text-neutral-700 dark:text-neutral-300"
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Light</span>
          </button>

          <button
            onClick={() => {
              setTheme("dark");
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer ${
              theme === "dark"
                ? "text-blue-600 dark:text-blue-400 font-medium"
                : "text-neutral-700 dark:text-neutral-300"
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Dark</span>
          </button>

          <button
            onClick={() => {
              setTheme("system");
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer ${
              theme === "system"
                ? "text-blue-600 dark:text-blue-400 font-medium"
                : "text-neutral-700 dark:text-neutral-300"
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>System</span>
          </button>
        </div>
      )}
    </div>
  );
}
