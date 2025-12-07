import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/layout";
import { AuthGuard } from "@/components/auth-guard";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import CampaignsPage from "@/pages/campaigns";
import ZakatPage from "@/pages/zakat";
import RatingPage from "@/pages/rating";
import PartnersPage from "@/pages/partners";
import ProfilePage from "@/pages/profile";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/">
        <Layout>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/campaigns" component={CampaignsPage} />
            <Route path="/zakat" component={ZakatPage} />
            <Route path="/rating" component={RatingPage} />
            <Route path="/partners" component={PartnersPage} />
            <Route path="/partners/:id" component={PartnersPage} />
            <Route path="/profile">
              <AuthGuard>
                <ProfilePage />
              </AuthGuard>
            </Route>
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
