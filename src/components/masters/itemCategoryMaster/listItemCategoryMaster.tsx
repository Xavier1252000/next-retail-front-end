"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { RetailDataTable, Column } from "@/components/ui/retail-data-table";
import { useToast } from "@/context/toast-context";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import { FolderTree, Trash2, Edit2, Layers } from "lucide-react";

export interface ItemCategoryData {
  id: string;
  storeIds?: string[];
  categoryName: string;
  parentCategoryId?: string;
  description?: string;
}

export default function AllItemCategoryMasters() {
  const [categories, setCategories] = useState<ItemCategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const fetchItemCategories = async () => {
    setIsLoading(true);
    const storeId = Cookies.get("storeId");
    const payload = {
      data: {
        storeIds: storeId ? [storeId] : [],
      },
    };

    try {
      const { response, status } = await BackendRequest(
        "/api/masters/itemCategoryMaster/getAllItemCategoryMaster",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      if (status === 200) {
        setCategories(response?.response?.data || response?.data || []);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      showToast("Something went wrong while fetching categories", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItemCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const { status } = await BackendRequest(
        "/api/masters/itemCategoryMaster/deleteCategoryDirect",
        {
          method: "POST",
          body: JSON.stringify({ id }),
        }
      );

      if (status === 200) {
        showToast("Category deleted successfully", "success");
        fetchItemCategories();
      } else {
        showToast("Failed to delete category", "error");
      }
    } catch (error) {
      showToast("Error deleting category", "error");
    }
  };

  const columns: Column<ItemCategoryData>[] = [
    {
      key: "categoryName",
      header: "Category Name",
      sortable: true,
      accessor: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-neutral-100 flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5 text-blue-500" />
            {item.categoryName}
          </span>
          <span className="text-xs text-slate-400 dark:text-neutral-500">
            {item.description || "Retail item category"}
          </span>
        </div>
      ),
    },
    {
      key: "parentCategoryId",
      header: "Parent Category",
      sortable: true,
      accessor: (item) => {
        if (!item.parentCategoryId) {
          return (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300">
              Root Level Category
            </span>
          );
        }
        return (
          <span className="px-2 py-0.5 text-xs font-mono rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Subcategory
          </span>
        );
      },
    },
    {
      key: "description",
      header: "Description",
      accessor: (item) => (
        <span className="text-xs text-slate-600 dark:text-neutral-400">
          {item.description || "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (item) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleDelete(item.id)}
            className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
            title="Delete Category"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <RetailDataTable
        title="Product Categories Master"
        subtitle="Organize retail inventory hierarchy, product groups, and department classification"
        data={categories}
        columns={columns}
        loading={isLoading}
        onRefresh={fetchItemCategories}
        onAddNew={() => router.push("/masters/itemCategoryMaster/addItemCategoryMaster")}
        addNewLabel="Add Category"
        searchPlaceholder="Search category name or description..."
        searchFields={["categoryName", "description"]}
      />
    </div>
  );
}
