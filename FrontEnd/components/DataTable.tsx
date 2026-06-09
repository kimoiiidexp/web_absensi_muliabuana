"use client";

import type { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export default function DataTable<T extends { id?: number | string }>({
  columns,
  data,
  emptyText = "Tidak ada data",
}: {
  columns: Column<T>[];
  data: T[];
  emptyText?: string;
}) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center text-[#230d7d]/60 border border-[#4187b3]/10">
        {emptyText}
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block bg-white rounded-2xl border border-[#4187b3]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-[#eef5fb] border-b border-[#4187b3]/10">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="py-3 px-4 text-left text-sm font-semibold text-[#230d7d]"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.id ?? i} className="border-b border-[#4187b3]/5 hover:bg-[#eef5fb]/50">
                  {columns.map((col) => (
                    <td key={col.key} className={`py-3 px-4 text-sm text-[#230d7d] ${col.className || ""}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {data.map((row, i) => (
          <div
            key={row.id ?? i}
            className="bg-white rounded-2xl p-4 border border-[#4187b3]/10 space-y-2"
          >
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between gap-2 text-sm">
                <span className="text-[#230d7d]/60 font-medium">{col.header}</span>
                <span className="text-[#230d7d] text-right">{col.render(row)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
