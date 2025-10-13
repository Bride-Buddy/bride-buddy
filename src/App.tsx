import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import ChatbotDashboard from "./pages/Dashboard"; // main AI interface
import BrideDashboardPage from "./pages/BrideDashboardPage";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner /> {/* your notification/toaster */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChatbotDashboard />} /> {/* Main AI chatbot */}
          <Route path="/bride-dashboard" element={<BrideDashboardPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
