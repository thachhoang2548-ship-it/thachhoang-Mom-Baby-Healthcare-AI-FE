import React, { useState, useEffect } from 'react';
import { pregnancyApi } from '../../api/pregnancyApi';
import { Sparkles } from 'lucide-react';

export default function WeeklyMilestone({ week }) {
  const [milestone, setMilestone] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMilestone() {
      setLoading(true);
      try {
        const res = await pregnancyApi.getThisWeek();
        if (res.isSuccess && res.data) {
          setMilestone(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch weekly milestone:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMilestone();
  }, [week]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-pink-100/50 dark:border-gray-700 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2.5"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-2.5"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  if (!milestone) {
    return (
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-pink-100/50 dark:border-gray-700 text-center text-xs text-gray-500 italic">
        Không tìm thấy dữ liệu phát triển cho tuần này. Vui lòng thử lại sau.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-pink-100/50 dark:border-gray-700 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-pink-50 dark:border-gray-700 pb-3">
        <h3 className="text-sm font-extrabold text-gray-800 dark:text-white flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-momPink" />
          Mốc phát triển tuần {week}
        </h3>
        <span className="text-xs bg-momPink-light text-momPink-dark px-3 py-1 rounded-full font-bold border border-momPink/20">
          Kích thước: {milestone.babySize}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-pink-50/20 dark:bg-gray-850 p-4 rounded-xl border border-pink-100/20">
          <h4 className="text-xs font-bold text-momPurple-dark dark:text-momPurple uppercase tracking-wider mb-2 flex items-center gap-1">
            🌱 Phát triển của bé
          </h4>
          <p className="text-xs text-gray-650 dark:text-gray-300 leading-relaxed font-semibold">
            {milestone.development}
          </p>
        </div>

        <div className="bg-green-50/20 dark:bg-gray-850 p-4 rounded-xl border border-green-100/20">
          <h4 className="text-xs font-bold text-momGreen-dark dark:text-momGreen uppercase tracking-wider mb-2 flex items-center gap-1">
            💡 Lời khuyên cho mami
          </h4>
          <p className="text-xs text-gray-655 dark:text-gray-300 leading-relaxed font-semibold">
            {milestone.momTips}
          </p>
        </div>
      </div>
    </div>
  );
}
