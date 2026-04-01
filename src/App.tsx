import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import LogsPage from "./pages/LogsPage.tsx";
import CorrelationsPage from "./pages/CorrelationsPage.tsx";
import RulesPage from "./pages/RulesPage.tsx";
import AlertsPage from "./pages/AlertsPage.tsx";
import SourcesPage from "./pages/SourcesPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/correlations" element={<CorrelationsPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/sources" element={<SourcesPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
