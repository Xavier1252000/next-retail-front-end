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
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import Cookies from "js-cookie";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import Image from "next/image";
import switchIcon from "@/icons/switchStore.png";

export function NavbarDemo() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const router = useRouter();

  const [storeList, setStoreList] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [shouldShowSwitchIcon, setShouldShowSwitchIcon] = useState(false);

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
    await fetch("/api/auth/logout", { method: "GET" });
    localStorage.clear();
    setIsLoggedIn(false);
    router.push("/");
  };

  const fetchStores = async () => {
    const payload = {
      data: {
        staffId: Cookies.get("userId"),
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
        const stores = response?.response?.data || [];
        setStoreList(stores);

        // Check for existing storeId in cookies
        const storedStoreId = Cookies.get("storeId");
        if (stores.length > 0) {
          const selected = storedStoreId 
            ? stores.find((store: { id: string; }) => store.id === storedStoreId) || stores[0]
            : stores[0];
          setSelectedStore(selected);
          setDisplayName(selected.storeName);
          Cookies.set("storeId", selected.id);
        }
      }
    } catch (err) {
      console.error("Error fetching stores:", err);
    }
  };

  const fetchClient = async () => {
    const payload = {
      data: {
        userId: Cookies.get("userId"),
      },
    };
    try {
      const { response } = await BackendRequest(
        `/api/clientDetails/getClientDetailByUserId`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const clientName = response?.response?.data?.displayName;
      setDisplayName(clientName || Cookies.get("name") || "No name found");
    } catch (err) {
      console.error("Error fetching clientDetails:", err);
    }
  };

  const fetchUser = () => {
    const userName = Cookies.get("name");
    setDisplayName(userName || "No name found");
  };

  useEffect(() => {
    if (isLoggedIn) {
      const userRoles = Cookies.get("userRoles");
      let roles: string[] = [];

      try {
        roles = JSON.parse(userRoles || "[]");
      } catch (err) {
        console.error("Error parsing userRoles:", err);
      }

      const hasSuperAdmin = roles.includes("SUPER ADMIN");
      const hasClient = roles.includes("CLIENT");

      const showSwitch = !hasSuperAdmin && !hasClient;
      setShouldShowSwitchIcon(showSwitch);

      if (showSwitch) {
        fetchStores();
      } else if (hasClient) {
        fetchClient();
      } else {
        fetchUser();
      }
    }
  }, [isLoggedIn]);

  return (
    <div className="relative w-full">
      <Navbar className="fixed top-0 left-0 bg-purple-500 shadow-sm border-b border-slate-200 w-full h-13 z-50">
        <NavBody className="flex w-full items-center justify-between px-4">
          {/* LEFT SIDE */}
          <div className="flex items-center">
            {isLoggedIn && (
              <span className="text-3xl font-bold text-white mr-4">
                Welcome {displayName}
              </span>
            )}
          </div>

          {/* RIGHT SIDE */}
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
                <NavbarButton>Settings</NavbarButton>
                <NavbarButton onClick={handleLogout}>Logout</NavbarButton>

                {shouldShowSwitchIcon && (
                  <div className="relative flex items-center gap-2">
                    <div
                      onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
                      className="cursor-pointer"
                    >
                      <Image
                        src={switchIcon}
                        alt="Switch Store"
                        width={25}
                        height={25}
                      />
                    </div>

                    {isStoreDropdownOpen && (
                      <div className="absolute top-10 right-0 bg-white border shadow-md rounded-md z-50 min-w-[150px]">
                        {storeList.length > 0 ? (
                          storeList.map((store, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setSelectedStore(store);
                                setDisplayName(store.storeName);
                                Cookies.set("storeId", store.id);
                                setIsStoreDropdownOpen(false);
                                window.location.reload();
                              }}
                              className={`px-4 py-2 cursor-pointer hover:bg-purple-100 ${
                                selectedStore?.id === store.id
                                  ? "bg-purple-200 font-semibold"
                                  : ""
                              }`}
                            >
                              {store.storeName}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500">
                            No stores found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
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