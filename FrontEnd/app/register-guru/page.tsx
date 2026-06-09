"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiUrl } from "@/lib/api";

function RegisterGuruForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [valid, setValid] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setValid(false);
      return;
    }
    fetch(apiUrl(`/invite/validate?token=${token}`))
      .then((r) => r.json())
      .then((data) => {
        if (data.email) {
          setValid(true);
          setEmail(data.email);
        } else setValid(false);
      })
      .catch(() => setValid(false));
  }, [token]);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/invite/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, password }),
      });
      if (res.ok) {
        alert("Registrasi berhasil. Silakan login.");
        router.push("/login");
      } else {
        const data = await res.json();
        alert(typeof data === "string" ? data : "Registrasi gagal");
      }
    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  if (valid === null) {
    return <div className="text-center text-[#230d7d]">Memvalidasi undangan...</div>;
  }

  if (!valid) {
    return (
      <div className="text-center">
        <p className="text-red-600 mb-4">Token undangan tidak valid atau sudah expired.</p>
        <Link href="/login" className="text-[#4187b3] underline">Kembali ke login</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px] bg-white rounded-[20px] shadow-lg p-6 flex flex-col gap-5">
      <h1 className="text-2xl font-semibold text-[#230d7d] text-center">Registrasi Guru</h1>
      <p className="text-sm text-[#230d7d]/70 text-center">Email: {email}</p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama lengkap"
        className="h-12 border-2 border-[#4187b3] rounded-xl px-4 text-[#230d7d]"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="h-12 border-2 border-[#4187b3] rounded-xl px-4 text-[#230d7d]"
      />
      <button
        onClick={handleRegister}
        disabled={loading}
        className="h-12 bg-[#4187b3] text-white rounded-xl font-semibold disabled:opacity-50"
      >
        {loading ? "Memproses..." : "Daftar"}
      </button>
    </div>
  );
}

export default function RegisterGuruPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef5fb] p-4">
      <Suspense fallback={<div className="animate-spin h-10 w-10 border-b-2 border-[#4187b3] rounded-full" />}>
        <RegisterGuruForm />
      </Suspense>
    </div>
  );
}
