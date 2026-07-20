import React, { useState, useEffect } from "react";
import adminService from "../../../models/services/adminService";
import alertService from "../../../models/services/alertService";
import expertService from "../../../models/services/expertService";
import { Activity, ShieldAlert, HeartPulse, UserCheck, CheckCircle, MessageSquare, FileText, Send, Utensils, ThumbsUp, ThumbsDown, X, User } from "lucide-react";
import toast from "react-hot-toast";

export default function StaffDashboardPage() {
  const [activeTab, setActiveTab] = useState("risk_monitoring"); // "risk_monitoring" | "weaning_requests"
  const [riskUsers, setRiskUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Mom for Consultation & Medical Notes Modal (Diagram 3)
  const [selectedMom, setSelectedMom] = useState(null);
  const [medicalNotes, setMedicalNotes] = useState("");
  const [consultationMsg, setConsultationMsg] = useState("");
  const [sendingConsult, setSendingConsult] = useState(false);

  // Pending Weaning Food Requests (Diagram 1)
  const [weaningRequests, setWeaningRequests] = useState([
    {
      id: "REQ_01",
      momName: "Trần Thị Mai",
      babyAge: "7 tháng tuổi",
      foodName: "Cháo yến mạch bơ xay nhuyễn",
      ingredients: "Yến mạch, Quả bơ chín, Sữa công thức",
      reactionReported: "Bé hơi đỏ quanh miệng nhẹ sau khi ăn 10 phút",
      requestedAt: "2026-07-20 18:30",
      status: "Pending"
    },
    {
      id: "REQ_02",
      momName: "Lê Thanh Hương",
      babyAge: "9 tháng tuổi",
      foodName: "Hấp tôm với bí đỏ nghiền",
      ingredients: "Tôm tươi bóc vỏ, Bí đỏ, Dầu ô liu",
      reactionReported: "Bé tiêu hóa bình thường, không có biểu hiện dị ứng",
      requestedAt: "2026-07-20 19:15",
      status: "Pending"
    }
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [riskRes, recipesRes] = await Promise.allSettled([
        adminService.getUsersAtRisk(),
        expertService.getPendingRecipes()
      ]);

      if (riskRes.status === "fulfilled" && riskRes.value) {
        const res = riskRes.value;
        if (res.isSuccess && res.data) setRiskUsers(res.data);
        else if (Array.isArray(res.data)) setRiskUsers(res.data);
      }

      if (recipesRes.status === "fulfilled" && recipesRes.value) {
        const res = recipesRes.value;
        if (res.isSuccess && Array.isArray(res.data) && res.data.length > 0) {
          const apiRequests = res.data.map(r => ({
            id: r.id,
            momName: "Mẹ bầu / AI Đề xuất",
            babyAge: r.profileStage || "Ăn dặm",
            foodName: r.title,
            ingredients: typeof r.ingredientsJson === "string" ? r.ingredientsJson : JSON.stringify(r.ingredientsJson),
            reactionReported: r.description || "Công thức ăn dặm mới chờ duyệt",
            requestedAt: r.generatedAt ? new Date(r.generatedAt).toLocaleString("vi-VN") : "Gần đây",
            status: "Pending",
            isRealApi: true
          }));
          setWeaningRequests(apiRequests);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (alertId, userName) => {
    try {
      const res = await alertService.resolveAlert(alertId);
      if (res.isSuccess || res.success) {
        toast.success(`Đã đánh dấu hoàn tất hỗ trợ cho ${userName}`);
        await loadData();
      } else {
        toast.error('Không thể cập nhật trạng thái cảnh báo');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi xử lý cảnh báo');
    }
  };

  const handleOpenConsultModal = (mom) => {
    setSelectedMom(mom);
    setMedicalNotes(`Mẹ bầu ${mom.fullName || mom.email} cần theo dõi chỉ số EPDS và nhịp sinh hoạt.`);
    setConsultationMsg(`Chào mami ${mom.fullName || "Mẹ bầu"}, đội ngũ nhân viên chăm sóc MomOi đã ghi nhận chỉ số của bạn. Bạn hãy dành thời gian nghỉ ngơi nhiều hơn nhé! 💙`);
  };

  const handleSendConsultation = async (e) => {
    e.preventDefault();
    if (!consultationMsg.trim()) return;
    setSendingConsult(true);
    try {
      const targetUserId = selectedMom.userId || selectedMom.id;
      let fullContent = `🩺 [TƯ VẤN TỪ CARE STAFF]\n`;
      if (medicalNotes.trim()) {
        fullContent += `📋 Ghi chú y tế: ${medicalNotes.trim()}\n`;
      }
      fullContent += `💬 Lời khuyên: ${consultationMsg.trim()}`;

      await alertService.sendConsultationMessage(targetUserId, fullContent);
      toast.success(`Đã gửi tin nhắn tư vấn và lưu hồ sơ cho ${selectedMom.fullName || selectedMom.email}! 📩`);
      setSelectedMom(null);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi gửi lời khuyên tư vấn.");
    } finally {
      setSendingConsult(false);
    }
  };

  const handleApproveWeaningFood = async (reqId, foodName, isRealApi) => {
    try {
      if (isRealApi) {
        await expertService.reviewRecipe(reqId, true, "Đã được Staff duyệt vào Catalog");
      }
      setWeaningRequests(prev => prev.filter(r => r.id !== reqId));
      toast.success(`Đã duyệt món "${foodName}" và thêm vào Thực Phẩm Catalog ăn dặm! 🥣`);
    } catch (err) {
      console.error(err);
      toast.error("Không thể duyệt công thức.");
    }
  };

  const handleRejectWeaningFood = async (reqId, foodName, isRealApi) => {
    try {
      if (isRealApi) {
        await expertService.reviewRecipe(reqId, false, "Staff từ chối do rủi ro dị ứng/không phù hợp");
      }
      setWeaningRequests(prev => prev.filter(r => r.id !== reqId));
      toast.error(`Đã từ chối món "${foodName}".`);
    } catch (err) {
      console.error(err);
      toast.error("Không thể từ chối công thức.");
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
            Theo dõi diễn biến sức khỏe hàng ngày, tiếp nhận các cảnh báo nguy cơ cao từ hệ thống, duyệt thực phẩm ăn dặm và tư vấn trực tiếp cho người mẹ.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-3 border-b border-gray-200 dark:border-gray-700 pb-3">
        <button
          onClick={() => setActiveTab("risk_monitoring")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all ${
            activeTab === "risk_monitoring"
              ? "bg-emerald-600 text-white shadow-md"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Giám Sát & Tư Vấn Mẹ Bầu ({riskUsers.length})
        </button>
        <button
          onClick={() => setActiveTab("weaning_requests")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all ${
            activeTab === "weaning_requests"
              ? "bg-emerald-600 text-white shadow-md"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <Utensils className="w-4 h-4" /> Duyệt Món Ăn Dặm Mới ({weaningRequests.length})
        </button>
      </div>

      {/* TAB 1: Risk Monitoring & Consultation */}
      {activeTab === "risk_monitoring" && (
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-gray-850 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-600" /> Danh Sách Mẹ Bầu Cần Theo Dõi & Tư Vấn Kịp Thời
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
                <div key={r.id || r.userId} className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-emerald-100 dark:border-emerald-900/40 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      🚨 {r.severity || "HIGH SEVERITY"}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold">{r.updatedAt || "Gần đây"}</span>
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                        <User className="w-4 h-4 text-emerald-600" /> {r.fullName || r.email}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Email: {r.email}</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 space-y-1">
                    <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 block uppercase tracking-wider">Lý do cảnh báo nguy cơ:</span>
                    <p className="text-xs text-emerald-900 dark:text-emerald-200 font-bold leading-relaxed">{r.alertReason || "Cảnh báo chỉ số sức khỏe hàng ngày bất thường."}</p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleOpenConsultModal(r)}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4" /> Xem Hồ Sơ & Tư Vấn
                    </button>
                    <button
                      onClick={() => handleResolve(r.alertId || r.id, r.fullName || r.email)}
                      className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-2xl transition-all flex items-center gap-1.5"
                      title="Đánh dấu đã hoàn tất hỗ trợ"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-500" /> Đã Xử Lý
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Weaning Food Approval Requests */}
      {activeTab === "weaning_requests" && (
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-gray-850 dark:text-white flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-600" /> Phê Duyệt Yêu Cầu Tạo Thực Phẩm Ăn Dặm Mới Từ Mẹ Bầu
          </h2>

          {weaningRequests.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">Không có yêu cầu chờ duyệt</h3>
              <p className="text-xs text-gray-400 mt-1">Tất cả đề xuất món ăn dặm mới từ các mẹ đã được xử lý hoàn tất.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {weaningRequests.map((req) => (
                <div key={req.id} className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-0.5 rounded-full">
                        {req.babyAge}
                      </span>
                      <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">{req.foodName}</h4>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                      <span className="font-bold text-gray-400">Thành phần:</span> {req.ingredients}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-900/20 p-2 rounded-xl border border-amber-100 dark:border-amber-900/30">
                      ⚠️ Phản ứng ghi nhận từ bé: {req.reactionReported}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">Đề xuất bởi: Mẹ {req.momName} • {req.requestedAt}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                    <button
                      onClick={() => handleApproveWeaningFood(req.id, req.foodName, req.isRealApi)}
                      className="flex-1 md:flex-initial px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> Chấp Nhận (Thêm Catalog)
                    </button>
                    <button
                      onClick={() => handleRejectWeaningFood(req.id, req.foodName, req.isRealApi)}
                      className="flex-1 md:flex-initial px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" /> Từ Chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Mom Detailed Profile & Consultation (Diagram 3) */}
      {selectedMom && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                Hồ Sơ Sức Khỏe & Tư Vấn Y Tế
              </h3>
              <button
                onClick={() => setSelectedMom(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mom Basic Summary */}
            <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-1.5">
              <div className="flex justify-between items-center">
                <h4 className="font-black text-sm text-gray-900 dark:text-white">{selectedMom.fullName || selectedMom.email}</h4>
                <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2.5 py-0.5 rounded-full">
                  STAGE: POSTPARTUM
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Email: {selectedMom.email}</p>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-bold">⚠️ Lý do cảnh báo: {selectedMom.alertReason}</p>
            </div>

            <form onSubmit={handleSendConsultation} className="space-y-4">
              {/* Write Medical Notes (Diagram 3) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block">
                  1. Ghi chú y tế & Kế hoạch theo dõi (Medical Notes)
                </label>
                <textarea
                  rows="2"
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  placeholder="Ghi lại các đánh giá y tế chuyên khoa..."
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Compose Consultation Message (Diagram 3) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block">
                  2. Tin nhắn tư vấn trực tiếp cho Mẹ Bầu (Consultation Message)
                </label>
                <textarea
                  rows="3"
                  required
                  value={consultationMsg}
                  onChange={(e) => setConsultationMsg(e.target.value)}
                  placeholder="Soạn lời khuyên tâm lý hoặc chế độ sinh hoạt cho mami..."
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMom(null)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl transition-all"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={sendingConsult}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {sendingConsult ? "Đang gửi..." : "Gửi Lời Khuyên & Lưu Hồ Sơ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

