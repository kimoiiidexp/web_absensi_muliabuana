"use client";

import { useState } from "react";
import Link from "next/link";
import { apiUrl } from "@/lib/api";
import { useRouter } from "next/navigation"; // 🔥 TAMBAH INI

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter(); // 🔥 TAMBAH INI

  const handleLogin = async () => {
    try {
      const res = await fetch(apiUrl("/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

     if (res.ok) {
  localStorage.setItem("token", data.token);

  localStorage.setItem("role", data.user.Role);
  localStorage.setItem("name", data.user.Name);
  localStorage.setItem("email", data.user.Email);
  localStorage.setItem("phone", data.user.Phone || "");

  router.push("/loading-screen");
  
} else {
  alert(data.message || "Login gagal");
}

    } catch (err) {
      console.log(err);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative">

      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px]" />

      {/* CARD */}
      <div className="relative w-full max-w-[420px] bg-white rounded-[20px] shadow-lg p-6 flex flex-col gap-5">

        <h1 className="text-[32px] font-semibold text-[#230d7d] text-center">
          Welcome Back!
        </h1>

        <p className="text-[16px] text-[#230d7d] text-center">
          Masuk ke akun Anda
        </p>

        {/* EMAIL */}
        <div className="flex flex-col gap-2">
          <label className="text-[#230d7d] text-[16px]">
            Username atau email
          </label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Masukkan Email"
            className="h-[50px] border-2 border-[#4187b3] rounded-[12px] px-4 
             text-[#230d7d] placeholder:text-gray-400
             focus:outline-none focus:ring-2 focus:ring-[#4187b3]"
          />
        </div>

        {/* PASSWORD */}
        <div className="flex flex-col gap-2">
          <label className="text-[#230d7d] text-[16px]">
            Kata Sandi
          </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="h-[50px] border-2 border-[#4187b3] rounded-[12px] px-4 
                        text-[#230d7d] placeholder:text-gray-400
                        focus:outline-none focus:ring-2 focus:ring-[#4187b3]"
            />
        </div>

        {/* LOGIN BUTTON */}
        <button
          onClick={handleLogin}
          className="h-[50px] bg-[#4187b3] text-white rounded-[12px] font-semibold text-[18px] hover:opacity-90 transition"
        >
          Login
        </button>

        {/* OUTLINE BUTTON */}
        <button className="h-[50px] border-2 border-[#4187b3] text-[#230d7d] rounded-[12px] text-[16px]">
          Lupa Kata Sandi?
        </button>

        {/* LINK */}
        <p className="text-center text-[#230d7d] text-[14px]">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold">
            Daftar
          </Link>
        </p>

      </div>
    </div>
  );
}
