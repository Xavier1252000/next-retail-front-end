// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/context/toast-context";
import { AuthProvider } from "@/context/authContext";
import { SidebarProvider } from "@/context/sidebar-context";
import LayoutShell from "@/components/layout/layout-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionTimeoutModal } from "@/components/auth/session-timeout-modal";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Surge Retail - Enterprise Retail & POS",
  description: "Modern POS and retail billing system for surgical apparatus and enterprise stores",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground transition-colors duration-200`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <AuthProvider>
              <SidebarProvider>
                <LayoutShell>{children}</LayoutShell>
                <SessionTimeoutModal />
              </SidebarProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
