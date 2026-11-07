"use client";

import { useToast } from "@/context/toast-context";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import { useState, useEffect, useCallback } from "react";

export interface Permission {
  id: string;
  name: string;
  description: string;
  active?: boolean;
}

export interface Module {
  id: string;
  name: string;
  to: string;
  serialNo: number;
  icon?: string;
  parentId: string;
  createdOn?: string;
  modifiedOn?: string;
  createdBy?: string;
  modifiedBy?: string;
  active?: boolean;
}

export interface ModulePermissionPayload {
  moduleId: string;
  permissionIds: string[];
}

export interface GetUserPermissionsResponseType {
  userId: string;
  userPermissions: {
    headModule: Module;
    permissions: string[];
    permissionNames?: string[];
    subModules: (Module & { permissions?: string[]; permissionNames?: string[] })[];
  }[];
}

export const useAddUserPermissions = (userId: string) => {
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [userModulesPermissions, setUserModulesPermissions] = useState<
    ModulePermissionPayload[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Fetch all available permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const { response, status } = await BackendRequest(
          "/api/permissions/getAllPermissions",
          { method: "GET" }
        );

        if (status === 200 && response?.response?.data) {
          setAllPermissions(response.response.data);
        } else {
          showToast("Failed to fetch permissions.", "error");
        }
      } catch (error: any) {
        showToast("Error fetching permissions", error.message || error.toString());
      }
    };

    fetchPermissions();
  }, [showToast]);

  // Fetch all available modules
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const { response, status } = await BackendRequest(
          "/api/permissions/modules/getAllModules",
          { method: "GET" }
        );

        if (status === 200 && response?.response?.data) {
          setAllModules(response.response.data);
        } else {
          showToast("Failed to fetch modules.", "error");
        }
      } catch (error: any) {
        showToast("Error fetching modules", error.message || error.toString());
      }
    };

    fetchModules();
  }, [showToast]);

  // Fetch existing user permissions
  useEffect(() => {
    const fetchUserPermissions = async () => {
      setIsLoading(true);
      try {
        const payload = {
          data: { userId },
        };

        const { response, status } = await BackendRequest(
          "/api/permissions/getUserPermissions",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (status === 200 && response?.response?.data) {
          const data: GetUserPermissionsResponseType = response.response.data;
          const userPerms = data.userPermissions || [];

          const transformedPermissions: ModulePermissionPayload[] = [];
          for (const node of userPerms) {
            if (node.headModule?.id) {
              transformedPermissions.push({
                moduleId: node.headModule.id,
                permissionIds: node.permissions || [],
              });
            }
            for (const sub of node.subModules || []) {
              if (sub.id) {
                transformedPermissions.push({
                  moduleId: sub.id,
                  permissionIds: sub.permissions || node.permissions || [],
                });
              }
            }
          }
          setUserModulesPermissions(transformedPermissions);
        } else {
          setUserModulesPermissions([]);
        }
      } catch (error: any) {
        showToast("Error fetching user permissions", error.message || error.toString());
        setUserModulesPermissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserPermissions();
    }
  }, [userId, showToast]);

  // Toggle a permission for a specific module with smart READ auto-inclusion
  const togglePermission = useCallback(
    (moduleId: string, permissionId: string) => {
      const readPerm = allPermissions.find((p) => p.name.toUpperCase() === "READ");
      const readId = readPerm?.id;

      setUserModulesPermissions((prev) => {
        const index = prev.findIndex((mp) => mp.moduleId === moduleId);
        const existingIds = index !== -1 ? prev[index].permissionIds : [];
        const alreadySelected = existingIds.includes(permissionId);

        let newIds: string[];
        if (alreadySelected) {
          newIds = existingIds.filter((id) => id !== permissionId);
          // If unchecking READ, also clear others since you can't create/update/delete without read
          if (permissionId === readId) {
            newIds = [];
          }
        } else {
          newIds = [...existingIds, permissionId];
          // If checking CREATE, UPDATE, or DELETE, automatically ensure READ is enabled
          if (readId && !newIds.includes(readId)) {
            newIds.push(readId);
          }
        }

        const updated = [...prev];
        if (index === -1) {
          updated.push({ moduleId, permissionIds: newIds });
        } else {
          updated[index] = { ...prev[index], permissionIds: newIds };
        }
        return updated;
      });
    },
    [allPermissions]
  );

  // Set quick preset for a specific module: 'full' | 'view' | 'none'
  const setModulePreset = useCallback(
    (moduleId: string, preset: "full" | "view" | "none") => {
      const readPerm = allPermissions.find((p) => p.name.toUpperCase() === "READ");
      let targetIds: string[] = [];

      if (preset === "full") {
        targetIds = allPermissions.map((p) => p.id);
      } else if (preset === "view" && readPerm) {
        targetIds = [readPerm.id];
      } else {
        targetIds = [];
      }

      setUserModulesPermissions((prev) => {
        const index = prev.findIndex((mp) => mp.moduleId === moduleId);
        const updated = [...prev];
        if (index === -1) {
          updated.push({ moduleId, permissionIds: targetIds });
        } else {
          updated[index] = { moduleId, permissionIds: targetIds };
        }
        return updated;
      });
    },
    [allPermissions]
  );

  // Set global quick preset across all modules: 'full' | 'view' | 'none'
  const setGlobalPreset = useCallback(
    (preset: "full" | "view" | "none") => {
      const readPerm = allPermissions.find((p) => p.name.toUpperCase() === "READ");
      let defaultIds: string[] = [];

      if (preset === "full") {
        defaultIds = allPermissions.map((p) => p.id);
      } else if (preset === "view" && readPerm) {
        defaultIds = [readPerm.id];
      } else {
        defaultIds = [];
      }

      const updated = allModules.map((m) => ({
        moduleId: m.id,
        permissionIds: defaultIds,
      }));

      setUserModulesPermissions(updated);
    },
    [allModules, allPermissions]
  );

  // Submit module-permission assignments (add or update)
  const handleSubmit = async () => {
    setIsSubmitting(true);

    const activePermissions = userModulesPermissions.filter(
      (mp) => mp.permissionIds.length !== 0
    );

    const payload = {
      data: {
        userId,
        modulesPermissions: activePermissions,
      },
    };

    try {
      const { response, status } = await BackendRequest(
        "/api/permissions/updateUserPermissions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (status === 201 || status === 200) {
        showToast("Permissions updated and enforced successfully!", "success");
      } else {
        showToast(
          response?.response?.message || "Failed to update permissions.",
          "error"
        );
      }
    } catch (error: any) {
      showToast("Error updating permissions", error.message || error.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    allPermissions,
    allModules,
    userModulesPermissions,
    togglePermission,
    setModulePreset,
    setGlobalPreset,
    handleSubmit,
    isSubmitting,
    isLoading,
  };
};
