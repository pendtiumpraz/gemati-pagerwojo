"use client";
import { useCallback, useEffect, useState } from "react";

export async function apiFetch<T = any>(
  url: string,
  opts?: RequestInit
): Promise<{ ok: boolean; data?: T; message?: string; status: number }> {
  const res = await fetch(url, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, data: json.data, message: json.message, status: res.status };
}

/** Hook list dengan refetch */
export function useList<T = any>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<T>(url);
    if (res.ok) {
      setData(res.data ?? null);
      setError(null);
    } else {
      setError(res.message || "Gagal memuat data");
    }
    setLoading(false);
  }, [url]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}
