"use client";

import { 
  Navbar, 
  NavBody, 
  NavItems, 
  MobileNav, 
  NavbarLogo, 
  NavbarButton, 
  MobileNavHeader, 
  MobileNavToggle, 
  MobileNavMenu 
} from "@/components/ui/resizable-navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import Cookies from "js-cookie";

export function NavbarDemo() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const router = useRouter();

  const navItems = [
    { name: "HOME", link: "/" },
    { name: "SERVICES", link: "#pricing" },
    { name: "Contact", link: "#contact" },
    { name: "OFFERS", link: "#offers" },
  ];

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = () => {
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach((cookieName) => {
      Cookies.remove(cookieName);
    });
    localStorage.clear();
    router.push("/");
    setIsLoggedIn(false);
  };

  return (
    <div className="relative w-full">
      <Navbar className="fixed top-0 left-0 bg-purple-500 shadow-sm border-b border-slate-200 w-full h-13 z-50">
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
          
            {!isLoggedIn ? (
              <>
                <NavbarButton variant="secondary" onClick={handleLogin}>
                  Login
                </NavbarButton>
                <NavbarButton variant="primary">Book a call</NavbarButton>
              </>
            ) : (
              <>
                <NavbarButton>Profile</NavbarButton>
                <NavbarButton>Settings</NavbarButton>
                <NavbarButton onClick={handleLogout}>Logout</NavbarButton>
              </>
            )}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>
          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
              >
                Login
              </NavbarButton>
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
              >
                Book a call
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}