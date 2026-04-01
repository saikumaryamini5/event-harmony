import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import LogsPage from "./pages/LogsPage.tsx";
import CorrelationsPage from "./pages/CorrelationsPage.tsx";
import RulesPage from "./pages/RulesPage.tsx";
import AlertsPage from "./pages/AlertsPage.tsx";
import SourcesPage from "./pages/SourcesPage.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/logs" element={<ProtectedRoute><LogsPage /></ProtectedRoute>} />
            <Route path="/correlations" element={<ProtectedRoute><CorrelationsPage /></ProtectedRoute>} />
            <Route path="/rules" element={<ProtectedRoute><RulesPage /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
            <Route path="/sources" element={<ProtectedRoute><SourcesPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
