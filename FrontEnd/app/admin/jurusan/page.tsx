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

export default function AdminJurusanPage() {
  const [data, setData] = useState<Jurusan[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () =>
    authFetch("/api/admin/jurusan")
      .then((r) => parseJson<Jurusan[]>(r))
      .then(setData);

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setMsg("");
    try {
      await authFetch("/api/admin/jurusan", {
        method: "POST",
        body: JSON.stringify({ name }),
      }).then((r) => parseJson(r));
      setName("");
      setMsg("Jurusan berhasil ditambahkan");
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Manajemen Jurusan">
      <PageHeader title="Jurusan" />
      <form onSubmit={handleCreate} className="bg-white rounded-2xl p-4 sm:p-6 border border-[#4187b3]/10 mb-6 flex flex-col sm:flex-row gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama jurusan"
          className="flex-1 h-12 px-4 rounded-xl border border-[#4187b3]/20 text-[#230d7d] focus:outline-none focus:ring-2 focus:ring-[#4187b3]"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-12 px-6 rounded-xl bg-[#4187b3] text-white font-medium disabled:opacity-50 min-w-[120px]"
        >
          {loading ? "..." : "Tambah"}
        </button>
      </form>
      {msg && <p className="mb-4 text-sm text-[#4187b3]">{msg}</p>}
      <DataTable
        data={data}
        columns={[
          { key: "id", header: "ID", render: (r) => r.id },
          { key: "name", header: "Nama", render: (r) => r.name },
        ]}
        emptyText="Belum ada jurusan"
      />
    </AppShell>
  );
}
