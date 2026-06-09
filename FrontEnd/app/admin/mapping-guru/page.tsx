"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { authFetch, parseJson } from "@/lib/auth";

interface User { id: number; name: string; }
interface Kelas { id: number; name: string; }
interface Mapel { id: number; name: string; }
interface Assignment {
  id: number;
  guru_name: string;
  kelas_name: string;
  jurusan_name: string;
  mapel_name: string;
}

export default function AdminMappingGuruPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [gurus, setGurus] = useState<User[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [mapel, setMapel] = useState<Mapel[]>([]);
  const [form, setForm] = useState({ guru_id: "", kelas_id: "", mapel_id: "" });

  const load = async () => {
    const [a, g, k, m] = await Promise.all([
      authFetch("/api/admin/assignments/guru").then((r) => parseJson<Assignment[]>(r)),
      authFetch("/api/admin/users?role=guru").then((r) => parseJson<User[]>(r)),
      authFetch("/api/admin/kelas").then((r) => parseJson<Kelas[]>(r)),
      authFetch("/api/admin/mapel").then((r) => parseJson<Mapel[]>(r)),
    ]);
    setAssignments(a);
    setGurus(g);
    setKelas(k);
    setMapel(m);
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authFetch("/api/admin/assign-guru", {
        method: "POST",
        body: JSON.stringify({
          guru_id: Number(form.guru_id),
          kelas_id: Number(form.kelas_id),
          mapel_id: Number(form.mapel_id),
        }),
      }).then((r) => parseJson(r));
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal");
    }
  };

  return (
    <AppShell title="Mapping Guru">
      <PageHeader title="Mapping Guru - Kelas - Mapel" />
      <form onSubmit={handleAssign} className="bg-white rounded-2xl p-4 sm:p-6 border border-[#4187b3]/10 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <select value={form.guru_id} onChange={(e) => setForm({ ...form, guru_id: e.target.value })} className="h-12 px-4 rounded-xl border border-[#4187b3]/20">
          <option value="">Pilih Guru</option>
          {gurus.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <select value={form.kelas_id} onChange={(e) => setForm({ ...form, kelas_id: e.target.value })} className="h-12 px-4 rounded-xl border border-[#4187b3]/20">
          <option value="">Pilih Kelas</option>
          {kelas.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
        </select>
        <select value={form.mapel_id} onChange={(e) => setForm({ ...form, mapel_id: e.target.value })} className="h-12 px-4 rounded-xl border border-[#4187b3]/20">
          <option value="">Pilih Mapel</option>
          {mapel.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <button type="submit" className="h-12 rounded-xl bg-[#4187b3] text-white font-medium">Assign</button>
      </form>
      <DataTable
        data={assignments}
        columns={[
          { key: "guru", header: "Guru", render: (r) => r.guru_name },
          { key: "kelas", header: "Kelas", render: (r) => r.kelas_name },
          { key: "jurusan", header: "Jurusan", render: (r) => r.jurusan_name || "-" },
          { key: "mapel", header: "Mapel", render: (r) => r.mapel_name },
        ]}
      />
    </AppShell>
  );
}
