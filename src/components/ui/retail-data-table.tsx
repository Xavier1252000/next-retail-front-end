"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Download,
  Plus,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface RetailDataTableProps<T> {
  title: string;
  subtitle?: string;
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchFields?: (keyof T | string)[];
  loading?: boolean;
  onRefresh?: () => void;
  onAddNew?: () => void;
  addNewLabel?: string;
  extraHeaderActions?: React.ReactNode;
  filterComponent?: React.ReactNode;
  itemsPerPageOptions?: number[];
  defaultItemsPerPage?: number;
}

export function RetailDataTable<T extends { id?: string | number }>({
  title,
  subtitle,
  data = [],
  columns,
  searchPlaceholder = "Search records...",
  searchFields = [],
  loading = false,
  onRefresh,
  onAddNew,
  addNewLabel = "Add New",
  extraHeaderActions,
  filterComponent,
  itemsPerPageOptions = [10, 25, 50, 100],
  defaultItemsPerPage = 10,
}: RetailDataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  // 1. Search Filtering
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase().trim();

    return data.filter((item: any) => {
      if (searchFields.length > 0) {
        return searchFields.some((field) => {
          const val = item[field];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(q);
        });
      }
      // Fallback: search across all string/number fields of the object
      return Object.values(item).some((val) => {
        if (typeof val === "string" || typeof val === "number") {
          return String(val).toLowerCase().includes(q);
        }
        return false;
      });
    });
  }, [data, searchQuery, searchFields]);

  // 2. Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const sorted = [...filteredData];
    sorted.sort((a: any, b: any) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (valA === null || valA === undefined) valA = "";
      if (valB === null || valB === undefined) valB = "";

      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }
      return sortOrder === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
    return sorted;
  }, [filteredData, sortKey, sortOrder]);

  // 3. Pagination
  const totalRecords = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / itemsPerPage));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        setSortKey(null);
        setSortOrder("asc");
      }
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const exportCSV = () => {
    if (data.length === 0) return;
    const headerRow = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(",");
    const rows = sortedData.map((item: any) => {
      return columns
        .map((col) => {
          let val = item[col.key];
          if (val === undefined || val === null) val = "";
          if (typeof val === "object") val = JSON.stringify(val);
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(",");
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headerRow, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, "_")}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Banner: Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 md:p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-neutral-100">
              {title}
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
              {totalRecords} records
            </span>
          </div>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-700 transition-colors"
              title="Refresh Records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          )}

          <button
            onClick={exportCSV}
            disabled={totalRecords === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {extraHeaderActions}

          {onAddNew && (
            <button
              onClick={onAddNew}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 active:scale-98 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{addNewLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-3 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm transition-colors">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-8 py-2 text-sm rounded-xl bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {filterComponent}

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-neutral-400">
            <span>Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-neutral-200 text-xs focus:outline-none"
            >
              {itemsPerPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Modern Themed Table Container */}
      <div className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-neutral-800/60 border-b border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 select-none">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key, col.sortable)}
                    className={`px-4 py-3.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
                      col.sortable
                        ? "cursor-pointer hover:bg-slate-100 dark:hover:bg-neutral-800"
                        : ""
                    } ${col.className || ""}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-slate-400 dark:text-neutral-500">
                          {sortKey === col.key ? (
                            sortOrder === "asc" ? (
                              <ChevronUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3.5 h-3.5 opacity-50" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/80 text-slate-800 dark:text-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium text-slate-500 dark:text-neutral-400">
                        Loading retail records...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-neutral-500">
                      <AlertCircle className="w-10 h-10 stroke-[1.5] text-slate-300 dark:text-neutral-600" />
                      <p className="text-sm font-medium text-slate-600 dark:text-neutral-400">
                        {searchQuery ? "No matching records found" : "No records registered yet"}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-neutral-500 max-w-sm">
                        {searchQuery
                          ? `Try adjusting your search terms or filters.`
                          : `Click "${addNewLabel}" above to create your first record.`}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item: any, rowIdx: number) => (
                  <tr
                    key={item.id || rowIdx}
                    className="hover:bg-slate-50/90 dark:hover:bg-neutral-800/50 transition-colors group"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3.5 text-sm align-middle ${col.className || ""}`}
                      >
                        {col.accessor ? col.accessor(item) : item[col.key] ?? "-"}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && totalRecords > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 bg-slate-50/50 dark:bg-neutral-800/30 border-t border-slate-200 dark:border-neutral-800 text-xs text-slate-500 dark:text-neutral-400">
            <div>
              Showing{" "}
              <span className="font-semibold text-slate-700 dark:text-neutral-200">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-700 dark:text-neutral-200">
                {Math.min(currentPage * itemsPerPage, totalRecords)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700 dark:text-neutral-200">
                {totalRecords}
              </span>{" "}
              records
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-neutral-700 font-medium hover:bg-white dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>

              <div className="px-3 py-1.5 font-semibold text-slate-800 dark:text-neutral-200">
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-neutral-700 font-medium hover:bg-white dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
