"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/side_bar/Sidebar";
import { NavbarDemo } from "@/components/navbar/navbar";
import { useSidebar } from "@/context/sidebar-context";
import { useAuth } from "@/context/authContext";

export default function LayoutShell({ children }: { children: ReactNode }) {
  const { isOpen } = useSidebar();
  const { isLoggedIn } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-200">
      {/* Sidebar only if logged in */}
      {isLoggedIn && (
        <>
          <div
            className={`hidden md:block transition-all duration-300 shrink-0 ${
              isOpen ? "w-60" : "w-16"
            }`}
          />
          <Sidebar />
        </>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-grow overflow-auto min-w-0">
        <NavbarDemo />
        <main className="pt-16 p-3 md:p-6 flex-grow">{children}</main>
      </div>
    </div>
  );
}
