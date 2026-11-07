"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePermissions } from "./use-permissions";
import { useAuth } from "@/context/authContext";
import { useUserAccess } from "@/context/permissionsContext";
import {
  LayoutDashboard,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useSidebar } from "@/context/sidebar-context";
import { useRouter } from "next/navigation";

interface SubModule {
  name: string;
  to: string;
  icon?: string;
}

interface HeadModule {
  id: string;
  name: string;
  to: string;
  icon?: string;
  subModules: SubModule[];
}

const DEFAULT_RETAIL_MODULES: HeadModule[] = [
  {
    id: "module-pos",
    name: "POS & Billing",
    to: "/billing/addInvoiceItems",
    subModules: [
      { name: "Quick POS Billing", to: "/billing/addInvoiceItems" },
      { name: "All Invoices Register", to: "/billing/listInvoice" },
      { name: "Returns & Credit Notes", to: "/billing/returns" },
    ],
  },
  {
    id: "module-inventory",
    name: "Catalog & Stock",
    to: "/inventoryManagement/allItems",
    subModules: [
      { name: "All Products", to: "/inventoryManagement/allItems" },
      { name: "Stock & Adjustments", to: "/inventoryManagement/stock" },
      { name: "Purchase Orders (GRN)", to: "/inventoryManagement/purchaseOrders" },
      { name: "Add New Item", to: "/inventoryManagement/addItem" },
      { name: "Categories", to: "/masters/itemCategoryMaster/allItemCategoryMasters" },
      { name: "Units of Measure", to: "/masters/unitMaster/allUnitMasters" },
      { name: "Price Lists & Tiers", to: "/masters/priceListMaster/allPriceLists" },
    ],
  },
  {
    id: "module-crm",
    name: "Customers & Vendors",
    to: "/masters/customerMaster/allCustomers",
    subModules: [
      { name: "Customers CRM", to: "/masters/customerMaster/allCustomers" },
      { name: "Suppliers / Vendors", to: "/masters/supplierMaster/allSuppliers" },
    ],
  },
  {
    id: "module-masters",
    name: "Reports & Settings",
    to: "/reports",
    subModules: [
      { name: "Daily Audits & X/Z Reports", to: "/reports" },
      { name: "Store & POS Settings", to: "/settings" },
      { name: "Stores & Warehouses", to: "/masters/storeMaster/allStores" },
      { name: "Tax Master (GST)", to: "/masters/taxMaster/taxMasterByStoreId" },
      { name: "Discounts & Coupons", to: "/masters/discountMaster/allDiscountMasters" },
    ],
  },
  {
    id: "module-users",
    name: "Staff & Users",
    to: "/all-users",
    subModules: [
      { name: "All Users", to: "/all-users" },
      { name: "Add User", to: "/addUser" },
    ],
  },
];

export default function Sidebar() {
  const { isOpen: isSidebarOpen, toggle, close } = useSidebar();
  const { can, isSuperAdminOrClient, userPermissions: rawPermissions, loading } = useUserAccess();
  const [userPermissions, setUserPermissions] = useState<HeadModule[]>([]);
  const [openModules, setOpenModules] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isSuperAdminOrClient) {
        setUserPermissions(DEFAULT_RETAIL_MODULES);
        return;
      }

      // Filter submodules and head modules based on user's granular READ access
      const filtered = DEFAULT_RETAIL_MODULES.map((head) => {
        const accessibleSubs = head.subModules.filter((sub) => can(sub.to, "READ"));
        return {
          ...head,
          subModules: accessibleSubs,
        };
      }).filter((head) => head.subModules.length > 0 || can(head.to, "READ"));

      setUserPermissions(filtered);
    }
  }, [loading, isSuperAdminOrClient, can, rawPermissions]);

  if (!isLoggedIn) return null;
  if (loading) {
    return (
      <div className="fixed top-14 left-0 h-[calc(100vh-56px)] w-16 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 p-4 z-40 animate-pulse" />
    );
  }

  const toggleModule = (id: string) => {
    setOpenModules((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <>
      {/* Mobile Dim Overlay - Closes on Click Outside */}
      {isSidebarOpen && (
        <div
          onClick={close}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <div
        className={`fixed top-14 left-0 h-[calc(100vh-56px)] z-50 transition-all duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Desktop Toggle Button */}
        <button
          onClick={toggle}
          className="absolute top-4 left-4 z-50 p-2 hidden md:flex bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg shadow-sm transition-colors cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          <Menu size={18} />
        </button>

        {/* Sidebar */}
        <div
          className={`${
            isSidebarOpen ? "w-64" : "w-0 md:w-16"
          } transition-all duration-300 overflow-hidden bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 h-full p-4 shadow-xl md:shadow-sm flex flex-col`}
        >
          {/* Logo / Header space + Mobile Close Button */}
          <div className="flex items-center justify-between px-2 mb-6">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              {isSidebarOpen && (
                <span className="text-sm font-semibold tracking-wide text-neutral-600 dark:text-neutral-400 uppercase">
                  Navigation
                </span>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={close}
              className="md:hidden p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

        {/* Modules */}
        <ul className="flex-1 space-y-1 overflow-y-auto">
          {userPermissions.map((module) => {
            const hasSubModules = module.subModules.length > 0;
            return (
              <li key={module.id}>
                <div
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer text-sm"
                  onClick={() => hasSubModules && toggleModule(module.id)}
                >
                  <Link
                    href={module.to}
                    className="flex items-center gap-2.5 w-full text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {module.icon ? (
                      <Image
                        src={module.icon}
                        alt={`${module.name} icon`}
                        width={18}
                        height={18}
                        className="min-w-[18px] min-h-[18px]"
                      />
                    ) : (
                      <LayoutDashboard className="w-4 h-4 text-blue-500 shrink-0" />
                    )}
                    {isSidebarOpen && (
                      <span className="font-medium truncate">{module.name}</span>
                    )}
                  </Link>

                  {isSidebarOpen && hasSubModules && (
                    <span className="ml-2 text-neutral-400">
                      {openModules[module.id] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </div>

                {/* Submodules */}
                <AnimatePresence>
                  {openModules[module.id] && hasSubModules && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-6 mt-1 space-y-1 overflow-hidden"
                    >
                      {module.subModules.map((sub) => (
                        <li key={sub.to}>
                          <Link
                            href={sub.to}
                            className="block px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
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
        <div className="mt-4 border-t border-neutral-200 dark:border-neutral-800 pt-3 text-center text-xs text-neutral-400 dark:text-neutral-500">
          {isSidebarOpen && <span>Surge Retail v1.0</span>}
        </div>
      </div>
    </div>
    </>
  );
}
