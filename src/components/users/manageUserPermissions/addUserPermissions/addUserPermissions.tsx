"use client";

import { useAddUserPermissions } from "./useAddUserPermissions";
import { useRouter } from "next/navigation";
import {
  Shield,
  ArrowLeft,
  Check,
  Layers,
  Lock,
  Eye,
  PlusCircle,
  Edit3,
  Trash2,
  Sparkles,
  Ban,
  Info,
} from "lucide-react";

interface AddUserPermissionProps {
  userId: string;
}

const AddUserPermission: React.FC<AddUserPermissionProps> = ({ userId }) => {
  const router = useRouter();
  const {
    allPermissions,
    allModules,
    userModulesPermissions,
    togglePermission,
    setModulePreset,
    setGlobalPreset,
    handleSubmit,
    isSubmitting,
    isLoading,
  } = useAddUserPermissions(userId);

  const headModules = allModules.filter((m) => !m.parentId || m.parentId === "");
  const submodules = allModules.filter((m) => m.parentId && m.parentId !== "");

  const getModulePermissionIds = (moduleId: string): string[] => {
    const entry = userModulesPermissions.find((mp) => mp.moduleId === moduleId);
    return entry ? entry.permissionIds : [];
  };

  const getPermissionIcon = (name: string) => {
    switch (name.toUpperCase()) {
      case "CREATE":
        return <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />;
      case "READ":
        return <Eye className="w-3.5 h-3.5 text-blue-500" />;
      case "UPDATE":
        return <Edit3 className="w-3.5 h-3.5 text-amber-500" />;
      case "DELETE":
        return <Trash2 className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <Shield className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getModuleBadge = (moduleId: string) => {
    const selectedIds = getModulePermissionIds(moduleId);
    const total = allPermissions.length;
    if (selectedIds.length === 0) {
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400">
          No Access (0/{total})
        </span>
      );
    }
    if (selectedIds.length === total) {
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          Full Access ({total}/{total})
        </span>
      );
    }
    const readPerm = allPermissions.find((p) => p.name.toUpperCase() === "READ");
    if (selectedIds.length === 1 && readPerm && selectedIds.includes(readPerm.id)) {
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          View Only (1/{total})
        </span>
      );
    }
    return (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
        Custom ({selectedIds.length}/{total})
      </span>
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-slate-500 dark:text-neutral-400 font-medium">
          Loading permission matrix...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/all-users")}
            className="p-2 rounded-xl text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-700 transition-colors cursor-pointer"
            title="Back to All Users"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-neutral-100">
                User Access & Permissions Control
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Configuring live operational boundaries for User ID:{" "}
              <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{userId}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm shadow-blue-500/20 active:scale-98 disabled:opacity-50 transition-all cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>{isSubmitting ? "Enforcing Matrix..." : "Save & Enforce Permissions"}</span>
        </button>
      </div>

      {/* Permission Explanation & Global Presets Bar */}
      <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-800/40 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-neutral-700/60">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-700 dark:text-neutral-200">
              Functional Permission System:
            </span>
            <span className="text-xs text-slate-500 dark:text-neutral-400 hidden sm:inline">
              Every toggle actively enables or disables real buttons and sidebar routes.
            </span>
          </div>

          {/* Global Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Global Presets:</span>
            <button
              type="button"
              onClick={() => setGlobalPreset("full")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grant All Full Access</span>
            </button>
            <button
              type="button"
              onClick={() => setGlobalPreset("view")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Make All View Only</span>
            </button>
            <button
              type="button"
              onClick={() => setGlobalPreset("none")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-neutral-700 hover:bg-slate-300 dark:hover:bg-neutral-600 text-slate-700 dark:text-neutral-200 text-xs font-semibold transition-all cursor-pointer"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Revoke All</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800">
            <PlusCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <span className="font-bold text-slate-800 dark:text-neutral-200 block text-[11px]">CREATE</span>
              <span className="text-[10px] text-slate-500 dark:text-neutral-400">Add products, bills, records</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800">
            <Eye className="w-4 h-4 text-blue-500 shrink-0" />
            <div>
              <span className="font-bold text-slate-800 dark:text-neutral-200 block text-[11px]">READ</span>
              <span className="text-[10px] text-slate-500 dark:text-neutral-400">View lists and sidebar menus</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800">
            <Edit3 className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <span className="font-bold text-slate-800 dark:text-neutral-200 block text-[11px]">UPDATE</span>
              <span className="text-[10px] text-slate-500 dark:text-neutral-400">Edit info, stock, prices</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800">
            <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
            <div>
              <span className="font-bold text-slate-800 dark:text-neutral-200 block text-[11px]">DELETE</span>
              <span className="text-[10px] text-slate-500 dark:text-neutral-400">Remove records permanently</span>
            </div>
          </div>
        </div>
      </div>

      {/* Permission Modules List */}
      <form onSubmit={onSubmit} className="space-y-6">
        {headModules.map((headModule) => {
          const headPermIds = getModulePermissionIds(headModule.id);
          const relatedSubmodules = submodules.filter(
            (sm) => sm.parentId === headModule.id
          );

          return (
            <div
              key={headModule.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4 transition-colors"
            >
              {/* Head Module Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-neutral-100">
                        {headModule.name}
                      </h3>
                      {getModuleBadge(headModule.id)}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      Route: {headModule.to}
                    </span>
                  </div>
                </div>

                {/* Module-level quick presets */}
                <div className="flex items-center gap-1.5 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => setModulePreset(headModule.id, "full")}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/60 transition-colors cursor-pointer"
                  >
                    Full Access
                  </button>
                  <button
                    type="button"
                    onClick={() => setModulePreset(headModule.id, "view")}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-800/60 transition-colors cursor-pointer"
                  >
                    View Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setModulePreset(headModule.id, "none")}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Head Module Granular Checkboxes */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block mb-2">
                  Head Module Privileges
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {allPermissions.map((permission) => {
                    const isChecked = headPermIds.includes(permission.id);
                    return (
                      <label
                        key={`${headModule.id}-${permission.id}`}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                          isChecked
                            ? "bg-blue-50/80 border-blue-300 dark:bg-blue-950/50 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-semibold shadow-2xs"
                            : "bg-slate-50/70 dark:bg-neutral-800/40 border-slate-200 dark:border-neutral-700/70 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            togglePermission(headModule.id, permission.id)
                          }
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                        />
                        {getPermissionIcon(permission.name)}
                        <span className="text-xs">{permission.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Submodules Section */}
              {relatedSubmodules.length > 0 && (
                <div className="pt-2 space-y-3">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block">
                    Sub-Modules & Pages Access
                  </span>
                  <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-slate-200 dark:border-neutral-800">
                    {relatedSubmodules.map((submodule) => {
                      const subPermIds = getModulePermissionIds(submodule.id);
                      return (
                        <div
                          key={submodule.id}
                          className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-neutral-800/40 border border-slate-200/80 dark:border-neutral-700/60 space-y-2.5"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800 dark:text-neutral-200">
                                {submodule.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({submodule.to})
                              </span>
                              {getModuleBadge(submodule.id)}
                            </div>

                            {/* Submodule quick presets */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setModulePreset(submodule.id, "full")}
                                className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 transition-colors cursor-pointer"
                              >
                                Full
                              </button>
                              <button
                                type="button"
                                onClick={() => setModulePreset(submodule.id, "view")}
                                className="px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-100/70 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 hover:bg-blue-200 transition-colors cursor-pointer"
                              >
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => setModulePreset(submodule.id, "none")}
                                className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-neutral-300 hover:bg-slate-300 transition-colors cursor-pointer"
                              >
                                None
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {allPermissions.map((permission) => {
                              const isChecked = subPermIds.includes(permission.id);
                              return (
                                <label
                                  key={`${submodule.id}-${permission.id}`}
                                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                                    isChecked
                                      ? "bg-blue-50 border-blue-300 dark:bg-blue-950/60 dark:border-blue-700 text-blue-900 dark:text-blue-200 font-medium"
                                      : "bg-white dark:bg-neutral-800/90 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 hover:bg-slate-100"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() =>
                                      togglePermission(submodule.id, permission.id)
                                    }
                                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  />
                                  {getPermissionIcon(permission.name)}
                                  <span>{permission.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Floating / Bottom Save Bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-lg sticky bottom-4 z-20">
          <div className="text-xs text-slate-500 dark:text-neutral-400">
            Changes will take effect immediately upon saving.
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 active:scale-98 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? "Applying & Enforcing..." : "Save All Permissions"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUserPermission;
