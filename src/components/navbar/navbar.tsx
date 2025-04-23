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
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import Cookies from "js-cookie";

export function NavbarDemo() {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoggedIn, setIsLoggedIn } = useAuth();


  const navItems = [
    {
      name: "HOME",
      link: "/",
    },
    {
      name: "SERVICES",
      link: "#pricing",
    },
    {
      name: "Contact",
      link: "#contact",
    },
    {
        name: "OFFERS",
        link: "#offers"
    }
  ];

  const router = useRouter();
  const handleLogin = () => {
    router.push("/login")
  }
    const handleLogout = () => {
        
      const allCookies = Cookies.get(); // Gets all cookies as an object
      Object.keys(allCookies).forEach((cookieName) => {
      Cookies.remove(cookieName);
      });
      localStorage.clear();
      router.push("/");
      setIsLoggedIn(false);
    };

    // useEffect(() => {
    //     const cookies = document.cookie;
    //     const hasToken = cookies.includes("access_token=");
    //     const hasUserId = cookies.includes("userId");
      
    //     if (hasToken || hasUserId) {
    //       setIsLoggedIn(true);
    //     }
    //   }, [isLoggedIn]);

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
          {!isLoggedIn ? (
              <>
                <NavbarButton variant="secondary" onClick={handleLogin}>Login</NavbarButton>
                <NavbarButton variant="primary">Book a call</NavbarButton>
              </>
            ) : (
              <>
                <NavbarButton >Profile</NavbarButton>
                <NavbarButton >Settings</NavbarButton>
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
      {/* <DummyContent /> */}

      {/* Navbar */}
    </div>
  );
}

const DummyContent = () => {
  return (
    <div className="container mx-auto p-8 pt-24">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">   
      </div>
    </div>
  );
};
