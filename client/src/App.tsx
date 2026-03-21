import { Switch, Route, Redirect } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import { getToken } from "./lib/auth";
import { Router } from "wouter";
import AuthPage from "./pages/auth";
import LandingPage from "./pages/landing";
import HomePage from "./pages/home";
import GSchemaWizard from "./pages/g-schema-wizard";
import InsightPage from "./pages/insight";
import ProfilePage from "./pages/profile";
import NotFound from "./pages/not-found";
import BottomNav from "./components/BottomNav";
import Logo from "./components/Logo";

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto relative">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 py-3 flex items-center">
          <Logo variant="kleur" size="full" height={26} />
        </div>
      </header>
      <main className="flex-1 pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

function AppRoutes() {
  const [authed, setAuthed] = useState(!!getToken());
  return (
    <Switch>
      {/* Public: marketing landing */}
      <Route path="/" component={LandingPage} />
      {/* Public: auth */}
      <Route path="/login">
        {authed ? (
          <Redirect to="/app" />
        ) : (
          <AuthPage onAuth={() => setAuthed(true)} />
        )}
      </Route>
      <Route path="/signup">
        {authed ? (
          <Redirect to="/app" />
        ) : (
          <AuthPage onAuth={() => setAuthed(true)} initialMode="register" />
        )}
      </Route>
      {/* Protected: app shell */}
      <Route path="/app">
        {authed ? (
          <AppShell><HomePage /></AppShell>
        ) : (
          <Redirect to="/login" />
        )}
      </Route>
      <Route path="/g-schema">
        {authed ? (
          <AppShell><GSchemaWizard /></AppShell>
        ) : (
          <Redirect to="/login" />
        )}
      </Route>
      <Route path="/inzicht">
        {authed ? (
          <AppShell><InsightPage /></AppShell>
        ) : (
          <Redirect to="/login" />
        )}
      </Route>
      <Route path="/profiel">
        {authed ? (
          <AppShell><ProfilePage /></AppShell>
        ) : (
          <Redirect to="/login" />
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <Router hook={useHashLocation}>
      <AppRoutes />
      <Toaster />
    </Router>
  );
}
