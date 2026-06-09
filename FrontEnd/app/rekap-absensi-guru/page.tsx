"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { authFetch, parseJson } from "@/lib/auth";

interface Assignment {
  id: number;
  kelas_id: number;
  kelas_name: string;
  mapel_name: string;
}

interface Rekap {
  siswa_id: number;
  name: string;
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
  terlambat: number;
}

export default function RekapAbsensiGuruPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [kelasId, setKelasId] = useState("");
  const [rekap, setRekap] = useState<Rekap[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    authFetch("/api/guru/mapel-kelas")
      .then((r) => parseJson<Assignment[]>(r))
      .then((data) => {
        setAssignments(data);
        if (data.length) setKelasId(String(data[0].kelas_id));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!kelasId) return;
    setLoading(true);
    authFetch(`/api/guru/rekap-absensi?kelas_id=${kelasId}`)
      .then((r) => parseJson<Rekap[]>(r))
      .then(setRekap)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [kelasId]);

  const uniqueKelas = Array.from(
    new Map(assignments.map((a) => [a.kelas_id, a])).values()
  );

  const filtered = rekap.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell title="Rekap Absensi">
      <PageHeader title="Rekap Absensi Siswa" back />
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={kelasId}
          onChange={(e) => setKelasId(e.target.value)}
          className="h-12 px-4 rounded-xl border border-[#4187b3]/20 text-[#230d7d] bg-white flex-1"
        >
          {uniqueKelas.map((k) => (
            <option key={k.kelas_id} value={k.kelas_id}>{k.kelas_name}</option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari siswa..."
          className="h-12 px-4 rounded-xl border border-[#4187b3]/20 text-[#230d7d] bg-white flex-1"
        />
      </div>
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4187b3]" />
        </div>
      ) : (
        <DataTable
          data={filtered.map((r) => ({ ...r, id: r.siswa_id }))}
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
