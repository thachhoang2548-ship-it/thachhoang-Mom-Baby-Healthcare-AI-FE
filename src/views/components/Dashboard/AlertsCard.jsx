import bell from "../../assets/DashboardAssets/alarm.png";

const AlertsCard = ({ alerts }) => {
  const getSeverityColor = (severity) => {
    if (severity >= 70) return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200";
    if (severity >= 40) return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200";
    return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200";
  };

  return (
    <div className="w-full lg:col-span-1 xl:col-span-2 bg-surface-light dark:bg-surface-dark rounded-DEFAULT shadow-soft overflow-hidden">
      <div className="p-6 border-b border-border-light flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <img src={bell} alt="Alert Icon" className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-text-light dark:text-text-dark">Cảnh báo & Thông báo</h2>
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
          {alerts.length}
        </span>
      </div>

      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert._id}
            className={`${getSeverityColor(alert.severityScore)} p-3 rounded-lg flex items-start space-x-4`}
          >
            <span className="material-symbols-outlined mt-1">
              {alert.severityScore >= 70 ? "error" : "notification_important"}
            </span>
            <div>
              <p className="font-semibold">{alert.textDescription}</p>
              <p className="text-sm">{new Date(alert.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsCard;
