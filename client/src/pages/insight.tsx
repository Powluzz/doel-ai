import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, CheckCircle2, BarChart2 } from "lucide-react";
import * as store from "@/lib/storage-client";
import type { GEntry } from "@shared/schema";

const EMOTION_COLORS: Record<string, string> = {
  bang: "#ef4444",
  boos: "#f97316",
  bedroefd: "#6366f1",
  gespannen: "#f59e0b",
  beschaamd: "#ec4899",
  blij: "#22c55e",
  opgelucht: "#14b8a6",
};

const EMOTION_EMOJIS: Record<string, string> = {
  bang: "\uD83D\uDE30", boos: "\uD83D\uDE20", bedroefd: "\uD83D\uDE22", gespannen: "\uD83D\uDE2C",
  beschaamd: "\uD83D\uDE33", blij: "\uD83D\uDE0A", opgelucht: "\uD83D\uDE0C",
};

export default function InsightPage() {
  const [range, setRange] = useState<7 | 30>(7);

  const emotionData = store.getEmotionInsights(range);
  const goalsSummary = store.getGoalsSummary();
  const allEntries = store.getEntries();

  const emotionFrequency: Record<string, number> = {};
  for (const entry of allEntries) {
    for (const f of (entry.feelings as any[])) {
      emotionFrequency[f.label] = (emotionFrequency[f.label] ?? 0) + 1;
    }
  }
  const topEmotions = Object.entries(emotionFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const activeEmotions = [...new Set(emotionData.flatMap(d => Object.keys(d.emotions)))];

  const chartData = emotionData.map(d => ({
    date: d.date.slice(5),
    ...d.emotions,
  }));

  return (
    <div className="p-4 space-y-6 pb-6">
      <div className="pt-4">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <BarChart2 size={22} className="text-primary" />
          Inzicht & Patronen
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Begrijp je emoties en voortgang per doel.</p>
      </div>

      <div className="flex bg-muted rounded-xl p-1 gap-1">
        {([7, 30] as const).map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            data-testid={`button-range-${r}`}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              range === r
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {r} dagen
          </button>
        ))}
      </div>

      <section>
        <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp size={16} className="text-primary" />
          Emotietrend
        </h2>

        {!chartData.length ? (
          <div className="bg-card border border-card-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground text-sm">Nog geen data. Vul een G-schema in om te beginnen.</p>
          </div>
        ) : (
          <div className="bg-card border border-card-border rounded-xl p-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--card-border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: any, name: string) => [`${value}%`, name]}
                />
                {activeEmotions.slice(0, 5).map(emotion => (
                  <Line
                    key={emotion}
                    type="monotone"
                    dataKey={emotion}
                    stroke={EMOTION_COLORS[emotion] ?? "#94a3b8"}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>

            <div className="flex flex-wrap gap-2 mt-3">
              {activeEmotions.slice(0, 5).map(emotion => (
                <span key={emotion} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ background: EMOTION_COLORS[emotion] ?? "#94a3b8" }}
                  />
                  {EMOTION_EMOJIS[emotion]} {emotion}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {topEmotions.length > 0 && (
        <section>
          <h2 className="font-semibold text-foreground mb-3">Meest voorkomende emoties</h2>
          <div className="grid grid-cols-2 gap-2">
            {topEmotions.map(([emotion, count]) => (
              <div
                key={emotion}
                className="bg-card border border-card-border rounded-xl p-4 flex items-center gap-3"
              >
                <span className="text-2xl">{EMOTION_EMOJIS[emotion] ?? "&#128173;"}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground capitalize">{emotion}</p>
                  <p className="text-xs text-muted-foreground">{count}&#215; geregistreerd</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Target size={16} className="text-primary" />
          Voortgang per doel
        </h2>

        {goalsSummary.length === 0 ? (
          <div className="bg-card border border-card-border rounded-xl p-6 text-center">
            <p className="text-muted-foreground text-sm">Nog geen doelen om te tonen.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {goalsSummary.map((g) => (
              <div
                key={g.goalId}
                data-testid={`goal-summary-${g.goalId}`}
                className="bg-card border border-card-border rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <p className="font-medium text-sm text-foreground flex-1 pr-2">{g.goalTitle}</p>
                </div>
                <div className="flex gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <BarChart2 size={13} className="text-primary" />
                    <span>{g.entryCount} schema{g.entryCount !== 1 ? "'s" : ""}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 size={13} className="text-primary" />
                    <span>{g.actionsDone} acties gedaan</span>
                  </div>
                </div>
                {g.entryCount > 0 && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(100, (g.entryCount / 10) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{g.entryCount} / 10 entries voor volledig inzicht</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {allEntries.length > 0 && (
        <section>
          <h2 className="font-semibold text-foreground mb-3">Tijdlijn</h2>
          <div className="space-y-2">
            {allEntries.slice(0, 10).map((entry: GEntry) => (
              <div
                key={entry.id}
                data-testid={`entry-timeline-${entry.id}`}
                className="bg-card border border-card-border rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-foreground flex-1 pr-2 truncate">{entry.event}</p>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {new Date(entry.timestamp).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {(entry.feelings as any[]).map((f: any) => (
                    <Badge key={f.label} variant="secondary" className="text-xs">
                      {EMOTION_EMOJIS[f.label] ?? "&#128173;"} {f.label} {f.intensity}%
                    </Badge>
                  ))}
                </div>
                {entry.helpfulThought && (
                  <p className="text-xs text-muted-foreground mt-2 italic">&#128161; "{entry.helpfulThought}"</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
