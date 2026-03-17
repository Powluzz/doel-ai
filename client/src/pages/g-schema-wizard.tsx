import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ArrowRight, Plus, Check, Target, Sparkles } from "lucide-react";
import * as store from "@/lib/storage-client";
import { useToast } from "@/hooks/use-toast";

type Emotion = { label: string; intensity: number };
type HelpRating = "ja" | "een_beetje" | "nee";

interface WizardState {
  step: number;
  goalId: string;
  event: string;
  feelings: Emotion[];
  bodyNote: string;
  thoughts: string;
  behaviour: string;
  consequence: string;
  helpsGoal: HelpRating | "";
  helpfulThought: string;
  ifSituation: string;
  thenBehaviour: string;
}

const EMOTIONS = ["bang", "boos", "bedroefd", "gespannen", "beschaamd", "blij", "opgelucht"];
const EMOTION_EMOJIS: Record<string, string> = {
  bang: "\uD83D\uDE30", boos: "\uD83D\uDE20", bedroefd: "\uD83D\uDE22", gespannen: "\uD83D\uDE2C",
  beschaamd: "\uD83D\uDE33", blij: "\uD83D\uDE0A", opgelucht: "\uD83D\uDE0C",
};
const THOUGHT_SUGGESTIONS = [
  "Ik kan dit niet aan",
  "Ik faal als dit misgaat",
  "Ze zullen wel denken dat...",
  "Het gaat toch fout",
  "Ik ben niet goed genoeg",
];
const CATEGORIES = [
  { value: "werk", label: "Werk" },
  { value: "relaties", label: "Relaties" },
  { value: "gezondheid", label: "Gezondheid" },
  { value: "zelfbeeld", label: "Zelfbeeld" },
  { value: "overig", label: "Overig" },
];

const STEPS = [
  "Doel",
  "Gebeurtenis",
  "Gevoelens",
  "Gedachten",
  "Gedrag & Gevolg",
  "Reflectie",
  "Actie",
  "Klaar",
];

