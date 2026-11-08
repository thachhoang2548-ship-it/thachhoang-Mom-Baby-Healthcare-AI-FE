import React, { useState, useEffect } from 'react';
import pregnancyService from '../../../models/services/pregnancyService';
import { Sparkles, Sprout, Lightbulb } from 'lucide-react';

export default function WeeklyMilestone({ week }) {
  const [milestone, setMilestone] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMilestone() {
      setLoading(true);
      try {
        const res = await pregnancyService.getThisWeek();
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
      <div className="space-y-3 rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm">
        <div className="h-5 w-1/3 rounded-md bg-theme-page" />
        <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
          <div className="h-28 rounded-2xl bg-theme-page" />
          <div className="h-28 rounded-2xl bg-theme-page" />
        </div>
      </div>
    );
  }

  if (!milestone) {
    return (
      <div className="rounded-3xl border border-theme-line bg-theme-surface p-6 text-center text-sm font-medium text-theme-muted shadow-sm">
        Chưa tìm thấy dữ liệu phát triển cho tuần thai này. Mẹ hãy kiểm tra lại ngày kinh cuối trong Hồ sơ của mẹ nhé.
      </div>
    );
  }

  return (
    <section className="space-y-5 rounded-3xl border border-theme-line bg-theme-surface p-6 font-display shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-theme-line pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-theme-brand-soft text-theme-brand">
            <Sparkles className="h-5 w-5" />
          </span>
          <h2 className="text-lg font-bold text-theme-ink sm:text-xl">
            {week ? `Cột mốc phát triển tuần ${week}` : 'Cột mốc phát triển tuần này'}
          </h2>
        </div>
        {milestone.babySize && (
          <span className="rounded-full border border-theme-brand/25 bg-theme-brand-soft px-3.5 py-1 text-xs font-bold text-theme-ink">
            Kích thước bé: {milestone.babySize}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-theme-line bg-theme-page/60 p-4 sm:p-5">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-theme-ink">
            <Sprout className="h-4 w-4 shrink-0 text-status-ok" />
            <span>Sự phát triển của bé</span>
          </h3>
          <p className="text-sm leading-relaxed text-theme-ink/90">
            {milestone.development}
          </p>
        </div>

        <div className="rounded-2xl border border-theme-line bg-theme-sidebar/55 p-4 sm:p-5">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-theme-ink">
            <Lightbulb className="h-4 w-4 shrink-0 text-status-warn-text" />
            <span>Lời khuyên dành cho mẹ</span>
          </h3>
          <p className="text-sm leading-relaxed text-theme-ink/90">
            {milestone.momTips}
          </p>
        </div>
      </div>
    </section>
  );
}
