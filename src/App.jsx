import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// New Maternal Pages
import LandingPage from "./views/pages/LandingPage";
import DashboardOverviewPage from "./views/pages/DashboardOverviewPage";
import LoginPage from "./views/pages/auth/LoginPage";
import RegisterPage from "./views/pages/auth/RegisterPage";
import JourneySetupPage from "./views/pages/onboarding/JourneySetupPage";
import FertilityPage from "./views/pages/fertility/FertilityPage";
import PregnancyDashPage from "./views/pages/pregnancy/PregnancyDashPage";
import MealPlanPage from "./views/pages/pregnancy/MealPlanPage";
import ExercisePlanPage from "./views/pages/pregnancy/ExercisePlanPage";
import ProfilePage from "./views/pages/ProfilePage";
import UpgradePage from "./views/pages/UpgradePage";
import PaymentPage from "./views/pages/PaymentPage";
import SubscriptionHistoryPage from "./views/pages/SubscriptionHistoryPage";
import CareCalendarPage from "./views/pages/CareCalendarPage";
import EmergencyHelpPage from "./views/pages/EmergencyHelpPage";
import FeedbackPage from "./views/pages/FeedbackPage";
import RelaxMusicPage from "./views/pages/RelaxMusicPage";

// Role Portals (Admin, Expert, Staff)
import AdminDashboardPage from "./views/pages/admin/AdminDashboardPage";
import ExpertDashboardPage from "./views/pages/expert/ExpertDashboardPage";
import StaffDashboardPage from "./views/pages/staff/StaffDashboardPage";

// Postpartum (Module 3) & Baby Nutrition (Module 4)
import PostpartumDashPage from "./views/pages/postpartum/PostpartumDashPage";
import EpdsPage from "./views/pages/postpartum/EpdsPage";
import BabyDashPage from "./views/pages/baby/BabyDashPage";
import BabyMenuPage from "./views/pages/baby/BabyMenuPage";
import GrowthChartPage from "./views/pages/baby/GrowthChartPage";
import BabyProfileFormPage from "./views/pages/baby/BabyProfileFormPage";

// Other compatibility pages
import Consent from "./views/pages/Consent";
import RecipePage from "./views/pages/RecipePage";
import NotificationsPage from "./views/pages/NotificationsPage";
import MedicationScheduler from "./views/pages/MedicationScheduler";
import SymptomPage from "./views/pages/SymptomPage";
import SymptomHistoryPage from "./views/pages/SymptomHistoryPage";
import SymptomDetailPage from "./views/pages/SymptomDetailPage";
import DailyMonitoringPage from "./views/pages/DailyMonitoringPage";

import ProtectedRoute from "./views/components/ProtectedRoute";
import AppShell from "./views/components/layout/AppShell";
import TierGate from "./views/components/layout/TierGate";
import SplashScreen from "./views/components/SplashScreen";
import { useSignalR } from "./hooks/useSignalR";

function AppContent() {
  // Mount the global SignalR listener hook inside a router sub-component
  useSignalR();

  const modernTierOnly = (element) => (
    <TierGate requiredTier="MomHienDai" showPreview={false}>{element}</TierGate>
  );

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/consent" element={<Consent />} />

        {/* Redirect Onboarding to Profile Setup */}
        <Route path="/onboarding" element={<Navigate to="/profile" replace />} />

        {/* Core Layout Shell (Requires auth) */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          {/* Dashboard router fallback */}
          <Route path="/dashboard" element={<DashboardOverviewPage />} />
          
          {/* Fertility (Module 1) */}
          <Route path="/fertility" element={<FertilityPage />} />

          {/* Pregnancy (Module 2) */}
          <Route path="/pregnancy" element={<PregnancyDashPage />} />
          <Route path="/pregnancy/meals" element={<MealPlanPage />} />
          <Route path="/pregnancy/exercises" element={<ExercisePlanPage />} />

          {/* Postpartum (Module 3) */}
          <Route path="/postpartum" element={<PostpartumDashPage />} />
          <Route path="/postpartum/epds" element={<EpdsPage />} />

          {/* Baby Nutrition (Module 4) */}
          <Route path="/baby-nutrition" element={modernTierOnly(<BabyDashPage />)} />
          <Route path="/baby-nutrition/menu" element={modernTierOnly(<BabyMenuPage />)} />
          <Route path="/baby-nutrition/growth" element={modernTierOnly(<GrowthChartPage />)} />
          <Route path="/baby-nutrition/create-baby" element={modernTierOnly(<BabyProfileFormPage />)} />
          <Route path="/baby-nutrition/edit-baby" element={modernTierOnly(<BabyProfileFormPage />)} />
          <Route path="/baby" element={<Navigate to="/baby-nutrition" replace />} />
          <Route path="/baby/menu" element={<Navigate to="/baby-nutrition/menu" replace />} />
          <Route path="/baby/growth" element={<Navigate to="/baby-nutrition/growth" replace />} />

          {/* Subscription & Membership Upgrade */}
          <Route path="/upgrade" element={<UpgradePage />} />
          <Route path="/subscription" element={<Navigate to="/upgrade" replace />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/subscription-history" element={<SubscriptionHistoryPage />} />
          <Route path="/care-calendar" element={<CareCalendarPage />} />
          <Route path="/emergency" element={<EmergencyHelpPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/relax" element={<RelaxMusicPage />} />
          <Route path="/checkout" element={<Navigate to="/payment" replace />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Role Portals (Admin, Expert, Staff) */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/expert" element={<ExpertDashboardPage />} />
          <Route path="/staff" element={<StaffDashboardPage />} />

          {/* Other utility pages (kept for compatibility) */}
          <Route path="/diet-recipes" element={<RecipePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/scheduler" element={<MedicationScheduler />} />
          <Route path="/symptoms" element={<SymptomPage />} />
          <Route path="/symptoms/history" element={<SymptomHistoryPage />} />
          <Route path="/symptoms/:id" element={<SymptomDetailPage />} />
          <Route path="/symptom-entry" element={<SymptomPage />} />
          <Route path="/daily-monitoring" element={<DailyMonitoringPage />} />
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
