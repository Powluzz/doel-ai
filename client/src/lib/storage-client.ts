// Client-side in-memory storage — werkt zonder backend
// Vervangt API calls volledig in de deployed versie

import type { Goal, GEntry, Action, NotificationPref } from "@shared/schema";

function genId() {
  return crypto.randomUUID();
}

// --- State ---
let currentUser: { id: string; email: string; name: string } | null = null;
const usersDb: Array<{ id: string; email: string; passwordHash: string; name: string }> = [];
const goalsDb: Goal[] = [];
const entriesDb: GEntry[] = [];
const actionsDb: Action[] = [];
const notifsDb: NotificationPref[] = [];

function hashPass(p: string) {
  // Simple deterministic hash for demo
  let h = 0;
  for (let i = 0; i < p.length; i++) {
    h = (Math.imul(31, h) + p.charCodeAt(i)) | 0;
  }
  return String(h);
}

// Seed demo data
function seedDemo() {
  if (usersDb.some(u => u.email === "demo@doel.ai")) return;
  const demoId = genId();
  usersDb.push({ id: demoId, email: "demo@doel.ai", passwordHash: hashPass("demo123"), name: "Demo Gebruiker" });

  const goalId = genId();
  goalsDb.push({
    id: goalId, userId: demoId,
    title: "Minder piekeren over werk", category: "werk",
    description: null, archivedAt: null, createdAt: new Date(),
  });

  const entryId = genId();
  entriesDb.push({
    id: entryId, userId: demoId, goalId,
    timestamp: new Date(),
    event: "Mijn leidinggevende stuurde laat op de avond een mail",
    thoughts: "Ik moet altijd bereikbaar zijn, anders faal ik",
    feelings: [{ label: "gespannen", intensity: 75 }, { label: "bedroefd", intensity: 40 }] as any,
    behaviour: "Ik heb meteen gereageerd, ook al was het al 22:00",
    consequence: "Even opgelucht, maar sliep daarna slecht",
    helpfulThought: "Ik mag grenzen stellen en morgen reageren",
    helpsGoal: "nee",
    contextTags: ["werk", "avond"] as any,
    createdAt: new Date(),
  });

  actionsDb.push({
    id: genId(), userId: demoId, goalId, gEntryId: entryId,
    ifSituation: "ik een mail ontvang na 20:00",
    thenBehaviour: "lees ik hem, maar beantwoord ik hem pas de volgende ochtend",
    status: "planned", dueAt: null, createdAt: new Date(),
  });
}
seedDemo();

// --- Auth ---
export function register(email: string, password: string, name: string) {
  if (usersDb.some(u => u.email === email)) throw new Error("E-mailadres al in gebruik");
  const user = { id: genId(), email, passwordHash: hashPass(password), name };
  usersDb.push(user);
  currentUser = { id: user.id, email: user.email, name: user.name };
  return currentUser;
}

export function login(email: string, password: string) {
  const user = usersDb.find(u => u.email === email && u.passwordHash === hashPass(password));
  if (!user) throw new Error("Onjuist e-mailadres of wachtwoord");
  currentUser = { id: user.id, email: user.email, name: user.name };
  return currentUser;
}

export function logout() { currentUser = null; }
export function getMe() { return currentUser; }

