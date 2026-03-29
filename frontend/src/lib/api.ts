export function apiUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "";
  return raw.replace(/\/$/, "");
}

export async function apiFetch(path: string, init?: RequestInit) {
  const base = apiUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, init);
}
