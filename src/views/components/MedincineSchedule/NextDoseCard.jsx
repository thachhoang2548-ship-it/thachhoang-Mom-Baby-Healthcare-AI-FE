import React from "react";

const NextDoseCard = ({ nextDose, onMarkTaken, onSkip }) => {
  if (!nextDose) return null;

  return (
    <div className="fixed bottom-6 right-6 z-30">
      <div className="rounded-xl bg-info dark:bg-primary/20 p-4 w-72 shadow-lg border border-black/5 dark:border-primary/20">
        <p className="text-sm font-medium text-[#181611] dark:text-white/70">Liều tiếp theo sau:</p>
        <p className="text-2xl font-bold text-[#181611] dark:text-white tracking-tighter">{nextDose.time}</p>
        <p className="text-base font-semibold text-[#181611] dark:text-white mt-1">
          {nextDose.medName} ({nextDose.dosage})
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={onMarkTaken}
            className="flex-1 flex items-center justify-center rounded-lg h-9 text-sm font-bold bg-success/20 text-success hover:bg-success/30"
          >
            Đã uống
          </button>
          <button
            onClick={onSkip}
            className="flex-1 flex items-center justify-center rounded-lg h-9 text-sm font-bold bg-warning/20 text-warning hover:bg-warning/30"
          >
            Bỏ qua
          </button>
        </div>
      </div>
    </div>
  );
};

export default NextDoseCard;
