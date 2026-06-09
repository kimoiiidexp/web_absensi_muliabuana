"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { authFetch, parseJson } from "@/lib/auth";

interface Mapel {
  id: number;
  name: string;
}

export default function AdminMapelPage() {
  const [data, setData] = useState<Mapel[]>([]);
  const [name, setName] = useState("");

  const load = () =>
    authFetch("/api/admin/mapel").then((r) => parseJson<Mapel[]>(r)).then(setData);

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authFetch("/api/admin/mapel", {
        method: "POST",
        body: JSON.stringify({ name }),
      }).then((r) => parseJson(r));
      setName("");
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal");
    }
  };

  return (
    <AppShell title="Mata Pelajaran">
      <PageHeader title="Mata Pelajaran" />
      <form onSubmit={handleCreate} className="bg-white rounded-2xl p-4 sm:p-6 border border-[#4187b3]/10 mb-6 flex flex-col sm:flex-row gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama mapel"
          className="flex-1 h-12 px-4 rounded-xl border border-[#4187b3]/20 text-[#230d7d]"
        />
        <button type="submit" className="h-12 px-6 rounded-xl bg-[#4187b3] text-white font-medium">
          Tambah
        </button>
      </form>
      <DataTable
        data={data}
        columns={[
          { key: "id", header: "ID", render: (r) => r.id },
          { key: "name", header: "Nama", render: (r) => r.name },
        ]}
      />
    </AppShell>
  );
}
