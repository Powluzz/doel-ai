// Simple in-memory auth state (no localStorage/cookies)
let authToken: string | null = null;
let currentUser: { id: string; email: string; name: string } | null = null;

export function setAuth(token: string, user: { id: string; email: string; name: string }) {
  authToken = token;
  currentUser = user;
}

export function clearAuth() {
  authToken = null;
  currentUser = null;
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
