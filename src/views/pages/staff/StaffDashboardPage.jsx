import React, { useState, useEffect } from "react";
import adminService from "../../../models/services/adminService";
import alertService from "../../../models/services/alertService";
import { Activity, ShieldAlert, HeartPulse, UserCheck, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function StaffDashboardPage() {
  const [riskUsers, setRiskUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsersAtRisk();
      if (res.isSuccess && res.data) setRiskUsers(res.data);
      else if (Array.isArray(res.data)) setRiskUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (alertId, userName) => {
    try {
      const res = await alertService.resolveAlert(alertId);
      if (res.isSuccess) {
        toast.success(`Đã đánh dấu hoàn tất hỗ trợ cho ${userName}`);
        // Refresh the list to remove the resolved user
        await loadData();
      } else {
        toast.error('Không thể cập nhật trạng thái cảnh báo');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi xử lý cảnh báo');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Staff Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-700 rounded-3xl p-6 text-white shadow-xl flex justify-between items-center relative overflow-hidden">
        <div className="z-10">
          <div className="flex items-center gap-2 text-emerald-300 font-extrabold text-xs uppercase tracking-wider mb-1">
            <HeartPulse className="w-4 h-4" /> Care Staff Support Portal
          </div>
          <h1 className="text-2xl font-black">Cổng Giám Sát & Hỗ Trợ Mẹ Bầu 🩺</h1>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl font-medium leading-relaxed">
            Theo dõi diễn biến sức khỏe hàng ngày, tiếp nhận các cảnh báo nguy cơ cao từ hệ thống và hỗ trợ chăm sóc người mẹ kịp thời.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-gray-850 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-emerald-600" /> Danh Sách Mẹ Bầu Cần Theo Dõi Đặc Biệt
        </h2>

        {loading ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-bold text-gray-500">Đang tải danh sách cảnh báo...</p>
          </div>
        ) : riskUsers.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
            <UserCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">Hệ thống đang ở trạng thái an toàn</h3>
            <p className="text-xs text-gray-400 mt-1">Hiện không có chỉ số bất thường nào cần nhân viên hỗ trợ khẩn cấp.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskUsers.map((r) => (
              <div key={r.id || r.userId} className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full">
                    CẦN GIÁM SÁT
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold">{r.updatedAt || "Gần đây"}</span>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">{r.fullName || r.email}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Email: {r.email}</p>
                  </div>
                  <button
                    onClick={() => handleResolve(r.alertId || r.id, r.fullName || r.email)}
                    className="p-2 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                    title="Đánh dấu đã xử lý"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase mb-0.5">Ghi nhận nguy cơ:</span>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">{r.alertReason || "Cảnh báo chỉ số sức khỏe hàng ngày bất thường."}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
