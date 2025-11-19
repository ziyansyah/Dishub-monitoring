import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TopNavigation } from "@/components/TopNavigation";
import ErrorBoundary from "@/components/ErrorBoundary";
import { authService } from "@/services/authService";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import History from "./pages/History";
import Statistics from "./pages/Statistics";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import ActivityLog from "./pages/ActivityLog";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 401/403 errors
        if (error && typeof error === 'object' && 'statusCode' in error) {
          const statusCode = (error as any).statusCode;
          if (statusCode === 401 || statusCode === 403) return false;
        }
        return failureCount < 2;
      },
      staleTime: 10000, // 10 seconds default
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen flex flex-col bg-background">
                    <TopNavigation />
                    <main className="flex-1 container mx-auto px-4 py-6">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/vehicles" element={<Search />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/statistics" element={<Statistics />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/activity-log" element={<ActivityLog />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
