"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "siswa" });

  const handleRegister = async () => {
    try {
      const res = await fetch(apiUrl("/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Registrasi berhasil. Silakan login.");
        router.push("/login");
      } else {
        alert(typeof data === "string" ? data : data.message || "Registrasi gagal");
      }
    } catch {
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef5fb] p-4">
      <div className="w-full max-w-[420px] bg-white rounded-[20px] shadow-lg p-6 flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-[#230d7d] text-center">Buat Akun</h1>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nama lengkap"
          className="h-12 border-2 border-[#4187b3] rounded-xl px-4 text-[#230d7d]"
        />
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          className="h-12 border-2 border-[#4187b3] rounded-xl px-4 text-[#230d7d]"
        />
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Password"
          className="h-12 border-2 border-[#4187b3] rounded-xl px-4 text-[#230d7d]"
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="h-12 border-2 border-[#4187b3] rounded-xl px-4 text-[#230d7d]"
        >
          <option value="siswa">Siswa</option>
        </select>
        <button onClick={handleRegister} className="h-12 bg-[#4187b3] text-white rounded-xl font-semibold">
          Daftar
        </button>
        <Link href="/login" className="text-center text-[#4187b3] text-sm">Sudah punya akun? Login</Link>
      </div>
    </div>
  );
}
