import React from "react";
import medicationService from "../../../models/services/medicationService";

const statusClasses = {
  taken: "bg-success",
  skipped: "bg-warning",
  pending: "bg-primary animate-pulse",
  future: "bg-gray-300 dark:bg-white/30",
};

const MedicationItem = ({ med, onUpdate, onDelete }) => {
  const handleStatus = async (status) => {
    try {
      await medicationService.updateAdherence(med._id, { date: new Date(), status });
      onUpdate(med._id, status);
    } catch (err) {
      console.error("Error updating adherence:", err);
    }
  };

  return (
    <div className="rounded-xl border border-transparent dark:border-transparent bg-white dark:bg-background-dark p-4 shadow-sm hover:border-[#e6e3db] dark:hover:border-primary/20 transition-all">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div
            className={`w-3 h-3 rounded-full flex-shrink-0 ${statusClasses[med.status || "future"]}`}
            data-alt={`${med.status || "future"} dot indicating medication status`}
          ></div>
          <div>
            <p className="font-bold text-[#181611] dark:text-white">{med.medName}</p>
            <p className="text-sm text-[#8a8060] dark:text-white/70">
              {med.dosage}, {med.times.map((t) => t.slice(0, 5)).join(", ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStatus("taken")}
            className={`flex items-center justify-center rounded-lg h-10 px-4 text-sm font-bold ${
              med.status === "taken" ? "bg-success/10 text-success opacity-50 cursor-not-allowed" : "bg-success/10 text-success hover:bg-success/20"
            }`}
          >
            <span className="material-symbols-outlined text-xl mr-1">check_circle</span>
            Đã uống
          </button>
          <button
            onClick={() => handleStatus("skipped")}
            className={`flex items-center justify-center rounded-lg h-10 px-4 text-sm font-bold ${
              med.status === "skipped" ? "bg-warning/10 text-warning opacity-50 cursor-not-allowed" : "bg-warning/10 text-warning hover:bg-warning/20"
            }`}
          >
            <span className="material-symbols-outlined text-xl mr-1">cancel</span>
            Bỏ qua
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => alert("Tính năng chỉnh sửa sắp được cập nhật")}
            className="flex items-center justify-center rounded-full h-9 w-9 text-[#8a8060] dark:text-white/70 hover:bg-[#f5f3f0] dark:hover:bg-primary/20"
          >
            <span className="material-symbols-outlined text-xl">edit</span>
          </button>
          <button
            onClick={() => onDelete(med._id)}
            className="flex items-center justify-center rounded-full h-9 w-9 text-danger hover:bg-danger/10"
          >
            <span className="material-symbols-outlined text-xl">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicationItem;
