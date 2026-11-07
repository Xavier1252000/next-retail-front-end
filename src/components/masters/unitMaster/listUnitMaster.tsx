"use client";

import React, { useEffect, useState } from "react";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import { useToast } from "@/context/toast-context";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { RetailDataTable, Column } from "@/components/ui/retail-data-table";
import { Scale, Edit2 } from "lucide-react";

export interface UnitData {
  id: string;
  unit: string;
  unitNotation: string;
  active: boolean;
}

export default function AllUnitMasters() {
  const [units, setUnits] = useState<UnitData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const fetchUnits = async () => {
    setIsLoading(true);
    const storeId = Cookies.get("storeId");
    const payload = {
      data: {
        storeIds: storeId ? [storeId] : [],
      },
    };

    try {
      const { response, status } = await BackendRequest(
        "/api/masters/unitMaster/getUnitMaster",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      if (status === 200) {
        setUnits(response?.response?.data || response?.data || []);
      } else {
        setUnits([]);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
      showToast("Something went wrong while fetching units", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const changeUnitStatus = async (id: string) => {
    const unit = units.find((u) => u.id === id);
    if (!unit) return;

    try {
      const { response, status } = await BackendRequest(
        `/api/masters/unitMaster/unitMasterStatusChange/${id}`,
        { method: "GET" }
      );

      if (status === 200) {
        showToast("Status updated successfully", "success");
        fetchUnits();
      } else {
        showToast("Failed to change status", "error");
      }
    } catch (error) {
      showToast("Something went wrong", "error");
    }
  };

  const columns: Column<UnitData>[] = [
    {
      key: "unit",
      header: "Unit of Measure",
      sortable: true,
      accessor: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-neutral-100 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-blue-500" />
            {item.unit}
          </span>
          <span className="text-xs text-slate-400 dark:text-neutral-500">
            Standard retail measure
          </span>
        </div>
      ),
    },
    {
      key: "unitNotation",
      header: "Symbol / Abbreviation",
      sortable: true,
      accessor: (item) => (
        <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          {item.unitNotation}
        </span>
      ),
    },
    {
      key: "active",
      header: "Status Toggle",
      accessor: (item) => (
        <button
          onClick={() => changeUnitStatus(item.id)}
          className={`px-3 py-1 text-xs font-semibold rounded-full border cursor-pointer transition-all ${
            item.active
              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
              : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-100"
          }`}
          title="Click to toggle active status"
        >
          {item.active ? "Active" : "Inactive"}
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      accessor: (item) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => router.push(`/masters/unitMaster/updateUnitMaster/${item.id}`)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
            title="Edit Unit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <RetailDataTable
        title="Units of Measure Master"
        subtitle="Manage inventory packaging units (Pieces, Boxes, Kilograms, Liters, Meters) and abbreviations"
        data={units}
        columns={columns}
        loading={isLoading}
        onRefresh={fetchUnits}
        onAddNew={() => router.push("/masters/unitMaster/addUnitMaster")}
        addNewLabel="Add Unit"
        searchPlaceholder="Search unit name or abbreviation..."
        searchFields={["unit", "unitNotation"]}
      />
    </div>
  );
}
