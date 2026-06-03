"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";

import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  ChevronRight,
  Languages,
  KeyRound,
  MessageCircleWarning,
  Pencil,
  Check,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  const [phone, setPhone] = useState(
  typeof window !== "undefined"
    ? localStorage.getItem("phone") || ""
    : ""
);

const [email] = useState(
  typeof window !== "undefined"
    ? localStorage.getItem("email") || ""
    : ""
);

const [loading, setLoading] = useState(true);

  const role =
    typeof window !== "undefined" &&
    localStorage.getItem("role")?.toLowerCase() === "guru"
      ? "guru"
      : "siswa";

  const name =
    typeof window !== "undefined"
      ? localStorage.getItem("name") || "User"
      : "User";

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        apiUrl("/api/profile"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setPhone(data.phone || "");

        localStorage.setItem("phone", data.phone || "");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, []);
  
  const savePhone = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      apiUrl("/api/profile/phone"),
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: phone,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Gagal update nomor");
      return;
    }

    // optional cache local
    localStorage.setItem("phone", phone);

    alert("Nomor telepon berhasil disimpan");
  } catch (err) {
    console.log(err);
    alert("Server error");
  }
};

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[#230d7d] text-xl font-semibold">
        Loading...
      </p>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-[#eef5fb] flex">

      <div className="flex-1 flex flex-col">

        {/* HERO */}
        <div
          className="
            h-[320px]
            bg-[#eef0b9]
            relative
            px-10
            py-8
          "
        >

          {/* BACK */}
          <button
            onClick={() => router.push("/my-activity")}
            className="
              w-[50px]
              h-[50px]
              rounded-2xl
              bg-white/70
              backdrop-blur-md
              flex
              items-center
              justify-center
              text-[#230d7d]
              shadow-sm
              hover:scale-105
              transition
            "
          >
            <ArrowLeft size={24} />
          </button>

          {/* CONTENT */}
          <div className="mt-10 flex flex-col items-center">

            <h1 className="text-5xl font-bold text-[#111827] mb-8">
              Akun Saya
            </h1>

            {/* AVATAR */}
            <div className="relative">

              <div
                className="
                  w-[140px]
                  h-[140px]
                  rounded-full
                  bg-[#8bb7ea]
                  border-2
                  border-[#230d7d]
                  flex
                  items-center
                  justify-center
                  text-[#111827]
                  text-5xl
                  font-semibold
                  shadow-lg
                "
              >
                {name.charAt(0).toUpperCase()}
              </div>

              <button
                className="
                  absolute
                  bottom-2
                  right-2
                  w-[42px]
                  h-[42px]
                  rounded-full
                  bg-[#3b82f6]
                  text-white
                  flex
                  items-center
                  justify-center
                  shadow-md
                  hover:scale-105
                  transition
                "
              >
                <Pencil size={18} />
              </button>

            </div>

            <h2 className="mt-5 text-2xl font-semibold text-[#230d7d]">
              {name}
            </h2>

            <p className="text-[#230d7d]/70 capitalize mt-1">
              {role}
            </p>

          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 px-10 py-10">

          <div
            className="
              bg-white/80
              backdrop-blur-lg
              rounded-[35px]
              p-10
              shadow-md
              border
              border-[#4187b3]/10
            "
          >

            {/* TITLE */}
            <h2 className="text-3xl font-bold text-[#230d7d] mb-10">
              Informasi Diri
            </h2>

            <div className="space-y-6">

              <ProfileItem
                icon={<User size={24} />}
                label="Nama Anda"
                value={name}
              />

              {/* PHONE */}
              <div
                className="
                  p-5
                  rounded-2xl
                  hover:bg-[#4187b3]/5
                  transition
                "
              >

                <div className="flex items-center gap-5 mb-4">

                  <div className="text-[#3156d3]">
                    <Phone size={24} />
                  </div>

                  <div className="flex-1">

                    <p className="text-[#230d7d]/60 text-sm">
                      Nomor Telepon
                    </p>

                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Masukkan nomor telepon"
                      className="
                        mt-2
                        w-full
                        bg-white
                        border
                        border-[#4187b3]/20
                        rounded-xl
                        px-4
                        py-3
                        text-[#230d7d]
                        placeholder:text-[#230d7d]/40
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[#4187b3]/30
                      "
                    />

                  </div>

                  <button
                    onClick={savePhone}
                    className="
                      w-[50px]
                      h-[50px]
                      rounded-xl
                      bg-[#4187b3]
                      text-white
                      flex
                      items-center
                      justify-center
                      hover:scale-105
                      transition
                    "
                  >
                    <Check size={20} />
                  </button>

                </div>

              </div>

              <ProfileItem
                icon={<Mail size={24} />}
                label="Email"
                value={email || "Belum ada email"}
              />

              <ProfileItem
                icon={<User size={24} />}
                label="Role"
                value={role}
              />

            </div>

            {/* SETTINGS */}
            <div className="mt-14">

              <h2 className="text-3xl font-bold text-[#230d7d] mb-8">
                Pengaturan
              </h2>

              {/* INFO THEME */}
              <div
                className="
                  bg-[#f8fbff]
                  border
                  border-[#4187b3]/20
                  rounded-[24px]
                  p-5
                  mb-8
                "
              >

                <p className="text-[#230d7d] text-lg font-medium">
                  Calm Light Theme Active
                </p>

                <p className="text-[#230d7d]/60 mt-2">
                  Sistem tema global akan hadir di versi berikutnya.
                </p>

              </div>

              {/* MENU */}
              <div className="space-y-5">

                <SettingsItem
                  icon={<KeyRound size={24} />}
                  title="Passwords and Autofill"
                />

                <SettingsItem
                  icon={<Languages size={24} />}
                  title="Bahasa"
                />

                <SettingsItem
                  icon={<MessageCircleWarning size={24} />}
                  title="Send Feedback"
                />

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

function ProfileItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        p-5
        rounded-2xl
        hover:bg-[#4187b3]/5
        transition
        cursor-pointer
      "
    >

      <div className="flex items-center gap-5">

        <div className="text-[#3156d3]">
          {icon}
        </div>

        <div>
          <p className="text-[#230d7d]/60 text-sm">
            {label}
          </p>

          <p className="text-[#230d7d] text-xl font-medium">
            {value}
          </p>
        </div>

      </div>

      <ChevronRight
        size={24}
        className="text-[#3156d3]"
      />

    </div>
  );
}

function SettingsItem({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        p-5
        rounded-2xl
        hover:bg-[#4187b3]/5
        transition
        cursor-pointer
      "
    >

      <div className="flex items-center gap-5">

        <div className="text-[#3156d3]">
          {icon}
        </div>

        <p className="text-[#230d7d] text-xl font-medium">
          {title}
        </p>

      </div>

      <ChevronRight
        size={24}
        className="text-[#3156d3]"
      />

    </div>
  );
}
