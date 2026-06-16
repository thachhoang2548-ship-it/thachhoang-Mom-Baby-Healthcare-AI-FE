import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

export default function CycleCalendar({
  profile,
  calendarData,
  onDateClick,
  onUpdatePeriod,
  selectedMonth,
  onMonthChange,
}) {
  const [days, setDays] = useState([]);
  const [year, month] = selectedMonth.split('-').map(Number);

  useEffect(() => {
    generateMonthDays();
  }, [selectedMonth, calendarData, profile]);

  const generateMonthDays = () => {
    const firstDay = new Date(year, month - 1, 1);
    let startDayOfWeek = firstDay.getDay();
    // Adjust to Monday start: 0 = Mon, 6 = Sun
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const totalDays = new Date(year, month, 0).getDate();
    const daysArray = [];

    // Previous month filler days
    const prevMonthTotalDays = new Date(year, month - 1, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 2, prevMonthTotalDays - i);
      daysArray.push({ date, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month - 1, d);
      daysArray.push({ date, isCurrentMonth: true });
    }

    // Next month filler days
    const gridLength = daysArray.length > 35 ? 42 : 35;
    const nextMonthDaysNeeded = gridLength - daysArray.length;
    for (let d = 1; d <= nextMonthDaysNeeded; d++) {
      const date = new Date(year, month, d);
      daysArray.push({ date, isCurrentMonth: false });
    }

    const mapped = daysArray.map((cell) => {
      const classification = classifyDate(cell.date);
      return {
        ...cell,
        ...classification,
      };
    });

    setDays(mapped);
  };

  const classifyDate = (date) => {
    const dStr = date.toDateString();
    const todayStr = new Date().toDateString();

    const isToday = dStr === todayStr;
    let isPeriod = false;
    let isFertile = false;
    let isOvulation = false;

    // 1. Ovulation check
    if (calendarData?.ovulationDay) {
      const ovDate = new Date(calendarData.ovulationDay);
      if (date.toDateString() === ovDate.toDateString()) {
        isOvulation = true;
      }
    }

    // 2. Fertile window check
    if (calendarData?.fertileWindowDays) {
      isFertile = calendarData.fertileWindowDays.some(
        (d) => new Date(d).toDateString() === dStr
      );
    }

    // 3. Menstrual cycle projection logic based on lastPeriodDate
    if (profile?.lastPeriodDate) {
      const cycleLength = profile.avgCycleLength || 28;
      const lastPeriod = new Date(profile.lastPeriodDate);

      const diffTime = date.getTime() - lastPeriod.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Calculate the cycle day index relative to cycleLength
      let cycleDayIndex = diffDays % cycleLength;
      if (cycleDayIndex < 0) {
        cycleDayIndex += cycleLength;
      }

      // First 5 days are considered menstrual period (🩸)
      if (cycleDayIndex >= 0 && cycleDayIndex < 5) {
        isPeriod = true;
      }
    }

    return { isToday, isPeriod, isFertile, isOvulation };
  };

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

  const getMonthNameVi = () => {
    const names = [
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
    return `${names[month - 1]} năm ${year}`;
  };

  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-pink-100/50 dark:border-gray-700/50">
      {/* Header Month Switcher */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider">
          {getMonthNameVi()}
        </h3>
        <div className="flex items-center gap-1 bg-pink-50/50 dark:bg-gray-700/50 p-1 rounded-xl">
          <button
            onClick={() => changeMonth(-1)}
            className="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded-lg text-gray-500 dark:text-gray-300 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded-lg text-gray-500 dark:text-gray-300 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Labels */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {weekDays.map((day) => (
          <span
            key={day}
            className="text-[10px] font-bold text-gray-400 uppercase tracking-wider py-1"
          >
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((cell, idx) => {
          let cellClass = 'bg-transparent text-gray-700 dark:text-gray-300';

          if (!cell.isCurrentMonth) {
            cellClass = 'text-gray-300 dark:text-gray-600 opacity-40';
          } else if (cell.isPeriod) {
            cellClass = 'bg-momPink-light/80 text-momPink-dark font-extrabold shadow-sm';
          } else if (cell.isOvulation) {
            cellClass =
              'bg-gradient-to-tr from-momAmber to-yellow-400 text-white font-extrabold shadow-md';
          } else if (cell.isFertile) {
            cellClass = 'bg-momGreen-light/80 text-momGreen-dark font-extrabold shadow-sm';
          }

          let borderClass = 'border border-transparent';
          if (cell.isToday) {
            borderClass = 'border-2 border-momPurple shadow-sm ring-1 ring-momPurple/30';
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onDateClick?.(cell)}
              className={`aspect-square rounded-xl text-xs font-semibold flex flex-col items-center justify-center relative transition-all duration-300 ${cellClass} ${borderClass} hover:scale-105 active:scale-95`}
            >
              <span>{cell.date.getDate()}</span>
              {cell.isPeriod && (
                <span className="absolute bottom-1 w-1 h-1 bg-momPink rounded-full animate-pulse"></span>
              )}
              {cell.isOvulation && (
                <span className="absolute bottom-1 w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
              )}
              {cell.isFertile && !cell.isOvulation && (
                <span className="absolute bottom-1 w-1 h-1 bg-momGreen rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-pink-50 dark:border-gray-700/50 grid grid-cols-3 gap-2 text-[10px] font-bold text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 bg-momPink-light rounded-lg border border-pink-200 shrink-0"></span>
          <span>Kỳ kinh (🩸)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 bg-momGreen-light rounded-lg border border-momGreen-200 shrink-0"></span>
          <span>Thụ thai (💚)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 bg-gradient-to-tr from-momAmber to-yellow-400 rounded-lg shrink-0"></span>
          <span>Rụng trứng (🥚)</span>
        </div>
      </div>

      {/* Action Update */}
      <button
        type="button"
        onClick={onUpdatePeriod}
        className="mt-5 w-full py-2.5 border border-dashed border-momPink/70 text-momPink hover:bg-momPink-light/30 hover:border-momPink text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Ghi nhận kỳ kinh mới
      </button>
    </div>
  );
}
