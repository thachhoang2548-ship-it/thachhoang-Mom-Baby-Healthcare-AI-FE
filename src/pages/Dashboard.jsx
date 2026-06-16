import { useEffect, useState, useContext } from "react";
import { getDashboardData } from "../services/dashboardService";
import AuthContext from "../contexts/AuthContext";
import api from "../services/api";
import SymptomCard from "../components/Dashboard/SymptomCard";
import AlertCard from "../components/Dashboard/AlertsCard";
import LifestyleAlertsCard from "../components/Dashboard/LifestyleAlertsCard";
import MedScheduleCard from "../components/Dashboard/MedicationCard";
import DietCard from "../components/Dashboard/DietCard";
import ReportsCard from "../components/Dashboard/ReportsCard";
import SymptomTrendsChart from "../components/Dashboard/SymptomTrendsChart";
import sthethoscope from "../assets/DashboardAssets/stethoscope_6467872.png";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lifestyleAlerts, setLifestyleAlerts] = useState([]);
  const [chartMode, setChartMode] = useState("daily");
  const [data, setData] = useState({
    symptomEntries: [],
    dailyMonitoringEntries: [],
    alerts: [],
    medSchedule: [],
    dietPlan: { meals: [] },
    summary: {},
  });

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const dashboardData = await getDashboardData();
      setData(dashboardData);

      try {
        const res = await api.get("/daily-monitoring/lifestyle-alerts");
        setLifestyleAlerts(res.data.alerts || []);
      } catch (err) {
        console.error("Failed to load lifestyle alerts", err);
      }

      setError("");
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]); // Re-fetch if user changes/loads

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchData(true);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user]);

  const handleManualRefresh = () => fetchData(true);

  const handleResolveLifestyleAlert = async (id) => {
    try {
      await api.put(`/daily-monitoring/lifestyle-alerts/${id}/status`, { status: "resolved" });
      setLifestyleAlerts((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error("Failed to resolve lifestyle alert", err);
    }
  };

  const getStageLabel = () => {
    if (user?.pregnancyStage === "pregnant") return `Đang mang thai (Tuần ${user.pregnancyWeek})`;
    if (user?.pregnancyStage === "post-natal") return "Sau sinh (Nuôi con nhỏ)";
    return "Chuẩn bị mang thai";
  };

  if (loading) return <div className="p-6">Đang tải bảng điều khiển...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 font-display">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-950/20 dark:to-orange-950/20 p-6 rounded-2xl border border-pink-100 dark:border-pink-900/30">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Chào mẹ {user?.name || "yêu"}!</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-primary text-white rounded-full uppercase tracking-wider">
              {user?.subscriptionTier === "vip" ? "VIP" : user?.subscriptionTier === "modern" ? "Modern" : "Free"}
            </span>
          </div>
          <p className="text-subtle-light mt-1 text-sm text-gray-600 dark:text-gray-300">
            Hành trình: <strong className="text-primary">{getStageLabel()}</strong> • Chiều cao: {user?.height}cm • Cân nặng: {user?.weight}kg
          </p>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-md"
          title="Làm mới dữ liệu"
        >
          <span className="material-symbols-outlined text-base">
            {refreshing ? "progress_activity" : "refresh"}
          </span>
          {refreshing ? "Đang làm mới..." : "Làm mới"}
        </button>
      </header>

      <main className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:grid-cols-4">
        <LifestyleAlertsCard
          alerts={lifestyleAlerts}
          onResolve={handleResolveLifestyleAlert}
        />

        <div className="w-full lg:col-span-2 xl:col-span-2 bg-surface-light dark:bg-surface-dark rounded-DEFAULT shadow-soft overflow-hidden">
          <div className="p-6 border-b border-border-light flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <img src={sthethoscope} alt="Stethoscope" className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-text-light dark:text-text-dark">Xu hướng triệu chứng</h2>
            </div>
            <div className="flex bg-gray-150 dark:bg-gray-800 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setChartMode("daily")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  chartMode === "daily"
                    ? "bg-white dark:bg-gray-700 shadow-sm text-primary font-bold"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Nhật ký hàng ngày
              </button>
              <button
                onClick={() => setChartMode("ai")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  chartMode === "ai"
                    ? "bg-white dark:bg-gray-700 shadow-sm text-primary font-bold"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Phân tích AI
              </button>
            </div>
          </div>
          <div className="p-6 h-64">
            <SymptomTrendsChart 
              entries={chartMode === "daily" ? data.dailyMonitoringEntries : data.symptomEntries} 
              mode={chartMode}
            />
          </div>
        </div>

        <AlertCard alerts={data.alerts} />
        <MedScheduleCard meds={data.medSchedule} />
        <DietCard diet={data.dietPlan} />
        <ReportsCard />
      </main>
    </div>
  );
};

export default Dashboard;
