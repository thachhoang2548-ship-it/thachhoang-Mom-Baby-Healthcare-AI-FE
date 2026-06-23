import React from "react";
import PillIcon from "../../assets/DashboardAssets/pill_8064036.png";

const MedicationCard = ({ meds }) => {
  const safeMeds = Array.isArray(meds) ? meds : [];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "taken":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200";
      case "skipped":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200";
      case "pending":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "taken":
        return "check_circle";
      case "skipped":
        return "cancel";
      case "pending":
        return "schedule";
      default:
        return "medication";
    }
  };

  const getStatusTextVN = (status) => {
    switch (status?.toLowerCase()) {
      case "taken": return "Đã uống";
      case "skipped": return "Bỏ qua";
      case "pending": return "Đang chờ";
      default: return "Sắp tới";
    }
  };

  const formatTimes = (times) => {
    if (!times || times.length === 0) return "Chưa đặt giờ";
    return times
      .map((time) => {
        const [hour, minute] = time.split(":");
        return `${hour}:${minute}`;
      })
      .join(", ");
  };

  return (
    <div className="w-full lg:col-span-1 xl:col-span-2 bg-surface-light dark:bg-surface-dark rounded-DEFAULT shadow-soft overflow-hidden">
      <div className="p-6 border-b border-border-light flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
            <img src={PillIcon} alt="Pill Icon" className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-text-light dark:text-text-dark">
            Lịch uống thuốc
          </h2>
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
          {safeMeds.length}
        </span>
      </div>

      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        {safeMeds.length === 0 ? (
          <p className="text-subtle-light dark:text-subtle-dark text-center py-4">
            Chưa có lịch uống thuốc
          </p>
        ) : (
          safeMeds.map((med) => (
            <div
              key={med._id}
              className={`${getStatusColor(med.status)} p-4 rounded-lg flex items-start space-x-4 transition-all hover:shadow-md`}
            >
              <span className="material-symbols-outlined mt-1">
                {getStatusIcon(med.status)}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-base">{med.medName}</p>
                <p className="text-sm mt-1">
                  <span className="font-medium">Liều lượng:</span> {med.dosage}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">Thời gian:</span> {formatTimes(med.times)}
                </p>
                {med.notes && (
                  <p className="text-xs mt-2 opacity-80">
                    <span className="font-medium">Ghi chú:</span> {med.notes}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  {getStatusTextVN(med.status)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MedicationCard;
