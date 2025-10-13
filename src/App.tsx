import ChatbotDashboard from "./pages/Dashboard"; // main AI interface
import BrideDashboardPage from "./pages/BrideDashboardPage";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

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
