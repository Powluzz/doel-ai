import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { setAuth } from "@/lib/auth";
import Logo from "@/components/Logo";

interface AuthPageProps {
  onAuth: () => void;
  initialMode?: "login" | "register";
}

const gSchema = [
  { label: "Gebeurtenis", color: "bg-blue-50 border-blue-100 text-blue-800" },
  { label: "Gedachten", color: "bg-purple-50 border-purple-100 text-purple-800" },
  { label: "Gevoelens", color: "bg-rose-50 border-rose-100 text-rose-800" },
  { label: "Gedrag", color: "bg-amber-50 border-amber-100 text-amber-800" },
  { label: "Gevolgen", color: "bg-green-50 border-green-100 text-green-800" },
];

export default function AuthPage({ onAuth, initialMode = "login" }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body: any = { email, password };
      if (mode === "register") body.name = name;
      const data = await apiRequest("POST", endpoint, body);
      setAuth(data.token, data.user);
      onAuth();
    } catch (err: any) {
      toast({ title: "Fout", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo variant="kleur" size="full" height={28} className="cursor-pointer" />
          </Link>
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Nog geen account? Aanmelden" : "Al een account? Inloggen"}
          </button>
        </div>
      </header>
      {/* Hero split */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          {/* Links: formulier */}
          <div className="flex-1 space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight text-foreground">
              {mode === "login" ? "Welkom terug" : "Begin vandaag"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {mode === "login"
                ? "Log in en ga verder aan je doelen."
                : "Maak een account aan en start met je eerste G-schema."}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Naam</Label>
                  <Input
                    id="name"
                    data-testid="input-name"
                    placeholder="Jouw naam"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mailadres</Label>
                <Input
                  id="email"
                  data-testid="input-email"
                  type="email"
                  placeholder="jij@voorbeeld.nl"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Wachtwoord</Label>
                <Input
                  id="password"
                  data-testid="input-password"
                  type="password"
                  placeholder={mode === "register" ? "Minimaal 6 tekens" : "Je wachtwoord"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={mode === "register" ? 6 : 1}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
                data-testid="button-submit"
              >
                {loading ? "Even geduld..." : mode === "login" ? "Inloggen" : "Account aanmaken"}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground border-t border-border pt-4">
              Gebaseerd op cognitieve gedragstherapie en het bewezen G-schema-model.
            </p>
          </div>
          {/* Rechts: G-schema visual */}
          <div className="flex-shrink-0 w-full md:w-72">
            <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Voorbeeld G-schema
              </p>
              {gSchema.map((item, i) => (
                <div
                  key={item.label}
                  className={`rounded-xl border px-4 py-3 ${item.color} text-sm font-medium flex items-center gap-3`}
                >
                  <span className="w-5 h-5 rounded-full bg-white/60 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
