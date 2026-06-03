"use client";

import { useState } from "react";
import Link from "next/link";
import { apiUrl } from "@/lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const res = await fetch(apiUrl("/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative">

      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px]" />

      {/* CARD */}
      <div className="relative w-full max-w-[420px] bg-white rounded-[20px] shadow-lg p-6 flex flex-col gap-5">

        <h1 className="text-[32px] font-semibold text-[#230d7d] text-center">
          Buat Akun
        </h1>

        <p className="text-[16px] text-[#230d7d] text-center">
          Memulai langkah pertama
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
            className="h-[50px] border-2 border-[#4187b3] rounded-[12px] px-4 
             text-[#230d7d] placeholder:text-gray-400
             focus:outline-none focus:ring-2 focus:ring-[#4187b3]"
          />
        </div>

        {/* REGISTER BUTTON */}
        <button
          onClick={handleRegister}
          className="h-[50px] bg-[#4187b3] text-white rounded-[12px] font-semibold text-[18px] hover:opacity-90 transition"
        >
          Masuk
        </button>

        {/* OUTLINE BUTTON */}
        <Link href="/login">
          <button className="h-[50px] w-full border-2 border-[#4187b3] text-[#230d7d] rounded-[12px] text-[16px]">
            Saya sudah punya akun
          </button>
        </Link>

      </div>
    </div>
  );
}
