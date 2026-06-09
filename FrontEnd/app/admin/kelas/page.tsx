"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { authFetch, parseJson } from "@/lib/auth";

interface Jurusan {
  id: number;
  name: string;
}
interface Kelas {
  id: number;
  name: string;
  jurusan_id: number;
}

export default function AdminKelasPage() {
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [jurusan, setJurusan] = useState<Jurusan[]>([]);
  const [name, setName] = useState("");
  const [jurusanId, setJurusanId] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [k, j] = await Promise.all([
      authFetch("/api/admin/kelas").then((r) => parseJson<Kelas[]>(r)),
      authFetch("/api/admin/jurusan").then((r) => parseJson<Jurusan[]>(r)),
    ]);
    setKelas(k);
    setJurusan(j);
    if (!jurusanId && j.length) setJurusanId(String(j[0].id));
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authFetch("/api/admin/kelas", {
        method: "POST",
        body: JSON.stringify({ name, jurusan_id: Number(jurusanId) }),
      }).then((r) => parseJson(r));
      setName("");
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal");
    } finally {
      setLoading(false);
    }
  };

  const jurusanMap = Object.fromEntries(jurusan.map((j) => [j.id, j.name]));

  return (
    <AppShell title="Manajemen Kelas">
      <PageHeader title="Kelas" />
      <form onSubmit={handleCreate} className="bg-white rounded-2xl p-4 sm:p-6 border border-[#4187b3]/10 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama kelas"
          className="h-12 px-4 rounded-xl border border-[#4187b3]/20 text-[#230d7d]"
        />
        <select
          value={jurusanId}
          onChange={(e) => setJurusanId(e.target.value)}
          className="h-12 px-4 rounded-xl border border-[#4187b3]/20 text-[#230d7d]"
        >
          {jurusan.map((j) => (
            <option key={j.id} value={j.id}>{j.name}</option>
          ))}
        </select>
        <button type="submit" disabled={loading} className="h-12 rounded-xl bg-[#4187b3] text-white font-medium">
          Tambah Kelas
        </button>
      </form>
      <DataTable
        data={kelas.map((k) => ({ id: k.id, name: k.name, jurusan: jurusanMap[k.jurusan_id] || "-" }))}
        columns={[
          { key: "id", header: "ID", render: (r) => r.id },
          { key: "name", header: "Nama", render: (r) => r.name },
          { key: "jurusan", header: "Jurusan", render: (r) => r.jurusan },
        ]}
      />
    </AppShell>
  );
}
