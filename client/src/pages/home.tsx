import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  const { data: goals = [] } = useQuery({ queryKey: ["goals"], queryFn: () => store.getGoals() });
  const { data: todayActions = [] } = useQuery({ queryKey: ["actions", "today"], queryFn: () => store.getTodayActions() });
  const { data: allEntries = [] } = useQuery({ queryKey: ["entries"], queryFn: () => store.getEntries() });

  const activeGoals = goals.filter((g: any) => !g.archivedAt);
  const recentEntries = allEntries.slice(0, 3);
  const streakCount = allEntries.length;

  async function toggleAction(id: string, currentStatus: string) {
    await store.updateAction(id, currentStatus === "done" ? "planned" : "done");
    queryClient.invalidateQueries({ queryKey: ["actions", "today"] });
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
        <div className="flex-1">
          <p className="font-semibold text-foreground">
            {streakCount} schema{streakCount !== 1 ? "'s" : ""} ingevuld
          </p>
          <p className="text-xs text-muted-foreground">Blijf consistent voor meer inzicht</p>
        </div>
        <span className="text-2xl font-bold text-primary">{streakCount}</span>
      </div>

      <Link href="/schema">
        <Button className="w-full gap-2"><Plus size={18} /> Nieuw G-schema</Button>
      </Link>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Actieve doelen</h2>
          {activeGoals.length > 0 && (
            <Badge variant="secondary">{activeGoals.length} doel{activeGoals.length !== 1 ? "en" : ""}</Badge>
          )}
        </div>
        {activeGoals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Je hebt nog geen doelen.</p>
            <Link href="/profiel"><Button variant="link" size="sm">Stel je eerste doel in</Button></Link>
          </div>
        ) : (
          <div className="space-y-2">
            {activeGoals.slice(0, 3).map((goal: any) => (
              <div key={goal.id} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-foreground">{goal.title}</p>
                  <Badge variant="outline" className="text-xs mt-1">{goal.category}</Badge>
                </div>
                <ArrowRight size={16} className="text-muted-foreground" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-semibold text-foreground mb-3">Jouw acties voor vandaag</h2>
        {todayActions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">Geen geplande acties voor vandaag.</p>
            <p className="text-xs mt-1">Maak een G-schema aan om acties te plannen.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayActions.map((action: any) => (
              <div key={action.id} className="bg-card border border-border rounded-xl p-3 flex items-start gap-3">
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
                  <p className="text-sm text-muted-foreground">Als {action.ifSituation}</p>
                  <p className="text-sm font-medium text-foreground">dan {action.thenBehaviour}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {recentEntries.length > 0 && (
        <div>
          <h2 className="font-semibold text-foreground mb-3">Recente schema's</h2>
          <div className="space-y-2">
            {recentEntries.map((entry: any) => (
              <div key={entry.id} className="bg-card border border-border rounded-xl p-3">
                <p className="text-sm font-medium text-foreground">{entry.event}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(entry.feelings as Array<{ label: string; intensity: number }>).map(f => (
                    <Badge key={f.label} variant="secondary" className="text-xs">
                      {EMOTION_EMOJIS[f.label] ?? "\uD83D\uDCAD"} {f.label} {f.intensity}%
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
