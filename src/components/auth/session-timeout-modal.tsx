"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/authContext";
import { Clock, AlertTriangle, LogOut, RefreshCw } from "lucide-react";

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes idle timeout
const COUNTDOWN_SECONDS = 60; // 60 seconds warning countdown

export function SessionTimeoutModal() {
  const { isLoggedIn, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(COUNTDOWN_SECONDS);
  
  const lastActivityRef = useRef<number>(Date.now());
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setSecondsRemaining(COUNTDOWN_SECONDS);
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    }
  }, [showWarning]);

  // Handle stay logged in button click
  const handleStayLoggedIn = () => {
    resetActivity();
  };

  // Handle manual or automatic logout
  const handleLogout = useCallback(() => {
    setShowWarning(false);
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    logout("session_expired");
  }, [logout]);

  // Activity listeners
  useEffect(() => {
    if (!isLoggedIn) return;

    const activityEvents = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    const onUserActivity = () => {
      // Only reset if warning modal is not currently showing
      if (!showWarning) {
        lastActivityRef.current = Date.now();
      }
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, onUserActivity, { passive: true });
    });

    // Check inactivity periodically
    const checkInterval = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;
      const warningThreshold = INACTIVITY_TIMEOUT_MS - COUNTDOWN_SECONDS * 1000;

      if (idleTime >= warningThreshold && !showWarning) {
        setShowWarning(true);
        const remaining = Math.max(0, Math.ceil((INACTIVITY_TIMEOUT_MS - idleTime) / 1000));
        setSecondsRemaining(remaining > 0 ? remaining : COUNTDOWN_SECONDS);
      }
    }, 2000);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, onUserActivity);
      });
      clearInterval(checkInterval);
    };
  }, [isLoggedIn, showWarning]);

  // Countdown timer when warning modal is active
  useEffect(() => {
    if (showWarning && isLoggedIn) {
      countdownTimerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimerRef.current!);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
        }
      };
    }
  }, [showWarning, isLoggedIn, handleLogout]);

  // Listen for global 401 session expired event
  useEffect(() => {
    const handleGlobalSessionExpired = () => {
      logout("session_expired");
    };

    window.addEventListener("surge_session_expired", handleGlobalSessionExpired);
    return () => {
      window.removeEventListener("surge_session_expired", handleGlobalSessionExpired);
    };
  }, [logout]);

  if (!isLoggedIn || !showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 text-neutral-900 dark:text-neutral-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Session Timeout Warning</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Inactivity detected</p>
          </div>
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-6 leading-relaxed">
          You have been inactive for a while. For your security, you will be automatically logged out in:
        </p>

        {/* Circular / highlighted countdown badge */}
        <div className="flex items-center justify-center gap-2 py-4 mb-6 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700">
          <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
          <span className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400">
            {secondsRemaining}s
          </span>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer border border-neutral-300 dark:border-neutral-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Now</span>
          </button>

          <button
            type="button"
            onClick={handleStayLoggedIn}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Stay Logged In</span>
          </button>
        </div>
      </div>
    </div>
  );
}
