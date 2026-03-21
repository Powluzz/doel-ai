const TOKEN_KEY = "doelio.token";
const USER_KEY = "doelio.user";

let authToken: string | null = localStorage.getItem(TOKEN_KEY);
let currentUser: { id: string; email: string; name: string } | null = (() => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
})();

export function setAuth(token: string, user: { id: string; email: string; name: string }) {
  authToken = token;
  currentUser = user;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  return authToken;
}

export function getUser() {
  return currentUser;
}

export function isAuthenticated(): boolean {
  return !!authToken && !!currentUser;
}
