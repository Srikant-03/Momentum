import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Timetable from "@/pages/timetable";
import Deadlines from "@/pages/deadlines";
import StudyMaterials from "@/pages/study-materials";
import Analytics from "@/pages/analytics";
import FocusMode from "@/pages/focus-mode";
import Collaboration from "@/pages/collaboration";
import Settings from "@/pages/settings";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import MainLayout from "@/layouts/MainLayout";
import { useEffect } from "react";

function Router() {
  // Router setup

  return (
    <Switch>
      {/* Auth routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* App routes - wrapped in MainLayout */}
      <Route path="/">
        <MainLayout>
          <Home />
        </MainLayout>
      </Route>
      <Route path="/timetable">
        <MainLayout>
          <Timetable />
        </MainLayout>
      </Route>
      <Route path="/deadlines">
        <MainLayout>
          <Deadlines />
        </MainLayout>
      </Route>
      <Route path="/materials">
        <MainLayout>
          <StudyMaterials />
        </MainLayout>
      </Route>
      <Route path="/analytics">
        <MainLayout>
          <Analytics />
        </MainLayout>
      </Route>
      <Route path="/focus">
        <MainLayout>
          <FocusMode />
        </MainLayout>
      </Route>
      <Route path="/collaboration">
        <MainLayout>
          <Collaboration />
        </MainLayout>
      </Route>
      <Route path="/settings">
        <MainLayout>
          <Settings />
        </MainLayout>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
