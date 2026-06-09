"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { authFetch, parseJson } from "@/lib/auth";

interface Session {
  id: number;
  kelas_name: string;
  mapel_name: string;
  jurusan_name: string;
  expired_at: string;
  is_closed: boolean;
  created_at: string;
}

export default function AdminMonitoringPage() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    authFetch("/api/admin/sessions")
      .then((r) => parseJson<Session[]>(r))
      .then(setSessions)
      .catch(console.error);
  }, []);

  return (
    <AppShell title="Monitoring Absensi">
      <PageHeader title="Monitoring Session Absensi" />
      <DataTable
        data={sessions}
        columns={[
          { key: "kelas", header: "Kelas", render: (r) => r.kelas_name },
          { key: "mapel", header: "Mapel", render: (r) => r.mapel_name },
          { key: "jurusan", header: "Jurusan", render: (r) => r.jurusan_name || "-" },
          { key: "status", header: "Status", render: (r) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.is_closed ? "bg-gray-100 text-gray-700" : "bg-green-100 text-green-700"}`}>
              {r.is_closed ? "Ditutup" : "Aktif"}
            </span>
          )},
          { key: "created", header: "Dibuat", render: (r) => new Date(r.created_at).toLocaleString("id-ID") },
        ]}
        emptyText="Belum ada session absensi"
      />
    </AppShell>
  );
}
