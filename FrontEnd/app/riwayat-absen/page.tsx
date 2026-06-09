"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { authFetch, parseJson, getRole } from "@/lib/auth";

interface Riwayat {
  id: number;
  date?: string;
  time?: string;
  status?: string;
  subject?: string;
  class?: string;
  guru_name?: string;
  kelas_name?: string;
  mapel_name?: string;
  created_at?: string;
  is_closed?: boolean;
}

export default function RiwayatAbsenPage() {
  const [records, setRecords] = useState<Riwayat[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("siswa");

  useEffect(() => {
    const r = getRole() || "siswa";
    setRole(r);
    const path = r === "guru" ? "/api/guru/sessions" : "/api/siswa/riwayat";
    authFetch(path)
      .then((res) => parseJson<Riwayat[]>(res))
      .then(setRecords)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const columns =
    role === "guru"
      ? [
          { key: "kelas", header: "Kelas", render: (r: Riwayat) => r.kelas_name || "-" },
          { key: "mapel", header: "Mapel", render: (r: Riwayat) => r.mapel_name || "-" },
          { key: "status", header: "Status", render: (r: Riwayat) => (r.is_closed ? "Ditutup" : "Aktif") },
          { key: "created", header: "Dibuat", render: (r: Riwayat) => r.created_at ? new Date(r.created_at).toLocaleString("id-ID") : "-" },
        ]
      : [
          { key: "date", header: "Tanggal", render: (r: Riwayat) => r.date || "-" },
          { key: "time", header: "Waktu", render: (r: Riwayat) => r.time || "-" },
          { key: "subject", header: "Mapel", render: (r: Riwayat) => r.subject || "-" },
          { key: "class", header: "Kelas", render: (r: Riwayat) => r.class || "-" },
          { key: "status", header: "Status", render: (r: Riwayat) => r.status || "-" },
        ];

  return (
    <AppShell title="Riwayat Absen">
      <PageHeader title="Riwayat Absensi" back />
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4187b3]" />
        </div>
      ) : (
        <DataTable data={records} columns={columns} emptyText="Belum ada riwayat" />
      )}
    </AppShell>
  );
}
