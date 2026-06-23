import { useState } from "react";
import api from "../../services/api";
import reportIcon from "../../assets/DashboardAssets/report-card.png";

const ReportsCard = () => {
  const [loading, setLoading] = useState(false);

  const downloadReport = async () => {
    try {
      setLoading(true);
      const response = await api.get("/report/pdf/download", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "HealthReport.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      alert("Không thể tải xuống báo cáo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full lg:col-span-1 xl:col-span-1 bg-surface-light dark:bg-surface-dark rounded-DEFAULT shadow-soft overflow-hidden">
      <div className="p-6 border-b border-border-light flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
          <img src={reportIcon} alt="Report Icon" className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-text-light dark:text-text-dark">Báo cáo</h2>
      </div>
      <div className="p-6">
        <button
          onClick={downloadReport}
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Đang tải xuống..." : "Tải báo cáo mới nhất"}
        </button>
      </div>
    </div>
  );
};

export default ReportsCard;
