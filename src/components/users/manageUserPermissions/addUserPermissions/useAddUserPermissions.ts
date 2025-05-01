"use client";

import { useToast } from "@/context/toast-context";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export interface Permission {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface Module {
  id: string;
  name: string;
  to: string;
  serialNo: number;
  icon: string;
  parentId: string;
  createdOn: string;
  modifiedOn: string;
  createdBy: string;
  modifiedBy: string;
  active: boolean;
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
    subModules: Module[];
  }[];
}

export interface AddOrUpdateUserPermissionsResponseType {
  userId: string;
  modulesPermissions: ModulePermissionPayload[];
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
          {
            method: "GET",
          }
        );

        if (status === 200 && response?.response?.data) {
          setAllPermissions(response.response.data);
        } else {
          showToast("Failed to fetch permissions.", "error");
        }
      } catch (error: any) {
        showToast(
          "Error fetching permissions",
          error.message || error.toString()
        );
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
          {
            method: "GET",
          }
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
          data: {
            userId,
          },
        };

        const { response, status } = await BackendRequest(
          "/api/permissions/getUserPermissions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (status === 200 && response?.response?.data) {
          const data: GetUserPermissionsResponseType = response.response.data;
          // Transform the data to ModulePermissionPayload format
          const transformedPermissions: ModulePermissionPayload[] =
            data.userPermissions.flatMap((perm) => {
              const headModulePerm: ModulePermissionPayload = {
                moduleId: perm.headModule.id,
                permissionIds: perm.permissions,
              };
              const subModulePerms: ModulePermissionPayload[] =
                perm.subModules.map((subModule) => ({
                  moduleId: subModule.id,
                  permissionIds: perm.permissions, // Submodules inherit head module permissions
                }));
              return [headModulePerm, ...subModulePerms];
            });
          setUserModulesPermissions(transformedPermissions);
        } else {
          showToast("No existing permissions found for user.");
          setUserModulesPermissions([]);
        }
      } catch (error: any) {
        showToast(
          "Error fetching user permissions",
          error.message || error.toString()
        );
        setUserModulesPermissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserPermissions();
    }
  }, [userId, showToast]);

  // Toggle a permission for a specific module
  const togglePermission = (moduleId: string, permissionId: string) => {
    setUserModulesPermissions((prev) => {
      const index = prev.findIndex((mp) => mp.moduleId === moduleId);
      if (index === -1) {
        return [...prev, { moduleId, permissionIds: [permissionId] }];
      }

      const existing = prev[index];
      const alreadySelected = existing.permissionIds.includes(permissionId);

      const updatedPermissions = alreadySelected
        ? existing.permissionIds.filter((id) => id !== permissionId)
        : [...existing.permissionIds, permissionId];

      const updated = [...prev];
      updated[index] = { ...existing, permissionIds: updatedPermissions };
      return updated;
    });
  };

  // Submit module-permission assignments (add or update)
  const handleSubmit = async () => {
    setIsSubmitting(true);

    const payload = {
      data: {
        userId: userId,
        modulesPermissions: userModulesPermissions,
      },
    };

    try {
      // Check if user already has permissions to decide between add or update
      const { response: checkResponse, status: checkStatus } =
        await BackendRequest("/api/permissions/getUserPermissions", {
          method: "POST",
          body: JSON.stringify({ data: { userId } }),
        });

      const hasExistingPermissions =
        checkStatus === 200 &&
        Array.isArray(checkResponse?.response?.data.userPermissions) &&
        checkResponse.response.data.userPermissions.length > 0;

      const endpoint = hasExistingPermissions
        ? "/api/permissions/updateUserPermissions"
        : "/api/permissions/addUserPermissions";

      const { response, status } = await BackendRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (status === 201 || status === 200) {
        showToast(
          response?.response?.message || "Permissions updated successfully!",
          "success"
        );
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
    handleSubmit,
    isSubmitting,
    isLoading,
  };
};