"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { authFetch, parseJson } from "@/lib/auth";
import { AlertCircle } from "lucide-react";

interface Riwayat {
  id: number;
  date: string;
  time: string;
  status: string;
  subject: string;
  class: string;
  guru_name: string;
}

export default function IzinPage() {
  const [records, setRecords] = useState<Riwayat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch("/api/siswa/riwayat")
      .then((r) => parseJson<Riwayat[]>(r))
      .then((data) => setRecords(data.filter((d) => d.status === "izin" || d.status === "sakit")))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell title="Izin">
      <PageHeader title="Riwayat Izin & Sakit" back />
      <div className="bg-blue-50 rounded-2xl p-4 mb-6 flex gap-3 text-sm text-[#230d7d]">
        <AlertCircle size={20} className="shrink-0 text-[#4187b3]" />
        <p>Status izin dan sakit diatur oleh guru saat sesi absensi berlangsung.</p>
      </div>
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4187b3]" />
        </div>
      ) : (
        <DataTable
          data={records}
          columns={[
            { key: "date", header: "Tanggal", render: (r) => r.date },
            { key: "subject", header: "Mapel", render: (r) => r.subject },
            { key: "status", header: "Status", render: (r) => (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.status === "izin" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                {r.status}
              </span>
            )},
            { key: "guru", header: "Guru", render: (r) => r.guru_name },
          ]}
          emptyText="Belum ada riwayat izin atau sakit"
        />
      )}
    </AppShell>
  );
}
