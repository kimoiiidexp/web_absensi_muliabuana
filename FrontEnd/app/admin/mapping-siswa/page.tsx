"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { authFetch, parseJson } from "@/lib/auth";

interface User { id: number; name: string; }
interface Kelas { id: number; name: string; }
interface Assignment {
  siswa_id: number;
  siswa_name: string;
  siswa_email: string;
  kelas_name: string;
  jurusan_name: string;
}

export default function AdminMappingSiswaPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [siswa, setSiswa] = useState<User[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [form, setForm] = useState({ siswa_id: "", kelas_id: "" });

  const load = async () => {
    const [a, s, k] = await Promise.all([
      authFetch("/api/admin/assignments/siswa").then((r) => parseJson<Assignment[]>(r)),
      authFetch("/api/admin/users?role=siswa").then((r) => parseJson<User[]>(r)),
      authFetch("/api/admin/kelas").then((r) => parseJson<Kelas[]>(r)),
    ]);
    setAssignments(a);
    setSiswa(s);
    setKelas(k);
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authFetch("/api/admin/assign-siswa", {
        method: "POST",
        body: JSON.stringify({
          siswa_id: Number(form.siswa_id),
          kelas_id: Number(form.kelas_id),
        }),
      }).then((r) => parseJson(r));
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal");
    }
  };

  return (
    <AppShell title="Mapping Siswa">
      <PageHeader title="Mapping Siswa - Kelas" />
      <form onSubmit={handleAssign} className="bg-white rounded-2xl p-4 sm:p-6 border border-[#4187b3]/10 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select value={form.siswa_id} onChange={(e) => setForm({ ...form, siswa_id: e.target.value })} className="h-12 px-4 rounded-xl border border-[#4187b3]/20">
          <option value="">Pilih Siswa</option>
          {siswa.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={form.kelas_id} onChange={(e) => setForm({ ...form, kelas_id: e.target.value })} className="h-12 px-4 rounded-xl border border-[#4187b3]/20">
          <option value="">Pilih Kelas</option>
          {kelas.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
        </select>
        <button type="submit" className="h-12 rounded-xl bg-[#4187b3] text-white font-medium">Assign</button>
      </form>
      <DataTable
        data={assignments.map((a, i) => ({ ...a, id: i }))}
        columns={[
          { key: "siswa", header: "Siswa", render: (r) => r.siswa_name },
          { key: "email", header: "Email", render: (r) => r.siswa_email },
          { key: "kelas", header: "Kelas", render: (r) => r.kelas_name },
          { key: "jurusan", header: "Jurusan", render: (r) => r.jurusan_name || "-" },
        ]}
      />
    </AppShell>
  );
}
