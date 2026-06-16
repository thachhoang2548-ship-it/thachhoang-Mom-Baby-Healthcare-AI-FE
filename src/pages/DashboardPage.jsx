import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLifestyleStore } from "../store/lifestyleStore";
import AlertBanner from "../components/alerts/AlertBanner";
import AlertCard from "../components/alerts/AlertCard";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  PlusCircle, 
  Calendar,
  PieChart as PieIcon
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from "recharts";

const DashboardPage = () => {
  const { alerts, summary, todayEntry, fetchTodayData, isLoading } = useLifestyleStore();

  useEffect(() => {
    fetchTodayData();
  }, []);

  const healthScore = summary?.healthScore ?? 70;
  const trend = summary?.trend ?? 0;
  const radarDataRaw = summary?.radarData ?? { study: 0, sleep: 0, physical: 0, social: 0, gpa: 0 };
  const scoreTrends = summary?.scoreTrends ?? [];

  // Sort alerts: HIGH -> MEDIUM -> POSITIVE
  const severityOrder = { HIGH: 1, MEDIUM: 2, POSITIVE: 3 };
  const sortedAlerts = [...alerts].sort((a, b) => {
    return (severityOrder[a.severity] || 99) - (severityOrder[b.severity] || 99);
  });

  const highAlerts = alerts.filter((a) => a.severity === "HIGH");

  // Recharts Radar data structure
  const radarData = [
    { subject: "Giấc ngủ", A: radarDataRaw.sleep, fullMark: 100 },
    { subject: "Học tập", A: radarDataRaw.study, fullMark: 100 },
    { subject: "Vận động", A: radarDataRaw.physical, fullMark: 100 },
    { subject: "Xã hội", A: radarDataRaw.social, fullMark: 100 },
    { subject: "GPA", A: radarDataRaw.gpa, fullMark: 100 }
  ];

  if (isLoading && !todayEntry) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Alert Banner for High Severity Alerts */}
      <AlertBanner highAlertCount={highAlerts.length} />

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            Sức khỏe & Lối sống Sinh viên
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Đánh giá sức khỏe toàn diện và đề xuất lối sống học đường.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/balance"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-bold transition-all"
          >
            <PieIcon className="h-4 w-4" />
            Phân bổ 24h
          </Link>
          <Link
            to="/lifestyle/input"
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            {todayEntry ? "Cập nhật nhật ký" : "Ghi nhận hôm nay"}
          </Link>
        </div>
      </header>

      {/* 2. Top Stats: HealthScore & RadarChart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Health Score Panel */}
        <div className="bg-white dark:bg-gray-850 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Điểm Sức Khỏe Lối Sống</h3>
            <p className="text-xs text-gray-400 mt-1">Chỉ số sức khỏe học đường tổng hợp hàng ngày</p>
          </div>

          <div className="my-6 flex items-baseline gap-4">
            <span className="text-6xl font-black text-primary dark:text-primary-light">
              {healthScore}
            </span>
            <div className="flex items-center gap-1 text-sm font-bold">
              {trend > 0 ? (
                <span className="text-emerald-500 flex items-center gap-0.5 bg-emerald-500/10 px-2 py-1 rounded-full">
                  <TrendingUp className="h-4 w-4" /> +{trend}
                </span>
              ) : trend < 0 ? (
                <span className="text-rose-500 flex items-center gap-0.5 bg-rose-500/10 px-2 py-1 rounded-full">
                  <TrendingDown className="h-4 w-4" /> {trend}
                </span>
              ) : (
                <span className="text-gray-500 bg-gray-500/10 px-2 py-1 rounded-full">
                  Không đổi
                </span>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700/50 pt-3">
            {healthScore >= 70 
              ? "Lối sống của bạn đang rất tốt, tiếp tục phát huy!" 
              : "Có một số yếu tố lối sống cần cải thiện ngay hôm nay."}
          </div>
        </div>

        {/* Radar Chart Panel */}
        <div className="md:col-span-2 bg-white dark:bg-gray-850 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col items-center justify-center min-h-[300px]">
          <h3 className="text-base font-bold text-gray-900 dark:text-white self-start mb-2">
            Biểu đồ cân bằng 5 khía cạnh
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" radius="70%" data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9ca3af' }} />
                <Radar
                  name="Chỉ số"
                  dataKey="A"
                  stroke={healthScore < 60 ? "#EF4444" : "#6366F1"}
                  fill={healthScore < 60 ? "#EF4444" : "#6366F1"}
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Alerts Section */}
      <div className="bg-white dark:bg-gray-850 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cảnh báo & Đánh giá Lối sống</h3>
            <p className="text-xs text-gray-400">Được phân tích tự động dựa trên 12 quy tắc thói quen sinh viên</p>
          </div>
          <Link to="/alerts" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedAlerts.length === 0 ? (
            <div className="md:col-span-2 text-center py-10 text-gray-400 dark:text-gray-500">
              Chưa có cảnh báo hoặc đánh giá nào cho ngày hôm nay. Hãy ghi nhận nhật ký của bạn!
            </div>
          ) : (
            sortedAlerts.map((alert) => (
              <AlertCard key={alert._id || alert.ruleId} alert={alert} />
            ))
          )}
        </div>
      </div>

      {/* 4. Line Chart: 30-day Trend */}
      <div className="bg-white dark:bg-gray-850 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Xu hướng Điểm Sức Khỏe Lối Sống (30 ngày gần đây)
        </h3>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scoreTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px' }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <ReferenceLine y={70} stroke="#10B981" strokeDasharray="5 5" label={{ value: 'Mục tiêu (70)', fill: '#10B981', position: 'top', fontSize: 12, fontWeight: 'bold' }} />
              <Line 
                type="monotone" 
                dataKey="healthScore" 
                name="Điểm sức khỏe"
                stroke="#6366F1" 
                strokeWidth={3} 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
