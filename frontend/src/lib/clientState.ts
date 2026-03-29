import { apiFetch } from "./api";

export async function loadJsonState<T>(key: string, fallback: T): Promise<T> {
  try {
    const res = await apiFetch(`/api/state/${encodeURIComponent(key)}`);
    if (!res.ok) return fallback;
    const data = await res.json();
    if (data === null || data === undefined) return fallback;
    return data as T;
  } catch {
    return fallback;
  }
}

export async function saveJsonState(key: string, value: unknown): Promise<void> {
  await apiFetch(`/api/state/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
}
