"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { authFetch, parseJson } from "@/lib/auth";

interface Kelas { id: number; name: string; }
interface Rekap {
  siswa_id: number;
  name: string;
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
  terlambat: number;
}

export default function AdminRekapPage() {
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [kelasId, setKelasId] = useState("");
  const [rekap, setRekap] = useState<Rekap[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authFetch("/api/admin/kelas")
      .then((r) => parseJson<Kelas[]>(r))
      .then((k) => {
        setKelas(k);
        if (k.length) setKelasId(String(k[0].id));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!kelasId) return;
    setLoading(true);
    authFetch(`/api/admin/rekap/${kelasId}`)
      .then((r) => parseJson<Rekap[]>(r))
      .then(setRekap)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [kelasId]);

  return (
    <AppShell title="Rekap Absensi">
      <PageHeader title="Rekap Absensi per Kelas" />
      <select
        value={kelasId}
        onChange={(e) => setKelasId(e.target.value)}
        className="mb-6 h-12 px-4 rounded-xl border border-[#4187b3]/20 text-[#230d7d] bg-white w-full sm:w-auto"
      >
        {kelas.map((k) => (
          <option key={k.id} value={k.id}>{k.name}</option>
        ))}
      </select>
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4187b3]" />
        </div>
      ) : (
        <DataTable
          data={rekap.map((r) => ({ ...r, id: r.siswa_id }))}
          columns={[
            { key: "name", header: "Siswa", render: (r) => r.name },
            { key: "hadir", header: "Hadir", render: (r) => r.hadir },
            { key: "izin", header: "Izin", render: (r) => r.izin },
            { key: "sakit", header: "Sakit", render: (r) => r.sakit },
            { key: "alpa", header: "Alpa", render: (r) => r.alpa },
            { key: "terlambat", header: "Terlambat", render: (r) => r.terlambat },
          ]}
        />
      )}
    </AppShell>
  );
}
