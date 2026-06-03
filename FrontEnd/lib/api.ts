export const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:8080";

export function apiUrl(path: string) {
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
