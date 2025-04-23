"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/side_bar/Sidebar";
import { NavbarDemo } from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { useSidebar } from "@/context/sidebar-context";
import { useAuth } from "@/context/authContext";

export default function LayoutShell({ children }: { children: ReactNode }) {
  const { isOpen } = useSidebar();
  const { isLoggedIn } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar only if logged in */}
      {isLoggedIn && (
        <div className={`transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}>
          <Sidebar />
        </div>
      )}

      {/* Main Content adjusts based on sidebar */}
      <div
        className={`flex-grow flex flex-col transition-all duration-300 overflow-auto ${
          isLoggedIn ? "ml-0" : ""
        }`}
      >
        <NavbarDemo />
        <main className="p-4 flex-grow">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
