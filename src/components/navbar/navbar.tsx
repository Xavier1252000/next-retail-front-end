"use client";

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import Cookies from "js-cookie";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import Image from "next/image";
import switchIcon from "@/icons/switchStore.png";
import { ThemeToggle } from "@/components/theme-toggle";

export function NavbarDemo() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();

  const [storeList, setStoreList] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: "HOME", link: "/" },
    { name: "SERVICES", link: "#pricing" },
    { name: "Contact", link: "#contact" },
    { name: "OFFERS", link: "#offers" },
  ];

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    await logout("user_logout");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStoreDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchStores = async () => {
    const userId = Cookies.get("userId");
    if (!userId) return;

    const payload = {
      data: {
        staffId: userId,
      },
    };

    try {
      const { response, status } = await BackendRequest(
        `/api/clientDesk/getStoreByStaffId`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (status === 200 || response?.response?.statusCode === 200) {
        const stores = response?.response?.data || response?.data || [];
        if (Array.isArray(stores) && stores.length > 0) {
          setStoreList(stores);

          // Check for existing storeId in cookies
          const storedStoreId = Cookies.get("storeId");
          const selected = storedStoreId
            ? stores.find((store: { id: string }) => store.id === storedStoreId) || stores[0]
            : stores[0];

          setSelectedStore(selected);
          Cookies.set("storeId", selected.id, { expires: 30, path: "/" });
        }
      }
    } catch (err) {
      console.error("Error fetching stores:", err);
    }
  };

  const fetchClient = async () => {
    const userId = Cookies.get("userId");
    if (!userId) return;

    const payload = {
      data: {
        userId,
      },
    };

    try {
      const { response, status } = await BackendRequest(
        `/api/clientDetails/getClientDetailByUserId`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (status === 200 || response?.response?.statusCode === 200) {
        const bName = response?.response?.data?.businessName;
        if (bName) setDisplayName(bName);
      }
    } catch (err) {
      console.error("Error fetching client details:", err);
    }
  };

  const fetchUser = () => {
    const name = Cookies.get("name");
    if (name) {
      setDisplayName(name);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      // 1. Fetch stores for all authenticated users (Clients, Staff, Admins, Cashiers)
      fetchStores();

      // 2. Fetch business/user display name
      const rolesCookie = Cookies.get("userRoles");
      const roles: string[] = rolesCookie ? JSON.parse(rolesCookie) : [];
      if (roles.includes("CLIENT")) {
        fetchClient();
      } else {
        fetchUser();
      }
    }
  }, [isLoggedIn]);

  const handleStoreSwitch = (store: any) => {
    setSelectedStore(store);
    Cookies.set("storeId", store.id, { expires: 30, path: "/" });
    setIsStoreDropdownOpen(false);
    // Reload to ensure active store's inventory, taxes, orders, and POS billing sync immediately
    window.location.reload();
  };

  return (
    <div className="relative w-full">
      <Navbar className="fixed top-0 left-0 bg-slate-900/95 dark:bg-neutral-950/95 backdrop-blur-md shadow-md border-b border-slate-700/50 dark:border-neutral-800 w-full h-14 z-50 transition-colors duration-200">
        <NavBody className="flex w-full items-center justify-between px-4">
          {/* LEFT SIDE: Brand & Active Store Badge */}
          <div className="flex items-center gap-3">
            <span
              onClick={() => router.push("/")}
              className="text-xl font-bold tracking-tight text-white flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span>
              Surge Retail
            </span>

            {isLoggedIn && displayName && (
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/40 text-blue-300 border border-blue-700/50">
                {displayName}
              </span>
            )}
          </div>

          {/* RIGHT SIDE: Store Switcher + Theme Toggle + Auth */}
          <div className="flex items-center gap-3">
            {/* Authenticated Store Switcher */}
            {isLoggedIn && (
              <div className="relative flex items-center gap-1.5" ref={dropdownRef}>
                {/* Store Selector Pill */}
                <button
                  type="button"
                  onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-slate-700 dark:border-neutral-700 text-white transition-all cursor-pointer shadow-sm"
                  title="Switch Active Store"
                >
                  <span className="text-sm">🏪</span>
                  <div className="flex flex-col text-left leading-tight">
                    <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                      Store
                    </span>
                    <span className="text-xs font-semibold text-neutral-100 max-w-[120px] sm:max-w-[160px] truncate">
                      {selectedStore?.storeName || (storeList.length > 0 ? storeList[0].storeName : "No Store Selected")}
                    </span>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                      isStoreDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Fast Switch Icon Button */}
                <button
                  type="button"
                  onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
                  className="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-neutral-800 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
                  title="Switch Store"
                >
                  <Image
                    src={switchIcon}
                    alt="Switch Store"
                    width={20}
                    height={20}
                    className="brightness-200 hover:brightness-100 transition-all"
                  />
                </button>

                {/* Store Dropdown Menu */}
                {isStoreDropdownOpen && (
                  <div className="absolute top-12 right-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-2xl rounded-xl z-50 min-w-[240px] max-w-[320px] py-1 text-sm text-neutral-800 dark:text-neutral-200 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        Available Stores
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                        {storeList.length} Stores
                      </span>
                    </div>

                    <div className="max-h-64 overflow-y-auto py-1">
                      {storeList.length > 0 ? (
                        storeList.map((store: any, idx: number) => {
                          const isSelected = selectedStore?.id === store.id;
                          return (
                            <div
                              key={store.id || idx}
                              onClick={() => handleStoreSwitch(store)}
                              className={`px-3 py-2.5 cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                                isSelected
                                  ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600"
                                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-l-4 border-transparent"
                              }`}
                            >
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold truncate">
                                  {store.storeName}
                                </span>
                                <span className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate">
                                  {[store.storeType, store.city].filter(Boolean).join(" • ") || "Branch Store"}
                                </span>
                              </div>
                              {isSelected && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white shrink-0">
                                  Active
                                </span>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-4 py-3 text-xs text-neutral-500 text-center">
                          No stores assigned to this account.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Auth Buttons */}
            {!isLoggedIn ? (
              <>
                <NavbarButton variant="secondary" onClick={handleLogin}>
                  Login
                </NavbarButton>
                <NavbarButton variant="primary">Book a call</NavbarButton>
              </>
            ) : (
              <NavbarButton onClick={handleLogout}>Logout</NavbarButton>
            )}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>
          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {isLoggedIn && storeList.length > 0 && (
              <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg mb-2">
                <span className="text-xs font-semibold text-neutral-500 block mb-1">
                  Active Store:
                </span>
                <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 block">
                  {selectedStore?.storeName || storeList[0]?.storeName}
                </span>
              </div>
            )}

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

            <div className="flex w-full flex-col gap-3 pt-2">
              {!isLoggedIn ? (
                <>
                  <NavbarButton
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogin();
                    }}
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
                </>
              ) : (
                <NavbarButton
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  variant="primary"
                  className="w-full"
                >
                  Logout
                </NavbarButton>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
