import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "@/pages/Auth";
import AuthRedirect from "@/pages/AuthRedirect";
import OnboardingChat from "@/pages/OnboardingChat";
import Chat from "@/pages/Chat";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth-redirect" element={<AuthRedirect />} />
        <Route path="/onboarding" element={<OnboardingChat />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
