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
          <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto relative">
            <main className="flex-1 pb-20">
              <HomePage />
            </main>
            <BottomNav />
          </div>
        ) : (
          <Redirect to="/login" />
        )}
      </Route>
      <Route path="/g-schema">
        {authed ? (
          <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto relative">
            <main className="flex-1 pb-20">
              <GSchemaWizard />
            </main>
            <BottomNav />
          </div>
        ) : (
          <Redirect to="/login" />
        )}
      </Route>
      <Route path="/inzicht">
        {authed ? (
          <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto relative">
            <main className="flex-1 pb-20">
              <InsightPage />
            </main>
            <BottomNav />
          </div>
        ) : (
          <Redirect to="/login" />
        )}
      </Route>
      <Route path="/profiel">
        {authed ? (
          <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto relative">
            <main className="flex-1 pb-20">
              <ProfilePage />
            </main>
            <BottomNav />
          </div>
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
