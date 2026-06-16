import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// New Maternal Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import JourneySetupPage from "./pages/onboarding/JourneySetupPage";
import FertilityPage from "./pages/fertility/FertilityPage";
import IvfTimelinePage from "./pages/fertility/IvfTimelinePage";
import PregnancyDashPage from "./pages/pregnancy/PregnancyDashPage";
import MealPlanPage from "./pages/pregnancy/MealPlanPage";
import ExercisePlanPage from "./pages/pregnancy/ExercisePlanPage";
import UpgradePage from "./pages/UpgradePage";

// Postpartum (Module 3) & Baby Nutrition (Module 4)
import PostpartumDashPage from "./pages/postpartum/PostpartumDashPage";
import EpdsPage from "./pages/postpartum/EpdsPage";
import VoiceJournalPage from "./pages/postpartum/VoiceJournalPage";
import BabyDashPage from "./pages/baby/BabyDashPage";
import BabyMenuPage from "./pages/baby/BabyMenuPage";
import GrowthChartPage from "./pages/baby/GrowthChartPage";

// Other compatibility pages
import Consent from "./pages/Consent";
import RecipePage from "./pages/RecipePage";
import NotificationsPage from "./pages/NotificationsPage";
import MedicationScheduler from "./pages/MedicationScheduler";
import SymptomPage from "./pages/SymptomPage";
import SymptomHistoryPage from "./pages/SymptomHistoryPage";
import SymptomDetailPage from "./pages/SymptomDetailPage";
import DailyMonitoringPage from "./pages/DailyMonitoringPage";
import ChatPage from "./pages/ChatPage";

import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/layout/AppShell";
import SplashScreen from "./components/SplashScreen";
import { useSignalR } from "./hooks/useSignalR";

function AppContent() {
  // Mount the global SignalR listener hook inside a router sub-component
  useSignalR();

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/consent" element={<Consent />} />

        {/* Private Onboarding Setup */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <JourneySetupPage />
            </ProtectedRoute>
          }
        />

        {/* Core Layout Shell (Requires auth) */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          {/* Dashboard router fallback */}
          <Route path="/dashboard" element={<Navigate to="/pregnancy" replace />} />
          
          {/* Fertility (Module 1) */}
          <Route path="/fertility" element={<FertilityPage />} />
          <Route path="/fertility/ivf" element={<IvfTimelinePage />} />

          {/* Pregnancy (Module 2) */}
          <Route path="/pregnancy" element={<PregnancyDashPage />} />
          <Route path="/pregnancy/meals" element={<MealPlanPage />} />
          <Route path="/pregnancy/exercises" element={<ExercisePlanPage />} />

          {/* Postpartum (Module 3) */}
          <Route path="/postpartum" element={<PostpartumDashPage />} />
          <Route path="/postpartum/epds" element={<EpdsPage />} />
          <Route path="/postpartum/voice" element={<VoiceJournalPage />} />

          {/* Baby Nutrition (Module 4) */}
          <Route path="/baby-nutrition" element={<BabyDashPage />} />
          <Route path="/baby-nutrition/menu" element={<BabyMenuPage />} />
          <Route path="/baby-nutrition/growth" element={<GrowthChartPage />} />

          {/* Simulated Premium Upgrade */}
          <Route path="/upgrade" element={<UpgradePage />} />

          {/* Other utility pages (kept for compatibility) */}
          <Route path="/diet-recipes" element={<RecipePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/scheduler" element={<MedicationScheduler />} />
          <Route path="/symptoms" element={<SymptomPage />} />
          <Route path="/symptoms/history" element={<SymptomHistoryPage />} />
          <Route path="/symptoms/:id" element={<SymptomDetailPage />} />
          <Route path="/symptom-entry" element={<SymptomPage />} />
          <Route path="/daily-monitoring" element={<DailyMonitoringPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  if (loading) return <SplashScreen onFinish={() => setLoading(false)} />;

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
