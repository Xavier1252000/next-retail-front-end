"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import Cookies from "js-cookie";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import { useAuth } from "./authContext";

export type PermissionAction = "CREATE" | "READ" | "UPDATE" | "DELETE";

export interface PermissionNode {
  headModule: {
    id: string;
    name: string;
    to: string;
    icon?: string;
  };
  permissions: string[];
  permissionNames?: string[];
  subModules: {
    id: string;
    name: string;
    to: string;
    permissions?: string[];
    permissionNames?: string[];
  }[];
}

interface PermissionsContextType {
  userPermissions: PermissionNode[];
  loading: boolean;
  can: (modulePathOrName: string, action?: PermissionAction) => boolean;
  hasAccess: (modulePathOrName: string, action?: PermissionAction) => boolean;
  isSuperAdminOrClient: boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoggedIn } = useAuth();
  const [userPermissions, setUserPermissions] = useState<PermissionNode[]>([]);
  const [loading, setLoading] = useState(true);

  const roles = useMemo(() => user?.roles || [], [user]);
  const isSuperAdminOrClient = useMemo(
    () => roles.includes("SUPER ADMIN") || roles.includes("CLIENT"),
    [roles]
  );

  const fetchPermissions = useCallback(async () => {
    const userId = Cookies.get("userId") || user?.id;
    if (!userId || !isLoggedIn) {
      setUserPermissions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { response, status } = await BackendRequest(
        "/api/permissions/getUserPermissions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: { userId } }),
        }
      );

      if (status === 200 && response?.response?.data?.userPermissions) {
        setUserPermissions(response.response.data.userPermissions);
      } else {
        setUserPermissions([]);
      }
    } catch (error) {
      console.warn("Could not fetch user permissions, using role defaults:", error);
      setUserPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isLoggedIn]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  /**
   * Evaluates if the current user can perform an action (CREATE, READ, UPDATE, DELETE)
   * on a given module or sub-module path/name.
   */
  const can = useCallback(
    (modulePathOrName: string, action: PermissionAction = "READ"): boolean => {
      // 1. Super Admins and Business Client owners have bypass access to everything
      if (isSuperAdminOrClient) {
        return true;
      }

      // 2. If no custom permissions configured yet in DB, default to granting read/create for operational staff
      if (userPermissions.length === 0) {
        // Staff without an explicit restrictive matrix can read & create, but not delete
        if (action === "DELETE") return false;
        return true;
      }

      const target = modulePathOrName.trim().toLowerCase();

      // 3. Search through permission tree
      for (const node of userPermissions) {
        const headTo = (node.headModule?.to || "").toLowerCase();
        const headName = (node.headModule?.name || "").toLowerCase();

        // Check if matching head module
        const isHeadMatch =
          headTo === target ||
          headName === target ||
          (target.length > 2 && headTo.includes(target)) ||
          (headName.length > 2 && target.includes(headName));

        // Check submodules
        for (const sub of node.subModules || []) {
          const subTo = (sub.to || "").toLowerCase();
          const subName = (sub.name || "").toLowerCase();

          const isSubMatch =
            subTo === target ||
            subName === target ||
            (target.length > 2 && subTo.includes(target)) ||
            (subName.length > 2 && target.includes(subName));

          if (isSubMatch) {
            const subPermNames = sub.permissionNames || node.permissionNames || [];
            if (subPermNames.length === 0) return true;
            return subPermNames.map((p) => p.toUpperCase()).includes(action.toUpperCase());
          }
        }

        if (isHeadMatch) {
          const headPermNames = node.permissionNames || [];
          if (headPermNames.length === 0) return true;
          return headPermNames.map((p) => p.toUpperCase()).includes(action.toUpperCase());
        }
      }

      // If user has a configured permissions matrix but this module wasn't included, access is denied
      return false;
    },
    [isSuperAdminOrClient, userPermissions]
  );

  const value = useMemo(
    () => ({
      userPermissions,
      loading,
      can,
      hasAccess: can,
      isSuperAdminOrClient,
      refreshPermissions: fetchPermissions,
    }),
    [userPermissions, loading, can, isSuperAdminOrClient, fetchPermissions]
  );

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
};

export const useUserAccess = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("useUserAccess must be used within a PermissionsProvider");
  }
  return context;
};

/**
 * Declarative component to show/hide UI sections based on user permissions
 */
export const PermissionGate: React.FC<{
  module: string;
  action?: PermissionAction;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ module, action = "READ", fallback = null, children }) => {
  const { can } = useUserAccess();
  if (can(module, action)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
};
