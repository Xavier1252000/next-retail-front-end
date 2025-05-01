"use client";

import { useAddUserPermissions } from "./useAddUserPermissions";
import { useEffect, useState } from "react";

interface AddUserPermissionProps {
  userId: string;
}

const AddUserPermission: React.FC<AddUserPermissionProps> = ({ userId }) => {
  const {
    allPermissions,
    allModules,
    userModulesPermissions,
    togglePermission,
    handleSubmit,
    isSubmitting,
    isLoading,
  } = useAddUserPermissions(userId);

  const [modulePermissions, setModulePermissions] = useState<
    { moduleId: string; permissionIds: string[] }[]
  >([]);

  const headModules = allModules.filter((m) => m.parentId === "");
  const submodules = allModules.filter((m) => m.parentId !== "");

  useEffect(() => {
    if (userModulesPermissions.length > 0) {
      const formattedPermissions = allModules.map((module) => {
        const userPerm = userModulesPermissions.find(
          (perm) => perm.moduleId === module.id
        );
        return {
          moduleId: module.id,
          permissionIds: userPerm ? userPerm.permissionIds : [],
        };
      });
      setModulePermissions(formattedPermissions);
    } else {
      setModulePermissions(
        allModules.map((module) => ({
          moduleId: module.id,
          permissionIds: [],
        }))
      );
    }
  }, [userModulesPermissions, allModules]);

  const handleToggle = (moduleId: string, permissionId: string) => {
    togglePermission(moduleId, permissionId);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-xl shadow-xl">
      <h2 className="text-3xl font-bold text-purple-700 mb-8">
        Manage User Permissions
      </h2>
      <form onSubmit={onSubmit} className="space-y-10">
        {headModules.map((headModule) => {
          const headPerms = modulePermissions.find(
            (mp) => mp.moduleId === headModule.id
          );
          const relatedSubmodules = submodules.filter(
            (sm) => sm.parentId === headModule.id
          );

          return (
            <div
              key={headModule.id}
              className="border border-purple-300 rounded-xl p-6 bg-purple-50"
            >
              <h3 className="text-xl font-semibold text-purple-700 mb-4">
                {headModule.name}
              </h3>

              {/* Head Module Permissions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {allPermissions.map((permission) => (
                  <label
                    key={`${headModule.id}-${permission.id}`}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      checked={
                        headPerms?.permissionIds.includes(permission.id) || false
                      }
                      onChange={() =>
                        handleToggle(headModule.id, permission.id)
                      }
                      className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-800">{permission.name}</span>
                  </label>
                ))}
              </div>

              {/* Submodules */}
              {relatedSubmodules.length > 0 && (
                <div className="ml-4 space-y-6">
                  {relatedSubmodules.map((submodule) => {
                    const subPerms = modulePermissions.find(
                      (mp) => mp.moduleId === submodule.id
                    );
                    return (
                      <div
                        key={submodule.id}
                        className="p-4 rounded-md bg-white border border-purple-200 shadow-sm"
                      >
                        <h4 className="text-lg font-medium text-purple-600 mb-2">
                          {submodule.name}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {allPermissions.map((permission) => (
                            <label
                              key={`${submodule.id}-${permission.id}`}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                checked={
                                  subPerms?.permissionIds.includes(
                                    permission.id
                                  ) || false
                                }
                                onChange={() =>
                                  handleToggle(submodule.id, permission.id)
                                }
                                className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <span className="text-gray-700">
                                {permission.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-md text-white font-semibold bg-purple-600 hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Saving..." : "Save Permissions"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUserPermission;