export default function GSchemaWizard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState("overig");
  const [isSaving, setIsSaving] = useState(false);

  const [goals, setGoals] = useState(() => store.getGoals());

  const [state, setState] = useState<WizardState>({
    step: 0,
    goalId: "",
    event: "",
    feelings: [],
    bodyNote: "",
    thoughts: "",
    behaviour: "",
    consequence: "",
    helpsGoal: "",
    helpfulThought: "",
    ifSituation: "",
    thenBehaviour: "",
  });

  const activeGoals = goals.filter(g => !g.archivedAt);
  const selectedGoal = activeGoals.find(g => g.id === state.goalId);

  function handleCreateGoal() {
    if (!newGoalTitle.trim()) return;
    try {
      const goal = store.createGoal(newGoalTitle.trim(), newGoalCategory);
      setGoals(store.getGoals());
      setState(s => ({ ...s, goalId: goal.id }));
      setShowNewGoal(false);
      setNewGoalTitle("");
    } catch (err: any) {
      toast({ title: "Fout", description: err.message, variant: "destructive" });
    }
  }

  function toggleEmotion(label: string) {
    setState(s => {
      const exists = s.feelings.find(f => f.label === label);
      if (exists) {
        return { ...s, feelings: s.feelings.filter(f => f.label !== label) };
      }
      return { ...s, feelings: [...s.feelings, { label, intensity: 50 }] };
    });
  }

  function updateIntensity(label: string, intensity: number) {
    setState(s => ({
      ...s,
      feelings: s.feelings.map(f => f.label === label ? { ...f, intensity } : f),
    }));
  }

  function canNext(): boolean {
    switch (state.step) {
      case 0: return !!state.goalId;
      case 1: return state.event.trim().length > 0;
      case 2: return state.feelings.length > 0;
      case 3: return state.thoughts.trim().length > 0;
      case 4: return true;
      case 5: return true;
      case 6: return true;
      default: return true;
    }
  }

  function next() {
    if (state.step === 6) {
      setIsSaving(true);
      try {
        const entry = store.createEntry({
          goalId: state.goalId,
          event: state.event,
          thoughts: state.thoughts,
          feelings: state.feelings,
          behaviour: state.behaviour || undefined,
          consequence: state.consequence || undefined,
          helpfulThought: state.helpfulThought || undefined,
          helpsGoal: state.helpsGoal || undefined,
        });
        if (state.ifSituation && state.thenBehaviour) {
          store.createAction({
            goalId: state.goalId,
            gEntryId: entry.id,
            ifSituation: state.ifSituation,
            thenBehaviour: state.thenBehaviour,
          });
        }
        setState(s => ({ ...s, step: 7 }));
      } catch (err: any) {
        toast({ title: "Fout", description: err.message, variant: "destructive" });
      } finally {
        setIsSaving(false);
      }
      return;
    }
    setState(s => ({ ...s, step: s.step + 1 }));
  }

  function back() {
    if (state.step === 0) { navigate("/app"); return; }
    setState(s => ({ ...s, step: s.step - 1 }));
  }

  const progress = Math.round((state.step / 7) * 100);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {state.step < 7 && (
        <div className="sticky top-0 bg-background/95 backdrop-blur z-10 px-4 pt-4 pb-3 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={back}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Stap {state.step + 1} van 7</p>
              <p className="text-sm font-semibold text-foreground">{STEPS[state.step]}</p>
            </div>
            {selectedGoal && (
              <Badge variant="secondary" className="text-xs truncate max-w-[120px]">
                \uD83C\uDFAF {selectedGoal.title}
              </Badge>
            )}
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 p-4">
        {state.step === 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Welk doel wil je behalen?</h2>
              <p className="text-sm text-muted-foreground mt-1">Kies een doel waar je nu aan wilt werken. Je G-schema helpt je om daar stappen in te zetten.</p>
            </div>

            <div className="space-y-2">
              {activeGoals.map(goal => (
                <button
                  key={goal.id}
                  data-testid={`goal-select-${goal.id}`}
                  onClick={() => setState(s => ({ ...s, goalId: goal.id }))}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    state.goalId === goal.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      state.goalId === goal.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      <Target size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{goal.title}</p>
                      <Badge variant="secondary" className="text-xs capitalize mt-0.5">{goal.category}</Badge>
                    </div>
                    {state.goalId === goal.id && <Check size={18} className="text-primary flex-shrink-0" />}
                  </div>
                </button>
              ))}

              <button
                onClick={() => setShowNewGoal(true)}
                data-testid="button-new-goal"
                className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-muted/50 transition-all flex items-center gap-3 text-muted-foreground"
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Plus size={16} />
                </div>
                <span className="text-sm">Nieuw doel aanmaken</span>
              </button>
            </div>
          </div>
        )}

        {state.step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Wat gebeurde er rondom dit doel?</h2>
              <p className="text-sm text-muted-foreground mt-1">Beschrijf kort een recente situatie die te maken heeft met "{selectedGoal?.title}".</p>
            </div>
            <Textarea
              data-testid="input-event"
              placeholder="Bijvoorbeeld: Mijn leidinggevende stuurde laat op de avond een mail..."
              value={state.event}
              onChange={e => setState(s => ({ ...s, event: e.target.value }))}
              rows={3}
              className="resize-none"
            />
            <div>
              <p className="text-xs text-muted-foreground mb-2">Of kies een suggestie:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Telefoontje van collega na werktijd",
                  "Opmerking tijdens vergadering",
                  "Bericht van leidinggevende",
                  "Discussie met een naaste",
                ].map(s => (
                  <button
                    key={s}
                    onClick={() => setState(st => ({ ...st, event: s }))}
                    className="text-xs bg-muted hover:bg-muted/70 rounded-full px-3 py-1.5 text-muted-foreground transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {state.step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Hoe voelde je je in dat moment?</h2>
              <p className="text-sm text-muted-foreground mt-1">Selecteer de emoties die je voelde en stel de intensiteit in.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map(emotion => {
                const selected = state.feelings.find(f => f.label === emotion);
                return (
                  <button
                    key={emotion}
                    onClick={() => toggleEmotion(emotion)}
                    data-testid={`emotion-chip-${emotion}`}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                    }`}
                  >
                    {EMOTION_EMOJIS[emotion]} {emotion}
                  </button>
                );
              })}
            </div>

            {state.feelings.length > 0 && (
              <div className="space-y-4 mt-2">
                {state.feelings.map(feeling => (
                  <div key={feeling.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {EMOTION_EMOJIS[feeling.label]} {feeling.label}
                      </span>
                      <span className="text-sm font-bold text-primary">{feeling.intensity}%</span>
                    </div>
                    <Slider
                      value={[feeling.intensity]}
                      onValueChange={([v]) => updateIntensity(feeling.label, v)}
                      min={0}
                      max={100}
                      step={5}
                      data-testid={`slider-${feeling.label}`}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Wat merkte je in je lichaam? (optioneel)</Label>
              <Input
                placeholder="Bijv. gespannen schouders, hartkloppingen..."
                value={state.bodyNote}
                onChange={e => setState(s => ({ ...s, bodyNote: e.target.value }))}
              />
            </div>
          </div>
        )}

        {state.step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Welke gedachte ging er door je heen?</h2>
              <p className="text-sm text-muted-foreground mt-1">Kies de gedachte die je het meest bezighoudt in deze situatie.</p>
            </div>
            <Textarea
              data-testid="input-thoughts"
              placeholder="Schrijf je gedachte op..."
              value={state.thoughts}
              onChange={e => setState(s => ({ ...s, thoughts: e.target.value }))}
              rows={3}
              className="resize-none"
            />
            <div>
              <p className="text-xs text-muted-foreground mb-2">Veelvoorkomende gedachten:</p>
              <div className="space-y-1.5">
                {THOUGHT_SUGGESTIONS.map(t => (
                  <button
                    key={t}
                    onClick={() => setState(s => ({ ...s, thoughts: t }))}
                    className="w-full text-left text-xs bg-muted hover:bg-muted/70 rounded-lg px-3 py-2 text-muted-foreground transition-colors"
                  >
                    "{t}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {state.step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-foreground">Gedrag & Gevolg</h2>
              <p className="text-sm text-muted-foreground mt-1">Wat deed je? Wat was het gevolg? Vermijding is ook gedrag.</p>
            </div>
            <div className="space-y-2">
              <Label>Wat deed je op dat moment?</Label>
              <Textarea
                data-testid="input-behaviour"
                placeholder="Bijv. Ik trok me terug, ik reageerde niet, ik probeerde het te negeren..."
                value={state.behaviour}
                onChange={e => setState(s => ({ ...s, behaviour: e.target.value }))}
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Wat was het gevolg op korte termijn?</Label>
              <Textarea
                data-testid="input-consequence"
                placeholder="Bijv. Ik voelde me even beter, maar daarna toch onrustig..."
                value={state.consequence}
                onChange={e => setState(s => ({ ...s, consequence: e.target.value }))}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        )}

        {state.step === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-foreground">Reflectie</h2>
              <p className="text-sm text-muted-foreground mt-1">Hier maak je het klinische stuk licht en doelgericht.</p>
            </div>

            <div className="space-y-2">
              <Label>Hoe helpt de gedachte "{state.thoughts.slice(0, 40)}{state.thoughts.length > 40 ? "..." : ""}" je om je doel te behalen?</Label>
              <div className="flex gap-2">
                {(["ja", "een_beetje", "nee"] as HelpRating[]).map(rating => (
                  <button
                    key={rating}
                    onClick={() => setState(s => ({ ...s, helpsGoal: rating }))}
                    data-testid={`button-helps-${rating}`}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                      state.helpsGoal === rating
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                    }`}
                  >
                    {rating === "ja" ? "Helpt \u2713" : rating === "een_beetje" ? "Een beetje" : "Helpt niet"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Wat is een helpendere gedachte die ook klopt en je meer helpt richting je doel?</Label>
              <Textarea
                data-testid="input-helpful-thought"
                placeholder="Bijv. Ik kan dit stap voor stap aanpakken en om hulp vragen als het nodig is..."
                value={state.helpfulThought}
                onChange={e => setState(s => ({ ...s, helpfulThought: e.target.value }))}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        )}

        {state.step === 6 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-foreground">Welke kleine actie wil je proberen?</h2>
              <p className="text-sm text-muted-foreground mt-1">Zo maak je de stap van inzicht naar gedrag. Hou het heel klein.</p>
            </div>

            <div className="bg-muted/40 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Als-Dan plan</p>
              <div className="space-y-2">
                <Label className="text-sm">Als...</Label>
                <Input
                  data-testid="input-if-situation"
                  placeholder="situatie of trigger"
                  value={state.ifSituation}
                  onChange={e => setState(s => ({ ...s, ifSituation: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">dan ga ik...</Label>
                <Input
                  data-testid="input-then-behaviour"
                  placeholder="nieuw gedrag proberen"
                  value={state.thenBehaviour}
                  onChange={e => setState(s => ({ ...s, thenBehaviour: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Suggesties:</p>
              <div className="space-y-1.5">
                {[
                  { if: "ik een mail ontvang na werktijd", then: "lees ik hem, maar beantwoord ik hem pas morgen" },
                  { if: "ik me gespannen voel", then: "doe ik 3 keer diep ademhalen voor ik reageer" },
                  { if: "ik negatieve gedachten heb", then: "schrijf ik ze op in mijn dagboek" },
                ].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setState(st => ({ ...st, ifSituation: s.if, thenBehaviour: s.then }))}
                    className="w-full text-left text-xs bg-muted hover:bg-muted/70 rounded-lg px-3 py-2 text-muted-foreground transition-colors"
                  >
                    Als <strong>{s.if}</strong>, dan {s.then}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {state.step === 7 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles size={36} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Mooi, je hebt aan "{selectedGoal?.title}" gewerkt!
              </h2>
              <p className="text-muted-foreground text-sm">
                Elke situatie die je zo onderzoekt, is een oefening richting je doel. Kleine stappen tellen op.
              </p>
            </div>

            <div className="w-full bg-card border border-card-border rounded-xl p-4 text-left space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Samenvatting</p>
              <div>
                <p className="text-xs text-muted-foreground">Gebeurtenis</p>
                <p className="text-sm text-foreground">{state.event}</p>
              </div>
              {state.helpfulThought && (
                <div>
                  <p className="text-xs text-muted-foreground">Helpende gedachte</p>
                  <p className="text-sm text-foreground">{state.helpfulThought}</p>
                </div>
              )}
              {state.ifSituation && state.thenBehaviour && (
                <div>
                  <p className="text-xs text-muted-foreground">Geplande actie</p>
                  <p className="text-sm text-foreground">Als {state.ifSituation}, dan {state.thenBehaviour}</p>
                </div>
              )}
            </div>

            <div className="w-full space-y-2">
              <Button className="w-full" onClick={() => navigate("/app")} data-testid="button-go-home">
                Actie toevoegen aan Vandaag
              </Button>
              <Button variant="outline" className="w-full" onClick={() => {
                setState({ step: 0, goalId: "", event: "", feelings: [], bodyNote: "", thoughts: "",
                  behaviour: "", consequence: "", helpsGoal: "", helpfulThought: "", ifSituation: "", thenBehaviour: "" });
              }}
                data-testid="button-new-entry"
              >
                Nog een situatie invullen
              </Button>
            </div>
          </div>
        )}
      </div>

      {state.step < 7 && (
        <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border px-4 py-3">
          <Button
            onClick={next}
            disabled={!canNext() || isSaving}
            className="w-full gap-2"
            data-testid="button-next"
          >
            {isSaving ? (
              "Opslaan..."
            ) : state.step === 6 ? (
              <>Opslaan <Check size={16} /></>
            ) : (
              <>Volgende <ArrowRight size={16} /></>
            )}
          </Button>
        </div>
      )}

      <Dialog open={showNewGoal} onOpenChange={setShowNewGoal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuw doel aanmaken</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Omschrijf je doel in 1 zin</Label>
              <Input
                data-testid="input-new-goal-title"
                placeholder="Bijv. Minder spanning ervaren op zondagavond"
                value={newGoalTitle}
                onChange={e => setNewGoalTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Categorie</Label>
              <Select value={newGoalCategory} onValueChange={setNewGoalCategory}>
                <SelectTrigger data-testid="select-goal-category">
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
              data-testid="button-create-goal"
            >
              Doel aanmaken & starten
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
