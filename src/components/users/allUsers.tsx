"use client";

import React from "react";
import { useAllUsers, UserData } from "./useAllUsers";
import { useRouter } from "next/navigation";
import { RetailDataTable, Column } from "@/components/ui/retail-data-table";
import { Shield, User, Mail, Phone, Calendar, Key, Settings } from "lucide-react";

export default function AllUsersPage() {
  const router = useRouter();
  const { users, isSubmitting, fetchUsers } = useAllUsers();

  const handleAddNewUser = () => {
    router.push("/addUser");
  };

  const handleManagePermissions = (userId: string) => {
    // Navigate with leading slash to prevent 404 relative path bugs
    router.push(`/all-users/manage-user/${userId}`);
  };

  const columns: Column<UserData>[] = [
    {
      key: "fullName",
      header: "User & Username",
      sortable: true,
      accessor: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-neutral-100 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-500" />
            {item.firstName} {item.lastName}
          </span>
          <span className="text-xs text-slate-400 dark:text-neutral-500 font-mono">
            @{item.username}
          </span>
        </div>
      ),
    },
    {
      key: "emailId",
      header: "Contact Details",
      accessor: (item) => (
        <div className="flex flex-col text-xs space-y-0.5">
          {item.emailId && (
            <span className="flex items-center gap-1 text-slate-700 dark:text-neutral-300">
              <Mail className="w-3 h-3 text-slate-400" /> {item.emailId}
            </span>
          )}
          {item.mobileNo && (
            <span className="flex items-center gap-1 text-slate-400 dark:text-neutral-500">
              <Phone className="w-3 h-3" /> {item.mobileNo}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "roles",
      header: "Assigned Roles",
      accessor: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.roles && item.roles.length > 0 ? (
            item.roles.map((r, idx) => {
              const roleUpper = String(r).toUpperCase();
              const colors: Record<string, string> = {
                "SUPER ADMIN": "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800",
                "CLIENT": "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
                "STORE ADMIN": "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
                "CASHIER": "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
                "STAFF": "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
              };
              return (
                <span
                  key={idx}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${
                    colors[roleUpper] || "bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300 border-slate-200"
                  }`}
                >
                  {r}
                </span>
              );
            })
          ) : (
            <span className="text-xs text-slate-400">Standard User</span>
          )}
        </div>
      ),
    },
    {
      key: "createdOn",
      header: "Joined On",
      sortable: true,
      accessor: (item) => (
        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-neutral-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>{item.createdOn ? new Date(item.createdOn).toLocaleDateString() : "Recent"}</span>
        </div>
      ),
    },
    {
      key: "active",
      header: "Status",
      accessor: (item) => (
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
            item.active
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800"
          }`}
        >
          {item.active ? "Active" : "Suspended"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Access & Permissions",
      accessor: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleManagePermissions(item.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
            title="Configure Granular Module Permissions"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Manage Permissions</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <RetailDataTable
        title="Staff, Users & Role Permissions"
        subtitle="Manage store employees, assigned roles (Cashier, Store Admin, Client), and granular module access control"
        data={users}
        columns={columns}
        loading={isSubmitting}
        onRefresh={() => fetchUsers()}
        onAddNew={handleAddNewUser}
        addNewLabel="Add New Staff / User"
        searchPlaceholder="Search staff by name, username, email, or role..."
        searchFields={["firstName", "lastName", "username", "emailId", "mobileNo"]}
      />
    </div>
  );
}
