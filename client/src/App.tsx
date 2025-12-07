import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/layout";
import { AuthGuard } from "@/components/auth-guard";
import { ErrorBoundary } from "@/components/error-boundary";
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
    <ErrorBoundary>
      <Switch>
        <Route path="/login">
          <ErrorBoundary>
            <LoginPage />
          </ErrorBoundary>
        </Route>
        <Route path="/register">
          <ErrorBoundary>
            <RegisterPage />
          </ErrorBoundary>
        </Route>
        <Route path="/">
          <Layout>
            <Switch>
              <Route path="/">
                <ErrorBoundary>
                  <HomePage />
                </ErrorBoundary>
              </Route>
              <Route path="/campaigns">
                <ErrorBoundary fallback={
                  <div className="p-4">
                    <p className="text-center text-muted-foreground">Ошибка загрузки страницы кампаний</p>
                  </div>
                }>
                  <CampaignsPage />
                </ErrorBoundary>
              </Route>
              <Route path="/zakat">
                <ErrorBoundary fallback={
                  <div className="p-4">
                    <p className="text-center text-muted-foreground">Ошибка загрузки страницы закята</p>
                  </div>
                }>
                  <ZakatPage />
                </ErrorBoundary>
              </Route>
              <Route path="/rating">
                <ErrorBoundary fallback={
                  <div className="p-4">
                    <p className="text-center text-muted-foreground">Ошибка загрузки страницы рейтинга</p>
                  </div>
                }>
                  <RatingPage />
                </ErrorBoundary>
              </Route>
              <Route path="/partners">
                <ErrorBoundary fallback={
                  <div className="p-4">
                    <p className="text-center text-muted-foreground">Ошибка загрузки страницы фондов</p>
                  </div>
                }>
                  <PartnersPage />
                </ErrorBoundary>
              </Route>
              <Route path="/partners/:id">
                <ErrorBoundary fallback={
                  <div className="p-4">
                    <p className="text-center text-muted-foreground">Ошибка загрузки страницы фонда</p>
                  </div>
                }>
                  <PartnersPage />
                </ErrorBoundary>
              </Route>
              <Route path="/profile">
                <ErrorBoundary>
                  <AuthGuard>
                    <ProfilePage />
                  </AuthGuard>
                </ErrorBoundary>
              </Route>
              <Route component={NotFound} />
            </Switch>
          </Layout>
        </Route>
      </Switch>
    </ErrorBoundary>
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
