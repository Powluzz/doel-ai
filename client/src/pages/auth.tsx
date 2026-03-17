import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { login, register } from "@/lib/storage-client";

interface AuthPageProps {
  onAuth: () => void;
  initialMode?: "login" | "register";
}

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
      if (mode === "login") {
        login(email, password);
      } else {
        register(email, password, name);
      }
      onAuth();
    } catch (err: any) {
      toast({ title: "Fout", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
            <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8" aria-label="Doel.ai logo">
              <circle cx="16" cy="16" r="12" stroke="white" strokeWidth="2.5" fill="none" />
              <circle cx="16" cy="16" r="5" fill="white" />
              <path d="M16 4 L16 8M16 24 L16 28M4 16 L8 16M24 16 L28 16" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Doel.ai</h1>
          <p className="text-muted-foreground text-sm mt-1">Werk stap voor stap aan je doelen</p>
        </div>

        <Card className="border-border shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">
              {mode === "login" ? "Inloggen" : "Account aanmaken"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Welkom terug. Log in om verder te gaan."
                : "Begin vandaag met je G-schema's."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full"
                disabled={loading}
                data-testid="button-submit"
              >
                {loading ? "Even geduld..." : mode === "login" ? "Inloggen" : "Account aanmaken"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              {mode === "login" ? "Nog geen account?" : "Al een account?"}{" "}
              <button
                type="button"
                className="text-primary font-medium hover:underline"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login" ? "Aanmelden" : "Inloggen"}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