// --- Goals ---
export function getGoals() {
  return goalsDb.filter(g => g.userId === currentUser?.id && !g.archivedAt)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getAllGoals() {
  return goalsDb.filter(g => g.userId === currentUser?.id)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function createGoal(title: string, category: string, description?: string): Goal {
  const goal: Goal = {
    id: genId(), userId: currentUser!.id, title, category,
    description: description ?? null, archivedAt: null, createdAt: new Date(),
  };
  goalsDb.push(goal);
  return goal;
}

export function archiveGoal(id: string, archive: boolean) {
  const g = goalsDb.find(g => g.id === id && g.userId === currentUser?.id);
  if (g) g.archivedAt = archive ? new Date() : null;
}

export function deleteGoal(id: string) {
  const i = goalsDb.findIndex(g => g.id === id && g.userId === currentUser?.id);
  if (i >= 0) goalsDb.splice(i, 1);
}

// --- GEntries ---
export function getEntries(goalId?: string): GEntry[] {
  return entriesDb
    .filter(e => e.userId === currentUser?.id && (!goalId || e.goalId === goalId))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function createEntry(data: {
  goalId: string; event: string; thoughts: string;
  feelings: Array<{ label: string; intensity: number }>;
  behaviour?: string; consequence?: string;
  helpfulThought?: string; helpsGoal?: string;
  contextTags?: string[];
}): GEntry {
  const entry: GEntry = {
    id: genId(), userId: currentUser!.id,
    timestamp: new Date(), createdAt: new Date(),
    behaviour: data.behaviour ?? null,
    consequence: data.consequence ?? null,
    helpfulThought: data.helpfulThought ?? null,
    helpsGoal: data.helpsGoal ?? null,
    contextTags: (data.contextTags ?? []) as any,
    ...data,
    feelings: data.feelings as any,
  };
  entriesDb.push(entry);
  return entry;
}

// --- Actions ---
export function getTodayActions(): Action[] {
  return actionsDb
    .filter(a => a.userId === currentUser?.id && a.status === "planned")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);
}

export function getActions(goalId?: string, status?: string): Action[] {
  return actionsDb.filter(a =>
    a.userId === currentUser?.id &&
    (!goalId || a.goalId === goalId) &&
    (!status || a.status === status)
  );
}

export function createAction(data: {
  goalId: string; gEntryId?: string;
  ifSituation: string; thenBehaviour: string;
}): Action {
  const action: Action = {
    id: genId(), userId: currentUser!.id,
    status: "planned", dueAt: null, createdAt: new Date(),
    gEntryId: data.gEntryId ?? null,
    ...data,
  };
  actionsDb.push(action);
  return action;
}

export function updateAction(id: string, status: string) {
  const a = actionsDb.find(a => a.id === id && a.userId === currentUser?.id);
  if (a) a.status = status;
}

// --- Insights ---
export function getEmotionInsights(days: number) {
  const from = new Date();
  from.setDate(from.getDate() - days);
  const entries = getEntries().filter(e => e.timestamp >= from);
  const byDate: Record<string, Record<string, number[]>> = {};
  for (const entry of entries) {
    const date = entry.timestamp.toISOString().split("T")[0];
    if (!byDate[date]) byDate[date] = {};
    for (const f of (entry.feelings as any[])) {
      if (!byDate[date][f.label]) byDate[date][f.label] = [];
      byDate[date][f.label].push(f.intensity);
    }
  }
  return Object.entries(byDate).map(([date, emotions]) => ({
    date,
    emotions: Object.fromEntries(
      Object.entries(emotions).map(([l, vals]) => [l, Math.round((vals as number[]).reduce((a: number, b: number) => a + b, 0) / (vals as number[]).length)])
    ),
  })).sort((a, b) => a.date.localeCompare(b.date));
}

export function getGoalsSummary() {
  return getGoals().map(goal => ({
    goalId: goal.id,
    goalTitle: goal.title,
    entryCount: entriesDb.filter(e => e.userId === currentUser?.id && e.goalId === goal.id).length,
    actionsDone: actionsDb.filter(a => a.userId === currentUser?.id && a.goalId === goal.id && a.status === "done").length,
  }));
}

// --- Notifications ---
export function getNotifPrefs(): NotificationPref[] {
  return notifsDb.filter(p => p.userId === currentUser?.id);
}

export function createNotifPref(type: string, active: boolean): NotificationPref {
  const pref: NotificationPref = {
    id: genId(), userId: currentUser!.id,
    channel: "email", type, timeOfDay: "08:00", active, createdAt: new Date(),
  };
  notifsDb.push(pref);
  return pref;
}

export function updateNotifPref(id: string, active: boolean) {
  const p = notifsDb.find(p => p.id === id && p.userId === currentUser?.id);
  if (p) p.active = active;
}
