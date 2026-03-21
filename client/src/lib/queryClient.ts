import { QueryClient } from "@tanstack/react-query";
import { getToken, clearAuth } from "./auth";

/** Als de server 401 teruggeeft terwijl we een token hebben, is de sessie
 *  verlopen (bijv. na server herstart op Render free tier). Gooi dan het
 *  token weg en laad de pagina opnieuw zodat de gebruiker opnieuw kan inloggen.
 */
function handle401() {
  if (getToken()) {
    clearAuth();
    window.location.reload();
  }
}

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
  if (res.status === 401) {
    handle401();
    throw new Error("Sessie verlopen, opnieuw inloggen");
  }
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
        if (res.status === 401) {
          handle401();
          throw new Error("Sessie verlopen, opnieuw inloggen");
        }
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
