"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePermissions } from "./use-permissions";
import { useAuth } from "@/context/authContext";
import { LayoutDashboard, ChevronRight, ChevronDown, Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useSidebar } from "@/context/sidebar-context";
import { useRouter } from "next/navigation";

interface SubModule {
  name: string;
  to: string;
  icon?: string;
}

interface HeadModule {
  name: string;
  to: string;
  icon?: string;
  subModules: SubModule[];
}

export default function Sidebar() {
  const { isOpen: isSidebarOpen, toggle } = useSidebar();
  const { response, loading } = usePermissions();
  const [userPermissions, setUserPermissions] = useState<HeadModule[]>([]);
  const [openModules, setOpenModules] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!loading && response?.response?.data?.userPermissions) {
      const permissions = response.response.data.userPermissions;
      const formattedPermissions = permissions.map((perm: any) => ({
        name: perm.headModule?.name ?? "Unnamed Module",
        to: perm.headModule?.to ?? "#",
        icon: perm.headModule?.icon ?? "",
        subModules: (perm.subModules ?? []).map((sub: any) => ({
          name: sub.name ?? "Unnamed Submodule",
          to: sub.to ?? "#",
        })),
      }));
      setUserPermissions(formattedPermissions);
    }
  }, [loading, response]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) return null;
  if (loading) return <div>Loading...</div>;

  const toggleModule = (moduleTo: string) => {
    setOpenModules((prev) => ({
      ...prev,
      [moduleTo]: !prev[moduleTo],
    }));
  };

  return (
    <div className="fixed top-13 left-0 h-[calc(100vh-64px)] z-40">
      {/* Sidebar Toggle Button */}
      <button
        onClick={toggle}
        className="absolute top-4 left-4 z-50 p-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 rounded-lg shadow-sm transition"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-72" : "w-16"
        } transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 text-gray-900 h-full p-4 shadow-md rounded-r-2xl flex flex-col`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 mb-6">
          <LayoutDashboard className="w-6 h-6 text-indigo-500" />
          {isSidebarOpen && (
            <span className="text-xl font-semibold tracking-wide">
            </span>
          )}
        </div>

        {/* Modules */}
        <ul className="flex-1 space-y-1 overflow-y-auto">
          {userPermissions.map((module) => {
            const hasSubModules = module.subModules.length > 0;
            return (
              <li key={module.to}>
                <div
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 transition-all cursor-pointer"
                  onClick={() => hasSubModules && toggleModule(module.to)}
                >
                  <Link
                    href={module.to}
                    className="flex items-center gap-2 w-full"
                  >
                    {module.icon ? (
                      <Image
                        src={module.icon}
                        alt={`${module.name} icon`}
                        width={20}
                        height={20}
                        className="min-w-[20px] min-h-[20px]"
                      />
                    ) : (
                      <LayoutDashboard className="w-5 h-5 text-indigo-500" />
                    )}
                    {isSidebarOpen && <span>{module.name}</span>}
                  </Link>

                  {isSidebarOpen && hasSubModules && (
                    <span className="ml-2">
                      {openModules[module.to] ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </span>
                  )}
                </div>

                {/* Submodules */}
                <AnimatePresence>
                  {openModules[module.to] && hasSubModules && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="ml-6 mt-1 space-y-1 overflow-hidden"
                    >
                      {module.subModules.map((sub) => (
                        <li key={sub.to}>
                          <Link
                            href={sub.to}
                            className="block px-3 py-1 text-sm text-gray-600 rounded-md hover:bg-indigo-50 transition-all"
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <div className="mt-4 border-t border-gray-200 pt-3 text-center text-xs text-gray-400">
          {isSidebarOpen && "Account Settings"}
        </div>
      </div>
    </div>
  );
}