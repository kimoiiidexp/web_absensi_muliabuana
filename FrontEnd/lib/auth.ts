"use client";

import { apiUrl } from "./api";

export type UserRole = "admin" | "guru" | "siswa";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getRole(): UserRole | null {
  if (typeof window === "undefined") return null;
  const role = localStorage.getItem("role")?.toLowerCase();
  if (role === "admin" || role === "guru" || role === "siswa") return role;
  return null;
}

export function getUserName(): string {
  if (typeof window === "undefined") return "User";
  return localStorage.getItem("name") || "User";
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("name");
  localStorage.removeItem("email");
  localStorage.removeItem("phone");
}

export async function authFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(apiUrl(path), { ...options, headers });
}

export async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    const msg =
      typeof data === "string"
        ? data
        : data?.message || data?.error || "Request gagal";
    throw new Error(msg);
  }
  return data as T;
}
