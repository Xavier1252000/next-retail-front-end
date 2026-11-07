"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home, ShoppingBag, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Global UI Exception Handled:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-900 dark:text-neutral-100">
            Operational Interruption Handled
          </h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
            The application intercepted an unexpected rendering state and safely protected your session data.
          </p>
        </div>

        {/* Error Detail */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-neutral-700/60 font-mono text-[11px] text-slate-600 dark:text-neutral-300 break-all text-left">
          {error?.message || "An unexpected error occurred during page rendering."}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm shadow-blue-500/20 active:scale-98 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Action</span>
          </button>

          <button
            onClick={() => router.push("/billing/addInvoiceItems")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 font-semibold text-xs transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Return to POS Billing</span>
          </button>
        </div>
      </div>
    </div>
  );
}
