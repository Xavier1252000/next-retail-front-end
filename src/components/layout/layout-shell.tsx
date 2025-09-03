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
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar only if logged in */}
      {isLoggedIn && (
        <div
          className={`transition-all duration-300 shrink-0 ${
            isOpen ? "w-55" : "w-10"
          }`}
        >
          <Sidebar />
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-grow overflow-auto">
        <NavbarDemo />
        <main className="p-4 flex-grow">{children}</main>
      </div>
    </div>
  );
}
