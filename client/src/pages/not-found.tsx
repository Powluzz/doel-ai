import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-5xl">&#128269;</p>
      <h1 className="text-xl font-bold text-foreground">Pagina niet gevonden</h1>
      <p className="text-muted-foreground text-sm">Deze pagina bestaat niet of is verplaatst.</p>
      <Link href="/app">
        <Button>Terug naar Vandaag</Button>
      </Link>
    </div>
  );
}
