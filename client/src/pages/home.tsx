import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle2, Circle, Target, ArrowRight, Flame } from "lucide-react";
import * as store from "@/lib/storage-client";
import { useToast } from "@/hooks/use-toast";

const EMOTION_EMOJIS: Record<string, string> = {
  bang: "\uD83D\uDE30", boos: "\uD83D\uDE20", bedroefd: "\uD83D\uDE22", gespannen: "\uD83D\uDE2C",
  beschaamd: "\uD83D\uDE33", blij: "\uD83D\uDE0A", opgelucht: "\uD83D\uDE0C", rustig: "\uD83D\uDE0C",
};

export default function HomePage() {
  const user = store.getMe();
  const { toast } = useToast();

  const [goals, setGoals] = useState(() => store.getGoals());
  const [todayActions, setTodayActions] = useState(() => store.getTodayActions());
  const [recentEntries] = useState(() => store.getEntries().slice(0, 3));

  const activeGoals = goals.filter(g => !g.archivedAt);
  const streakCount = store.getEntries().length;

  function toggleAction(id: string, currentStatus: string) {
    store.updateAction(id, currentStatus === "done" ? "planned" : "done");
    setTodayActions(store.getTodayActions());
    toast({ title: "Actie bijgewerkt", description: "Goed bezig!" });
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Goedemorgen";
    if (hour < 18) return "Goedemiddag";
    return "Goedenavond";
  };

  return (
    <div className="p-4 space-y-6">
      <div className="pt-4">
        <p className="text-muted-foreground text-sm">{greeting()},</p>
        <h1 className="text-xl font-bold text-foreground">{user?.name ?? "welkom"} &#128075;</h1>
      </div>

      <div className="bg-primary/10 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Flame size={20} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {streakCount} schema{streakCount !== 1 ? "'s" : ""} ingevuld
          </p>
          <p className="text-xs text-muted-foreground">Blijf consistent voor meer inzicht</p>
        </div>
        <div className="text-2xl font-bold text-primary">{streakCount}</div>
      </div>

      <Link href="/g-schema">
        <Button
          className="w-full h-12 text-base font-semibold rounded-xl gap-2"
          data-testid="button-new-gschema"
        >
          <Plus size={20} />
          Nieuw G-schema
        </Button>
      </Link>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Target size={16} className="text-primary" />
            Actieve doelen
          </h2>
          {activeGoals.length > 0 && (
            <span className="text-xs text-muted-foreground">{activeGoals.length} doel{activeGoals.length !== 1 ? "en" : ""}</span>
          )}
        </div>

        {activeGoals.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-6 text-center">
            <p className="text-muted-foreground text-sm mb-3">Je hebt nog geen doelen.</p>
            <Link href="/g-schema">
              <Button variant="outline" size="sm">
                Stel je eerste doel in
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {activeGoals.slice(0, 3).map(goal => (
              <Link href="/g-schema" key={goal.id}>
                <div
                  className="bg-card border border-card-border rounded-xl p-4 flex items-center gap-3 hover-elevate cursor-pointer"
                  data-testid={`card-goal-${goal.id}`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Target size={15} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{goal.title}</p>
                    <Badge variant="secondary" className="text-xs mt-0.5 capitalize">{goal.category}</Badge>
                  </div>
                  <ArrowRight size={16} className="text-muted-foreground flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-primary" />
          Jouw acties voor vandaag
        </h2>

        {todayActions.length === 0 ? (
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-muted-foreground text-sm">Geen geplande acties voor vandaag.</p>
            <p className="text-muted-foreground text-xs mt-1">Maak een G-schema aan om acties te plannen.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayActions.map(action => (
              <div
                key={action.id}
                data-testid={`action-item-${action.id}`}
                className={`bg-card border border-card-border rounded-xl p-4 flex items-start gap-3 ${
                  action.status === "done" ? "opacity-60" : ""
                }`}
              >
                <button
                  onClick={() => toggleAction(action.id, action.status)}
                  className="flex-shrink-0 mt-0.5"
                  data-testid={`button-action-toggle-${action.id}`}
                >
                  {action.status === "done" ? (
                    <CheckCircle2 size={20} className="text-primary" />
                  ) : (
                    <Circle size={20} className="text-muted-foreground" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${action.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    Als {action.ifSituation}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">dan {action.thenBehaviour}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {recentEntries.length > 0 && (
        <section>
          <h2 className="font-semibold text-foreground mb-3">Recente schema's</h2>
          <div className="space-y-2">
            {recentEntries.map((entry: any) => (
              <div key={entry.id} className="bg-card border border-card-border rounded-xl p-4">
                <p className="text-sm font-medium text-foreground truncate">{entry.event}</p>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {(entry.feelings as Array<{ label: string; intensity: number }>).map(f => (
                    <span key={f.label} className="text-xs bg-muted rounded-full px-2 py-0.5 text-muted-foreground">
                      {EMOTION_EMOJIS[f.label] ?? "&#128173;"} {f.label} {f.intensity}%
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
