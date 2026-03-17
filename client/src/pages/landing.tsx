import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">Doel.AI</span>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Inloggen
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">
                Start met je eerste G-schema
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          {/* Left: tekst + CTA */}
          <div className="flex-1 space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight text-foreground">
              Breng je gedragspatronen in kaart met één eenvoudig G-schema
            </h1>
            <p className="text-lg text-muted-foreground">
              Doel.AI helpt je om gedachten, gevoelens en gedrag helder te
              krijgen, zodat je gerichter keuzes kunt maken in werk, relaties en
              persoonlijke groei.
            </p>
            <ul className="space-y-2">
              {[
                "Ontdek patronen achter stress, twijfel en uitstelgedrag.",
                "Zie hoe jouw gedachten je gevoel en gedrag sturen.",
                "Vertaal inzichten direct naar kleine, haalbare acties.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-foreground">
                  <span className="mt-1 w-4 h-4 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary block" />
                  </span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start met je eerste G-schema
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground">
                Binnen een paar minuten ingevuld. Jij bepaalt wat je deelt.
              </p>
            </div>
            <p className="text-xs text-muted-foreground border-t border-border pt-4">
              Gebaseerd op cognitieve gedragstherapie en het bewezen
              G-schema-model.
            </p>
          </div>

          {/* Right: G-schema visual */}
          <div className="flex-shrink-0 w-full md:w-72">
            <div className="bg-card border border-border rounded-2xl p-5 space-y-2 shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Voorbeeld G-schema
              </p>
              {[
                { label: "Gebeurtenis", color: "bg-blue-50 border-blue-100 text-blue-800" },
                { label: "Gedachten", color: "bg-purple-50 border-purple-100 text-purple-800" },
                { label: "Gevoelens", color: "bg-rose-50 border-rose-100 text-rose-800" },
                { label: "Gedrag", color: "bg-amber-50 border-amber-100 text-amber-800" },
                { label: "Gevolgen", color: "bg-green-50 border-green-100 text-green-800" },
              ].map((item, i) => (
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

      {/* Benefits */}
      <section className="bg-muted/40 border-y border-border py-16">
        <div className="max-w-5xl mx-auto px-6 space-y-10">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground">
            Zie sneller wat er onder je gedrag zit
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Meer zelfinzicht, minder ruis",
                body: "Met een G-schema maak je duidelijk wat er precies gebeurde, wat je dacht en wat je voelde, zodat je snapt waarom je deed wat je deed.",
              },
              {
                title: "Doorbreek terugkerende patronen",
                body: "Je ziet terugkerende patronen in situaties, gedachten en reacties, waardoor je gerichter kunt oefenen met ander gedrag.",
              },
              {
                title: "Kleine stappen, echte verandering",
                body: "In plaats van alleen nadenken, vertaal je elk inzicht naar 1–2 concrete acties die je in je dagelijkse leven kunt testen.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-card border border-border rounded-2xl p-6 space-y-3"
              >
                <h3 className="font-semibold text-foreground">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
            Doel.AI maakt het G-schema laagdrempelig, zodat je het niet alleen
            in therapie, maar ook zelfstandig kunt gebruiken voor persoonlijke
            groei.
          </p>
        </div>
      </section>

      {/* Zo werkt het */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-10">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground">
          In 3 stappen naar meer grip op je patronen
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "Stap 1 – Kies een situatie",
              body: "Kies een moment dat je is bijgebleven, bijvoorbeeld een spanningsmoment op je werk of een conflict thuis. Je hoeft alleen kort te beschrijven wat er gebeurde.",
            },
            {
              step: "Stap 2 – Beantwoord enkele vragen",
              body: "Doel.AI leidt je stap voor stap langs gebeurtenis, gedachten, gevoelens, gedrag en gevolgen, in duidelijke taal en zonder therapiejargon.",
            },
            {
              step: "Stap 3 – Maak een klein actieplan",
              body: "Aan het eind helpt Doel.AI je om 1–2 concrete acties te kiezen, zodat je bij een volgende situatie anders kunt reageren.",
            },
          ].map((s, i) => (
            <div key={s.step} className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                {i + 1}
              </div>
              <h3 className="font-semibold text-foreground">{s.step}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {s.body}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center pt-4">
          <Link href="/signup">
            <Button size="lg">Start met je eerste G-schema</Button>
          </Link>
        </div>
      </section>

      {/* Afsluitende CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-xl mx-auto px-6 text-center space-y-5">
          <h2 className="text-2xl md:text-3xl font-bold">
            Klaar om je patronen scherper te zien?
          </h2>
          <p className="text-primary-foreground/80">
            Binnen een paar minuten heb je je eerste G-schema ingevuld.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              variant="secondary"
              className="font-semibold"
            >
              Start met je eerste G-schema
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
