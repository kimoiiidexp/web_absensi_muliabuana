"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { authFetch, parseJson } from "@/lib/auth";

interface Riwayat {
  id: number;
  date: string;
  time: string;
  status: string;
  subject: string;
  class: string;
}

export default function RekapAbsensiSiswaPage() {
  const [records, setRecords] = useState<Riwayat[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch("/api/siswa/riwayat")
      .then((r) => parseJson<Riwayat[]>(r))
      .then(setRecords)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const summary = {
    hadir: records.filter((r) => r.status === "hadir").length,
    izin: records.filter((r) => r.status === "izin").length,
    sakit: records.filter((r) => r.status === "sakit").length,
    alpa: records.filter((r) => r.status === "alpa").length,
    terlambat: records.filter((r) => r.status === "terlambat").length,
  };
  const total = records.length || 1;
  const rate = Math.round((summary.hadir / total) * 100);

  const filtered = records.filter((r) => filter === "all" || r.status === filter);

  return (
    <AppShell title="Statistik Kehadiran">
      <PageHeader title="Statistik Kehadiran" back />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: "Hadir", value: summary.hadir, color: "bg-green-100 text-green-700" },
          { label: "Izin", value: summary.izin, color: "bg-yellow-100 text-yellow-700" },
          { label: "Sakit", value: summary.sakit, color: "bg-blue-100 text-blue-700" },
          { label: "Alpa", value: summary.alpa, color: "bg-red-100 text-red-700" },
          { label: "Terlambat", value: summary.terlambat, color: "bg-orange-100 text-orange-700" },
          { label: "Kehadiran", value: `${rate}%`, color: "bg-[#eef5fb] text-[#230d7d]" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.color}`}>
            <p className="text-xs font-medium">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-4 h-11 px-4 rounded-xl border border-[#4187b3]/20 text-[#230d7d] bg-white"
      >
        <option value="all">Semua Status</option>
        <option value="hadir">Hadir</option>
        <option value="izin">Izin</option>
        <option value="sakit">Sakit</option>
        <option value="alpa">Alpa</option>
        <option value="terlambat">Terlambat</option>
      </select>
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4187b3]" />
        </div>
      ) : (
        <DataTable
          data={filtered}
          columns={[
            { key: "date", header: "Tanggal", render: (r) => r.date },
            { key: "time", header: "Waktu", render: (r) => r.time },
            { key: "subject", header: "Mapel", render: (r) => r.subject },
            { key: "class", header: "Kelas", render: (r) => r.class },
            { key: "status", header: "Status", render: (r) => r.status },
          ]}
        />
      )}
    </AppShell>
  );
}
