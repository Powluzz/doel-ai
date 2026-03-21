import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, CheckCircle2, BarChart2 } from "lucide-react";
import * as store from "@/lib/storage-client";

const EMOTION_COLORS: Record<string, string> = {
  bang: "#ef4444", boos: "#f97316", bedroefd: "#6366f1", gespannen: "#f59e0b",
  beschaamd: "#ec4899", blij: "#22c55e", opgelucht: "#14b8a6",
};

const EMOTION_EMOJIS: Record<string, string> = {
  bang: "\uD83D\uDE30", boos: "\uD83D\uDE20", bedroefd: "\uD83D\uDE22", gespannen: "\uD83D\uDE2C",
  beschaamd: "\uD83D\uDE33", blij: "\uD83D\uDE0A", opgelucht: "\uD83D\uDE0C",
};

export default function InsightPage() {
  const [range, setRange] = useState<7 | 30>(7);

  const { data: emotionData = [] } = useQuery({ queryKey: ["insights", "emotions", range], queryFn: () => store.getEmotionInsights(range) });
  const { data: goalsSummary = [] } = useQuery({ queryKey: ["insights", "goals-summary"], queryFn: () => store.getGoalsSummary() });
  const { data: allEntries = [] } = useQuery({ queryKey: ["entries"], queryFn: () => store.getEntries() });

  const emotionFrequency: Record<string, number> = {};
  for (const entry of allEntries) {
    for (const f of (entry.feelings as any[])) {
      emotionFrequency[f.label] = (emotionFrequency[f.label] ?? 0) + 1;
    }
  }
  const topEmotions = Object.entries(emotionFrequency).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const activeEmotions = [...new Set(emotionData.flatMap((d: any) => Object.keys(d.emotions)))];
  const chartData = emotionData.map((d: any) => ({ date: d.date.slice(5), ...d.emotions }));

  return (
    <div className="p-4 space-y-6">
      <div className="pt-4">
        <h1 className="text-xl font-bold text-foreground">Inzicht & Patronen</h1>
        <p className="text-sm text-muted-foreground mt-1">Begrijp je emoties en voortgang per doel.</p>
      </div>

      <div className="flex bg-muted rounded-xl p-1 gap-1">
        {([7, 30] as const).map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            data-testid={`button-range-${r}`}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              range === r ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {r} dagen
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="font-semibold text-foreground mb-4">Emotietrend</h2>
        {!chartData.length ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nog geen data. Vul een G-schema in om te beginnen.
          </p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: any, name: string) => [`${value}%`, name]} />
                {(activeEmotions as string[]).slice(0, 5).map(emotion => (
                  <Line key={emotion} type="monotone" dataKey={emotion} stroke={EMOTION_COLORS[emotion] ?? "#94a3b8"} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-3">
              {(activeEmotions as string[]).slice(0, 5).map(emotion => (
                <Badge key={emotion} variant="outline" style={{ borderColor: EMOTION_COLORS[emotion], color: EMOTION_COLORS[emotion] }}>
                  {EMOTION_EMOJIS[emotion]} {emotion}
                </Badge>
              ))}
            </div>
          </>
        )}
      </div>

      {topEmotions.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="font-semibold text-foreground mb-3">Meest voorkomende emoties</h2>
          <div className="space-y-3">
            {topEmotions.map(([emotion, count]) => (
              <div key={emotion} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-base" style={{ backgroundColor: (EMOTION_COLORS[emotion] ?? "#94a3b8") + "20" }}>
                  {EMOTION_EMOJIS[emotion] ?? "\uD83D\uDCAD"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground capitalize">{emotion}</p>
                  <p className="text-xs text-muted-foreground">{count}\xD7 geregistreerd</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="font-semibold text-foreground mb-3">Voortgang per doel</h2>
        {goalsSummary.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nog geen doelen om te tonen.</p>
        ) : (
          <div className="space-y-4">
            {goalsSummary.map((g: any) => (
              <div key={g.goalId}>
                <p className="text-sm font-medium text-foreground">{g.goalTitle}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">{g.entryCount} schema{g.entryCount !== 1 ? "'s" : ""}</Badge>
                  <Badge variant="outline" className="text-xs">{g.actionsDone} acties gedaan</Badge>
                </div>
                {g.entryCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">{g.entryCount} / 10 entries voor volledig inzicht</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {allEntries.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="font-semibold text-foreground mb-3">Tijdlijn</h2>
          <div className="space-y-4">
            {allEntries.slice(0, 10).map((entry: any) => (
              <div key={entry.id} className="border-l-2 border-primary/30 pl-3">
                <p className="text-sm font-medium text-foreground">{entry.event}</p>
                <Badge variant="outline" className="text-xs mt-1">
                  {new Date(entry.timestamp).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                </Badge>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(entry.feelings as any[]).map((f: any) => (
                    <Badge key={f.label} variant="secondary" className="text-xs">
                      {EMOTION_EMOJIS[f.label] ?? "\uD83D\uDCAD"} {f.label} {f.intensity}%
                    </Badge>
                  ))}
                </div>
                {entry.helpfulThought && (
                  <p className="text-xs text-muted-foreground mt-2 italic">\uD83D\uDCA1 "{entry.helpfulThought}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
