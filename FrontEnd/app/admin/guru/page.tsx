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
  role: string;
}

export default function AdminGuruPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const load = () =>
    authFetch("/api/admin/users?role=guru")
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
        body: JSON.stringify({ ...form, role: "guru" }),
      }).then((r) => parseJson(r));
      setForm({ name: "", email: "", password: "" });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal");
    }
  };

  const inviteGuru = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch("/api/admin/invite-guru", {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail }),
      }).then((r) => parseJson<{ link: string }>(r));
      setInviteLink(res.link);
      setInviteEmail("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal");
    }
  };

  return (
    <AppShell title="Manajemen Guru">
      <PageHeader title="Guru" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <form onSubmit={createUser} className="bg-white rounded-2xl p-4 sm:p-6 border border-[#4187b3]/10 space-y-3">
          <h3 className="font-semibold text-[#230d7d]">Tambah Guru</h3>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama" className="w-full h-12 px-4 rounded-xl border border-[#4187b3]/20" />
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full h-12 px-4 rounded-xl border border-[#4187b3]/20" />
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" className="w-full h-12 px-4 rounded-xl border border-[#4187b3]/20" />
          <button type="submit" className="w-full h-12 rounded-xl bg-[#4187b3] text-white font-medium">Simpan</button>
        </form>
        <form onSubmit={inviteGuru} className="bg-white rounded-2xl p-4 sm:p-6 border border-[#4187b3]/10 space-y-3">
          <h3 className="font-semibold text-[#230d7d]">Undang Guru</h3>
          <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Email guru" className="w-full h-12 px-4 rounded-xl border border-[#4187b3]/20" />
          <button type="submit" className="w-full h-12 rounded-xl bg-[#230d7d] text-white font-medium">Kirim Undangan</button>
          {inviteLink && (
            <p className="text-xs text-[#230d7d]/70 break-all">Link: {inviteLink}</p>
          )}
        </form>
      </div>
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
