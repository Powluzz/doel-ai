import { QueryClient } from "@tanstack/react-query";
import { getToken } from "./auth";

export async function apiRequest(method: string, url: string, data?: unknown) {
  const token = getToken();
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Onbekende fout" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const [url] = queryKey as string[];
        const token = getToken();
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Onbekende fout" }));
          throw new Error(err.error || `HTTP ${res.status}`);
        }
        return res.json();
      },
      staleTime: 30_000,
      retry: false,
    },
  },
});
