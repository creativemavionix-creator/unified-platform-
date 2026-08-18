"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpDown, ChevronLeft, ChevronRight, Eye, EyeOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface DataColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataColumn<T>[];
  filterPlaceholder?: string;
  filterKey?: string;
  pageSize?: number;
}

export function DataTable<T extends object>({
  data,
  columns,
  filterPlaceholder = "Filter data...",
  filterKey,
  pageSize = 5,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.map((c) => c.key)
  );
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);

  // Filter rows
  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || !filterKey) return data;
    return data.filter((row) => {
      const val = (row as Record<string, unknown>)[filterKey];
      if (val === undefined || val === null) return false;
      return String(val).toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [data, searchQuery, filterKey]);

  // Sort rows
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const sorted = [...filteredData].sort((a, b) => {
      const valA = (a as Record<string, unknown>)[sortKey];
      const valB = (b as Record<string, unknown>)[sortKey];
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredData, sortKey, sortOrder]);

  // Paginate rows
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const toggleColumn = (key: string) => {
    if (visibleColumns.includes(key)) {
      if (visibleColumns.length > 1) {
        setVisibleColumns(visibleColumns.filter((k) => k !== key));
      }
    } else {
      setVisibleColumns([...visibleColumns, key]);
    }
  };

  const activeColumns = columns.filter((col) => visibleColumns.includes(col.key));

  return (
    <div className="space-y-3 font-sans text-scale-xs">
      {/* Table Actions Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center relative z-25">
        {filterKey ? (
          <div className="flex items-center gap-2 bg-void/50 border border-border/40 p-1.5 rounded-lg w-full sm:max-w-xs relative z-10">
            <Search className="w-3.5 h-3.5 text-muted-foreground pl-1 shrink-0" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={filterPlaceholder}
              className="bg-transparent border-0 h-6 p-0 text-scale-xs focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        ) : (
          <div />
        )}

        <div className="relative shrink-0 w-full sm:w-auto flex justify-end">
          <Button
            variant="outline"
            onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
            className="border-border/60 hover:bg-surface text-bone text-scale-xs h-8 flex items-center gap-1.5 bg-void/35"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Columns ({visibleColumns.length})</span>
          </Button>

          {showVisibilityMenu && (
            <div className="absolute right-0 top-9 bg-surface border border-border/60 rounded-lg p-2 shadow-2xl w-44 space-y-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider border-b border-border/20 pb-1 mb-1 px-1.5">
                Toggle Columns
              </p>
              {columns.map((col) => {
                const isVisible = visibleColumns.includes(col.key);
                return (
                  <button
                    key={col.key}
                    onClick={() => toggleColumn(col.key)}
                    className="flex items-center gap-2 w-full px-1.5 py-1 rounded hover:bg-void/40 text-left text-scale-xs text-bone transition-colors"
                  >
                    {isVisible ? (
                      <Eye className="w-3 h-3 text-signal" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-muted-foreground" />
                    )}
                    <span className={cn(isVisible ? "text-bone" : "text-muted-foreground")}>{col.header}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid table — desktop */}
      <div className="hidden sm:block border border-border/40 rounded-lg overflow-hidden bg-void/50 shadow-inner relative z-10">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface border-b border-border/40 font-display font-semibold text-bone text-[10px] uppercase tracking-wider">
            <tr>
              {activeColumns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-2.5"
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1 hover:text-signal transition-colors font-semibold"
                    >
                      <span>{col.header}</span>
                      <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    </button>
                  ) : (
                    <span>{col.header}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20 text-scale-xs font-sans text-bone">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={activeColumns.length}
                  className="px-4 py-8 text-center text-muted-foreground font-mono"
                >
                  No records matching workspace query.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-surface/20 transition-colors">
                  {activeColumns.map((col) => (
                    <td key={col.key} className="px-4 py-2 text-muted-foreground max-w-[240px] truncate">
                      {col.render ? col.render(row) : ((row as Record<string, unknown>)[col.key] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards — visible only on small screens */}
      <div className="sm:hidden space-y-3 relative z-10">
        {paginatedData.length === 0 ? (
          <div className="border border-border/40 rounded-xl p-6 text-center text-muted-foreground font-mono text-scale-xs bg-void/50">
            No records matching query.
          </div>
        ) : (
          paginatedData.map((row, idx) => (
            <div key={idx} className="border border-border/40 rounded-xl bg-void/50 p-4 space-y-2">
              {activeColumns.map((col) => (
                <div key={col.key} className="flex justify-between items-start gap-2 text-scale-xs">
                  <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider shrink-0">{col.header}</span>
                  <span className="text-bone text-right truncate max-w-[60%]">
                    {col.render ? col.render(row) : ((row as Record<string, unknown>)[col.key] as React.ReactNode)}
                  </span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono pt-1">
        <span>
          Showing {sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
          {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
        </span>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="border-border/60 text-bone hover:bg-surface w-7 h-7 p-0 rounded"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="border-border/60 text-bone hover:bg-surface w-7 h-7 p-0 rounded"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
