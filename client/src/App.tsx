import { Switch, Route } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import { getMe } from "./lib/storage-client";
import { Router } from "wouter";

import AuthPage from "./pages/auth";
import HomePage from "./pages/home";
import GSchemaWizard from "./pages/g-schema-wizard";
import InsightPage from "./pages/insight";
import ProfilePage from "./pages/profile";
import NotFound from "./pages/not-found";
import BottomNav from "./components/BottomNav";

function AppContent() {
  const [authed, setAuthed] = useState(!!getMe());

  if (!authed) {
    return <AuthPage onAuth={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto relative">
      <main className="flex-1 pb-20">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/g-schema" component={GSchemaWizard} />
          <Route path="/inzicht" component={InsightPage} />
          <Route path="/profiel" component={ProfilePage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <>
      <AppContent />
      <Toaster />
    </>
  );
}
