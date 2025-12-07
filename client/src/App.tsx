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
import PaymentSuccessPage from "@/pages/payment-success";
import PaymentFailedPage from "@/pages/payment-failed";
import AdminDashboardPage from "@/pages/admin/index";
import AdminCampaignsPage from "@/pages/admin/campaigns";

function Router() {
  return (
    <ErrorBoundary>
      <Switch>
        {/* Routes without Layout */}
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
        
        {/* Routes with Layout - ORDER MATTERS! More specific routes first */}
        <Route path="/campaigns">
          <Layout>
            <ErrorBoundary fallback={
              <div className="p-4">
                <p className="text-center text-muted-foreground">Ошибка загрузки страницы кампаний</p>
              </div>
            }>
              <CampaignsPage />
            </ErrorBoundary>
          </Layout>
        </Route>
        
        <Route path="/zakat">
          <Layout>
            <ErrorBoundary fallback={
              <div className="p-4">
                <p className="text-center text-muted-foreground">Ошибка загрузки страницы закята</p>
              </div>
            }>
              <ZakatPage />
            </ErrorBoundary>
          </Layout>
        </Route>
        
        <Route path="/rating">
          <Layout>
            <ErrorBoundary fallback={
              <div className="p-4">
                <p className="text-center text-muted-foreground">Ошибка загрузки страницы рейтинга</p>
              </div>
            }>
              <RatingPage />
            </ErrorBoundary>
          </Layout>
        </Route>
        
        <Route path="/partners/:id">
          <Layout>
            <ErrorBoundary fallback={
              <div className="p-4">
                <p className="text-center text-muted-foreground">Ошибка загрузки страницы фонда</p>
              </div>
            }>
              <PartnersPage />
            </ErrorBoundary>
          </Layout>
        </Route>
        
        <Route path="/partners">
          <Layout>
            <ErrorBoundary fallback={
              <div className="p-4">
                <p className="text-center text-muted-foreground">Ошибка загрузки страницы фондов</p>
              </div>
            }>
              <PartnersPage />
            </ErrorBoundary>
          </Layout>
        </Route>
        
        <Route path="/profile">
          <Layout>
            <ErrorBoundary>
              <AuthGuard>
                <ProfilePage />
              </AuthGuard>
            </ErrorBoundary>
          </Layout>
        </Route>
        
        {/* Home route must be last in Switch to avoid catching all routes */}
        <Route path="/">
          <Layout>
            <ErrorBoundary>
              <HomePage />
            </ErrorBoundary>
          </Layout>
        </Route>
        
        {/* 404 - must be last */}
        <Route component={NotFound} />
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
