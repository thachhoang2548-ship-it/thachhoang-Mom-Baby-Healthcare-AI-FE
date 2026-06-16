import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLifestyleStore } from "../store/lifestyleStore";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ArrowLeft, Clock, Info } from "lucide-react";

const COLORS = ["#6366F1", "#F59E0B", "#10B981", "#3B82F6", "#EC4899", "#9CA3AF"];

const BalancePage = () => {
  const { todayEntry, fetchTodayData, isLoading } = useLifestyleStore();

  useEffect(() => {
    fetchTodayData();
  }, []);

  const entry = todayEntry || {
    studyHours: 4,
    sleepHours: 7,
    physicalActivityHours: 1,
    socialHours: 2,
    extracurricularHours: 1
  };

  const sleep = entry.sleepHours ?? entry.sleep?.hours ?? 7;
  const study = entry.studyHours ?? 4;
  const physical = entry.physicalActivityHours ?? 1;
  const social = entry.socialHours ?? 2;
  const extra = entry.extracurricularHours ?? 1;

  const totalTracked = sleep + study + physical + social + extra;
  const other = Math.max(0, 24 - totalTracked);

  const data = [
    { name: "Ngủ", value: sleep },
    { name: "Học tập", value: study },
    { name: "Vận động", value: physical },
    { name: "Hoạt động xã hội", value: social },
    { name: "Ngoại khóa", value: extra },
    { name: "Hoạt động khác", value: Number(other.toFixed(1)) }
  ].filter(d => d.value > 0);

  if (isLoading && !todayEntry) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <header className="flex items-center space-x-4">
        <Link
          to="/dashboard-lifestyle"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Phân bổ Thời gian 24h
          </h1>
          <p className="text-sm text-gray-500">
            Xem sự phân bổ sinh hoạt và học tập trong một ngày của bạn
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pie Chart Panel */}
        <div className="md:col-span-2 bg-white dark:bg-gray-850 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col items-center justify-center min-h-[350px]">
          <h3 className="text-base font-bold text-gray-900 dark:text-white self-start mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-500" />
            Cơ cấu 24 giờ sinh hoạt
          </h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} giờ`, "Thời lượng"]}
                  contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Details Panel */}
        <div className="bg-white dark:bg-gray-850 rounded-xl p-6 shadow-sm border border-gray-150 dark:border-gray-750 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Chi tiết chỉ số
            </h3>

            <div className="space-y-3">
              {data.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-gray-600 dark:text-gray-300 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{item.value}h</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            Tổng cộng: 24.0 giờ. Việc phân bổ thời gian hợp lý giúp tăng hiệu suất học tập và giảm stress.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalancePage;
