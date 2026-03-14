import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Archive, Bell, LogOut, Plus, Target, User } from "lucide-react";
import * as store from "@/lib/storage-client";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  { value: "werk", label: "Werk" },
  { value: "relaties", label: "Relaties" },
  { value: "gezondheid", label: "Gezondheid" },
  { value: "zelfbeeld", label: "Zelfbeeld" },
  { value: "overig", label: "Overig" },
];

export default function ProfilePage() {
  const user = store.getMe();
  const { toast } = useToast();

  const [showNewGoal, setShowNewGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState("overig");

  const [allGoals, setAllGoals] = useState(() =>
    store.getAllGoals().map(g => ({ id: g.id, title: g.title, category: g.category, archivedAt: g.archivedAt }))
  );

  const [notifPrefs, setNotifPrefs] = useState(() => store.getNotifPrefs());

  const activeGoals = allGoals.filter(g => !g.archivedAt);
  const archivedGoals = allGoals.filter(g => g.archivedAt);

  const dailyCheckin = notifPrefs.find(p => p.type === "daily_checkin");
  const actionReminder = notifPrefs.find(p => p.type === "action_reminder");

  function handleCreateGoal() {
    if (!newGoalTitle.trim()) return;
    try {
      const goal = store.createGoal(newGoalTitle.trim(), newGoalCategory);
      setAllGoals(prev => [{ id: goal.id, title: goal.title, category: goal.category, archivedAt: null }, ...prev]);
      setShowNewGoal(false);
      setNewGoalTitle("");
      toast({ title: "Doel aangemaakt!" });
    } catch (err: any) {
      toast({ title: "Fout", description: err.message, variant: "destructive" });
    }
  }

  function handleArchiveGoal(id: string, archive: boolean) {
    store.archiveGoal(id, archive);
    setAllGoals(prev =>
      prev.map(g => g.id === id ? { ...g, archivedAt: archive ? new Date() : null } : g)
    );
  }

  function handleNotifToggle(type: string, active: boolean) {
    const existing = notifPrefs.find(p => p.type === type);
    if (existing) {
      store.updateNotifPref(existing.id, active);
    } else {
      store.createNotifPref(type, active);
    }
    setNotifPrefs(store.getNotifPrefs());
  }

  function handleLogout() {
    store.logout();
    window.location.reload();
  }

  return (
    <div className="p-4 space-y-6 pb-6">
      <div className="pt-4">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <User size={22} className="text-primary" />
          Profiel
        </h1>
      </div>

      <div className="bg-card border border-card-border rounded-xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg flex-shrink-0">
          {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground">{user?.name}</p>
          <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Target size={16} className="text-primary" />
            Mijn doelen
          </h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowNewGoal(true)}
            data-testid="button-add-goal"
            className="gap-1 h-8"
          >
            <Plus size={14} /> Nieuw doel
          </Button>
        </div>

        {activeGoals.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-6 text-center">
            <p className="text-muted-foreground text-sm">Nog geen actieve doelen.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeGoals.map(goal => (
              <div
                key={goal.id}
                data-testid={`goal-card-${goal.id}`}
                className="bg-card border border-card-border rounded-xl p-4 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">{goal.title}</p>
                  <Badge variant="secondary" className="text-xs capitalize mt-0.5">{goal.category}</Badge>
                </div>
                <button
                  onClick={() => handleArchiveGoal(goal.id, true)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
                  title="Archiveren"
                  data-testid={`button-archive-${goal.id}`}
                >
                  <Archive size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {archivedGoals.length > 0 && (
          <details className="mt-3">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              {archivedGoals.length} gearchiveerd doel{archivedGoals.length !== 1 ? "en" : ""}
            </summary>
            <div className="space-y-2 mt-2">
              {archivedGoals.map(goal => (
                <div key={goal.id} className="bg-muted/50 rounded-xl p-4 flex items-center gap-3 opacity-60">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">{goal.title}</p>
                  </div>
                  <button
                    onClick={() => handleArchiveGoal(goal.id, false)}
                    className="text-xs text-primary hover:underline"
                    data-testid={`button-unarchive-${goal.id}`}
                  >
                    Herstellen
                  </button>
                </div>
              ))}
            </div>
          </details>
        )}
      </section>

      <section>
        <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Bell size={16} className="text-primary" />
          Herinneringen
        </h2>

        <div className="bg-card border border-card-border rounded-xl divide-y divide-border">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Dagelijkse check-in</p>
              <p className="text-xs text-muted-foreground">Herinnering om een G-schema in te vullen</p>
            </div>
            <Switch
              data-testid="switch-daily-checkin"
              checked={dailyCheckin?.active ?? false}
              onCheckedChange={(active) => handleNotifToggle("daily_checkin", active)}
            />
          </div>

          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Actie-herinnering</p>
              <p className="text-xs text-muted-foreground">Reminder bij geplande Als-Dan acties</p>
            </div>
            <Switch
              data-testid="switch-action-reminder"
              checked={actionReminder?.active ?? false}
              onCheckedChange={(active) => handleNotifToggle("action_reminder", active)}
            />
          </div>
        </div>
      </section>

      <Button
        variant="outline"
        className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
        onClick={handleLogout}
        data-testid="button-logout"
      >
        <LogOut size={16} />
        Uitloggen
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        <a href="https://www.perplexity.ai/computer" target="_blank" rel="noopener noreferrer" className="hover:underline">
          Gebouwd met Perplexity Computer
        </a>
      </p>

      <Dialog open={showNewGoal} onOpenChange={setShowNewGoal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuw doel aanmaken</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Omschrijf je doel in 1 zin</Label>
              <Input
                data-testid="input-profile-goal-title"
                placeholder="Bijv. Minder spanning ervaren op zondagavond"
                value={newGoalTitle}
                onChange={e => setNewGoalTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Categorie</Label>
              <Select value={newGoalCategory} onValueChange={setNewGoalCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              disabled={!newGoalTitle.trim()}
              onClick={handleCreateGoal}
              data-testid="button-save-goal"
            >
              Doel aanmaken
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
