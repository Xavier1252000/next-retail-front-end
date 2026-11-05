"use client";

import React from "react";
import { useLogin } from "./use-login";
import { useAuth } from "@/context/authContext";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, User, AlertCircle, ArrowRight } from "lucide-react";

const Login = () => {
  const {
    formData,
    handleChange,
    showPassword,
    handleSubmit,
    isSubmitting,
    togglePasswordVisibility,
  } = useLogin();

  const { isLoggedIn } = useAuth();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  if (isLoggedIn) return null;

  return (
    <section className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground transition-colors duration-200">
      <div className="w-full max-w-md">
        {/* Session Expired Banner */}
        {reason === "session_expired" && (
          <div className="mb-4 p-3.5 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 flex items-center gap-3 text-sm shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Your session has expired due to inactivity. Please sign in again.</span>
          </div>
        )}

        {reason === "unauthenticated" && (
          <div className="mb-4 p-3.5 rounded-xl border border-blue-300 dark:border-blue-700/60 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 flex items-center gap-3 text-sm shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400" />
            <span>Please log in to access this page.</span>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card text-card-foreground shadow-xl p-8 backdrop-blur-sm">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-3 border border-blue-100 dark:border-blue-900/50">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Sign in to Surge Retail</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your credentials to access your store
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block mb-2 text-sm font-medium text-foreground"
              >
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="username"
                  id="username"
                  autoComplete="username"
                  className="bg-background border border-input text-foreground rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3.5 py-2.5 text-sm transition-colors outline-hidden"
                  placeholder="admin or user@store.com"
                  onChange={handleChange}
                  value={formData?.username || ""}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  onChange={handleChange}
                  value={formData?.password || ""}
                  className="bg-background border border-input text-foreground rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 py-2.5 text-sm transition-colors outline-hidden"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 transition-all cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
