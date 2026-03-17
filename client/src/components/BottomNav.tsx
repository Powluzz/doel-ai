import { useLocation, Link } from "wouter";
import { Home, BarChart2, User } from "lucide-react";

const tabs = [
  { href: "/app", label: "Vandaag", icon: Home },
  { href: "/inzicht", label: "Inzicht", icon: BarChart2 },
  { href: "/profiel", label: "Profiel", icon: User },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-card border-t border-border flex justify-around items-center h-16 z-50 px-4">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = location === href;
        return (
          <Link
            key={href}
            href={href}
            data-testid={`nav-${label.toLowerCase()}`}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-colors ${
              active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[11px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
