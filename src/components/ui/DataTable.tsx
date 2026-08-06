"use client";
import { Loader2, Inbox } from "lucide-react";

export type Column<T> = {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
};

export function DataTable<T>({
  columns,
  rows,
  loading,
  empty = "Belum ada data",
  onRowClick,
}: {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  empty?: string;
  onRowClick?: (row: T) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800">
            {columns.map((c, i) => (
              <th
                key={i}
                className={`text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${c.className || ""}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                Memuat data...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-slate-400">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row, ri) => (
              <tr
                key={ri}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-darkcard/60 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((c, ci) => (
                  <td key={ci} className={`px-4 py-3 dark:text-slate-200 ${c.className || ""}`}>
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
