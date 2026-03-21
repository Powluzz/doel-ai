// API-wrapper — vervangt de in-memory storage-client volledig.
// Alle functies zijn nu async en praten met de echte backend via /api/*.
// De functienamen zijn identiek gebleven zodat de pages niet hoeven te veranderen.

import type { Goal, GEntry, Action, NotificationPref } from "@shared/schema";
import { apiRequest } from "./queryClient";
import { getUser } from "./auth";

// --- Auth (re-exports voor pages die store.getMe() aanroepen) ---
export function getMe() {
  return getUser();
}

// --- Goals ---
export async function getGoals(): Promise<Goal[]> {
  return apiRequest("GET", "/api/goals");
}

export async function getAllGoals(): Promise<Goal[]> {
  return apiRequest("GET", "/api/goals/all");
}

export async function createGoal(title: string, category: string, description?: string): Promise<Goal> {
  return apiRequest("POST", "/api/goals", { title, category, description });
}

export async function archiveGoal(id: string, archive: boolean): Promise<void> {
  await apiRequest("PATCH", `/api/goals/${id}`, { archive });
}

export async function deleteGoal(id: string): Promise<void> {
  await apiRequest("DELETE", `/api/goals/${id}`);
}

// --- GEntries ---
export async function getEntries(goalId?: string): Promise<GEntry[]> {
  const qs = goalId ? `?goal_id=${goalId}` : "";
  return apiRequest("GET", `/api/g-entries${qs}`);
}

export async function createEntry(data: {
  goalId: string;
  event: string;
  thoughts: string;
  feelings: Array<{ label: string; intensity: number }>;
  behaviour?: string;
  consequence?: string;
  helpfulThought?: string;
  helpsGoal?: string;
  contextTags?: string[];
}): Promise<GEntry> {
  return apiRequest("POST", "/api/g-entries", data);
}

// --- Actions ---
export async function getTodayActions(): Promise<Action[]> {
  return apiRequest("GET", "/api/actions/today");
}

export async function getActions(goalId?: string, status?: string): Promise<Action[]> {
  const params = new URLSearchParams();
  if (goalId) params.set("goal_id", goalId);
  if (status) params.set("status", status);
  const qs = params.toString() ? `?${params}` : "";
  return apiRequest("GET", `/api/actions${qs}`);
}

export async function createAction(data: {
  goalId: string;
  gEntryId?: string;
  ifSituation: string;
  thenBehaviour: string;
}): Promise<Action> {
  return apiRequest("POST", "/api/actions", data);
}

export async function updateAction(id: string, status: string): Promise<void> {
  await apiRequest("PATCH", `/api/actions/${id}`, { status });
}

// --- Insights ---
export async function getEmotionInsights(days: number): Promise<Array<{ date: string; emotions: Record<string, number> }>> {
  return apiRequest("GET", `/api/insights/emotions?range=${days}d`);
}

export async function getGoalsSummary(): Promise<Array<{ goalId: string; goalTitle: string; entryCount: number; actionsDone: number }>> {
  return apiRequest("GET", "/api/insights/goals-summary");
}

// --- Notifications ---
export async function getNotifPrefs(): Promise<NotificationPref[]> {
  return apiRequest("GET", "/api/notification-preferences");
}

export async function createNotifPref(type: string, active: boolean): Promise<NotificationPref> {
  return apiRequest("POST", "/api/notification-preferences", { type, active });
}

export async function updateNotifPref(id: string, active: boolean): Promise<void> {
  await apiRequest("PATCH", `/api/notification-preferences/${id}`, { active });
}
