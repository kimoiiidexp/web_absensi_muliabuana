"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { authFetch, parseJson } from "@/lib/auth";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export default function AdminSiswaPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const load = () =>
    authFetch("/api/admin/users?role=siswa")
      .then((r) => parseJson<User[]>(r))
      .then(setUsers);

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authFetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({ ...form, role: "siswa" }),
      }).then((r) => parseJson(r));
      setForm({ name: "", email: "", password: "" });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal");
    }
  };

  return (
    <AppShell title="Manajemen Siswa">
      <PageHeader title="Siswa" />
      <form onSubmit={createUser} className="bg-white rounded-2xl p-4 sm:p-6 border border-[#4187b3]/10 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama" className="h-12 px-4 rounded-xl border border-[#4187b3]/20" />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="h-12 px-4 rounded-xl border border-[#4187b3]/20" />
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" className="h-12 px-4 rounded-xl border border-[#4187b3]/20" />
        <button type="submit" className="h-12 rounded-xl bg-[#4187b3] text-white font-medium">Tambah Siswa</button>
      </form>
      <DataTable
        data={users}
        columns={[
          { key: "name", header: "Nama", render: (r) => r.name },
          { key: "email", header: "Email", render: (r) => r.email },
          { key: "phone", header: "Telepon", render: (r) => r.phone || "-" },
        ]}
      />
    </AppShell>
  );
}
