import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const MONTH_NAMES_VI = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];

const WEEK_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function classifyDate(date, calendarData, profile) {
  const dStr = date.toDateString();
  const todayStr = new Date().toDateString();

  const isToday = dStr === todayStr;
  let isPeriod = false;
  let isFertile = false;
  let isOvulation = false;

  if (calendarData?.ovulationDay) {
    const ovDate = new Date(calendarData.ovulationDay);
    if (dStr === ovDate.toDateString()) {
      isOvulation = true;
    }
  }

  if (calendarData?.fertileWindowDays) {
    isFertile = calendarData.fertileWindowDays.some(
      (d) => new Date(d).toDateString() === dStr
    );
  }

  if (profile?.lastPeriodDate) {
    const cycleLength = profile.avgCycleLength || 28;
    const lastPeriod = new Date(profile.lastPeriodDate);

    const diffTime = date.getTime() - lastPeriod.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let cycleDayIndex = diffDays % cycleLength;
    if (cycleDayIndex < 0) {
      cycleDayIndex += cycleLength;
    }

    if (cycleDayIndex >= 0 && cycleDayIndex < 5) {
      isPeriod = true;
    }
  }

  return { isToday, isPeriod, isFertile, isOvulation };
}

export default function CycleCalendar({
  profile,
  calendarData,
  onDateClick,
  onUpdatePeriod,
  selectedMonth,
  onMonthChange,
}) {
  const [year, month] = selectedMonth.split('-').map(Number);

  const days = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const totalDays = new Date(year, month, 0).getDate();
    const daysArray = [];

    const prevMonthTotalDays = new Date(year, month - 1, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 2, prevMonthTotalDays - i);
      daysArray.push({ date, isCurrentMonth: false });
    }

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month - 1, d);
      daysArray.push({ date, isCurrentMonth: true });
    }

    const gridLength = daysArray.length > 35 ? 42 : 35;
    const nextMonthDaysNeeded = gridLength - daysArray.length;
    for (let d = 1; d <= nextMonthDaysNeeded; d++) {
      const date = new Date(year, month, d);
      daysArray.push({ date, isCurrentMonth: false });
    }

    return daysArray.map((cell) => ({
      ...cell,
      ...classifyDate(cell.date, calendarData, profile),
    }));
  }, [year, month, calendarData, profile]);

  const changeMonth = (direction) => {
    let nextMonth = month + direction;
    let nextYear = year;

    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    } else if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    }

    const nextMonthStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
    onMonthChange(nextMonthStr);
  };

  return (
    <div className="rounded-3xl border border-theme-line bg-theme-surface p-5 font-display shadow-sm sm:p-6">
      {/* Header Month Switcher */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-theme-ink sm:text-xl">
          {MONTH_NAMES_VI[month - 1]} năm {year}
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Tháng trước"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-theme-line bg-theme-page text-theme-ink transition-colors hover:border-theme-brand/40 hover:bg-theme-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Tháng sau"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-theme-line bg-theme-page text-theme-ink transition-colors hover:border-theme-brand/40 hover:bg-theme-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Week Labels */}
      <div className="mb-2 grid grid-cols-7 gap-1.5 text-center">
        {WEEK_DAYS.map((day) => (
          <span key={day} className="py-1 text-xs font-bold text-theme-muted">
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((cell, idx) => {
          let cellClass = 'border border-transparent bg-theme-page/40 text-theme-ink hover:border-theme-line hover:bg-theme-page';

          if (!cell.isCurrentMonth) {
            cellClass = 'border border-transparent bg-transparent text-theme-muted/50';
          } else if (cell.isOvulation) {
            cellClass = 'border-2 border-status-warn-line bg-status-warn-bg text-status-warn-text font-bold';
          } else if (cell.isPeriod) {
            cellClass = 'border border-theme-brand/35 bg-theme-brand-soft text-theme-ink font-bold';
          } else if (cell.isFertile) {
            cellClass = 'border border-status-ok/35 bg-status-ok/15 text-theme-ink font-bold';
          }

          const todayRing = cell.isToday ? 'ring-2 ring-theme-ink ring-offset-1' : '';

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onDateClick?.(cell)}
              className={`relative flex min-h-[46px] flex-col items-center justify-center rounded-2xl text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand sm:min-h-[50px] sm:text-sm ${cellClass} ${todayRing}`}
            >
              <span>{cell.date.getDate()}</span>
              {cell.isCurrentMonth && cell.isOvulation && (
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-status-warn-text" aria-hidden="true" />
              )}
              {cell.isCurrentMonth && cell.isPeriod && !cell.isOvulation && (
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-theme-brand" aria-hidden="true" />
              )}
              {cell.isCurrentMonth && cell.isFertile && !cell.isOvulation && !cell.isPeriod && (
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-status-ok" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 grid grid-cols-1 gap-2.5 border-t border-theme-line pt-4 text-xs font-semibold text-theme-ink sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 shrink-0 rounded-md border border-theme-brand/35 bg-theme-brand-soft" />
          <span>Kỳ hành kinh</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 shrink-0 rounded-md border border-status-ok/35 bg-status-ok/15" />
          <span>Cửa sổ thụ thai</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 shrink-0 rounded-md border-2 border-status-warn-line bg-status-warn-bg" />
          <span>Ngày rụng trứng</span>
        </div>
      </div>

      {/* Action Update */}
      <button
        type="button"
        onClick={onUpdatePeriod}
        className="mt-5 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-theme-line bg-theme-page px-4 py-2.5 text-sm font-bold text-theme-ink transition-colors hover:border-theme-brand/40 hover:bg-theme-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
      >
        <RefreshCw className="h-4 w-4 text-theme-brand" />
        <span>Cập nhật ngày đầu kỳ kinh</span>
      </button>
    </div>
  );
}
