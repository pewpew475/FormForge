import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import FormBuilder from "@/pages/form-builder";
import FormFill from "@/pages/form-fill";
import FormResponses from "@/pages/form-responses";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/builder/:id?" component={FormBuilder} />
      <Route path="/form/:id" component={FormFill} />
      <Route path="/responses/:id" component={FormResponses} />
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
