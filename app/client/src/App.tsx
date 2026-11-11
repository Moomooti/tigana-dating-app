import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Home from "@/pages/home";
import KeywordSelection from "@/pages/keyword-selection";
import ProfileDisplaySetup from "@/pages/profile-display-setup";
import ProfileSetup from "@/pages/profile-setup";
import ApprovalPending from "@/pages/approval-pending";
import MatchedProfilePage from "@/pages/matched-profile-page";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/keywords" component={KeywordSelection} />
      <Route path="/profile-display-setup" component={ProfileDisplaySetup} />
      <Route path="/profile-setup" component={ProfileSetup} />
      <Route path="/approval-pending" component={ApprovalPending} />
      <Route path="/matched-profile/:userId" component={MatchedProfilePage} />
      <Route path="/admin" component={AdminPage} />
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
