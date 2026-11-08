import React, { useState, useEffect, useCallback } from "react";
import adminService from "../../../models/services/adminService";
import alertService from "../../../models/services/alertService";
import expertService from "../../../models/services/expertService";
import AdminFeedbackPanel from "../admin/AdminFeedbackPanel";
import {
  ShieldAlert,
  HeartPulse,
  UserCheck,
  CheckCircle,
  MessageSquare,
  FileText,
  Send,
  Utensils,
  ThumbsUp,
  ThumbsDown,
  X,
  User,
  MessageSquareHeart,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function StaffDashboardPage() {
  const [activeTab, setActiveTab] = useState("risk_monitoring");
  const [riskUsers, setRiskUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMom, setSelectedMom] = useState(null);
  const [medicalNotes, setMedicalNotes] = useState("");
  const [consultationMsg, setConsultationMsg] = useState("");
  const [sendingConsult, setSendingConsult] = useState(false);

  const [weaningRequests, setWeaningRequests] = useState([
    {
      id: "REQ_01",
      momName: "Trần Thị Mai",
      babyAge: "7 tháng tuổi",
      foodName: "Cháo yến mạch bơ xay nhuyễn",
      ingredients: "Yến mạch, Quả bơ chín, Sữa công thức",
      reactionReported: "Bé hơi đỏ quanh miệng nhẹ sau khi ăn 10 phút",
      requestedAt: "2026-07-20 18:30",
      status: "Pending",
    },
    {
      id: "REQ_02",
      momName: "Lê Thanh Hương",
      babyAge: "9 tháng tuổi",
      foodName: "Hấp tôm với bí đỏ nghiền",
      ingredients: "Tôm tươi bóc vỏ, Bí đỏ, Dầu ô liu",
      reactionReported: "Bé tiêu hóa bình thường, không có biểu hiện dị ứng",
      requestedAt: "2026-07-20 19:15",
      status: "Pending",
    },
  ]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [riskRes, recipesRes] = await Promise.allSettled([
        adminService.getUsersAtRisk(),
        expertService.getPendingRecipes(),
      ]);

      if (riskRes.status === "fulfilled" && riskRes.value) {
        const res = riskRes.value;
        if (res.isSuccess && res.data) setRiskUsers(res.data);
        else if (Array.isArray(res.data)) setRiskUsers(res.data);
      }

      if (recipesRes.status === "fulfilled" && recipesRes.value) {
        const res = recipesRes.value;
        if (res.isSuccess && Array.isArray(res.data) && res.data.length > 0) {
          const apiRequests = res.data.map((r) => ({
            id: r.id,
            momName: "Mẹ bầu / AI Đề xuất",
            babyAge: r.profileStage || "Ăn dặm",
            foodName: r.title,
            ingredients:
              typeof r.ingredientsJson === "string"
                ? r.ingredientsJson
                : JSON.stringify(r.ingredientsJson),
            reactionReported: r.description || "Công thức ăn dặm mới chờ duyệt",
            requestedAt: r.generatedAt
              ? new Date(r.generatedAt).toLocaleString("vi-VN")
              : "Gần đây",
            status: "Pending",
            isRealApi: true,
          }));
          setWeaningRequests(apiRequests);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResolve = async (alertId, userName) => {
    try {
      const res = await alertService.resolveAlert(alertId);
      if (res.isSuccess || res.success) {
        toast.success(`Đã đánh dấu hoàn tất hỗ trợ cho ${userName}`);
        await loadData();
      } else {
        toast.error("Không thể cập nhật trạng thái cảnh báo");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi xử lý cảnh báo");
    }
  };

  const handleOpenConsultModal = (mom) => {
    setSelectedMom(mom);
    setMedicalNotes(
      `Mẹ ${mom.fullName || mom.email} cần theo dõi chỉ số EPDS và nhịp sinh hoạt.`
    );
    setConsultationMsg(
      `Chào mẹ ${mom.fullName || "bạn"}, đội ngũ nhân viên chăm sóc Mom Ơi! đã ghi nhận chỉ số của mẹ. Mẹ hãy dành thêm thời gian nghỉ ngơi và báo lại nếu vẫn thấy mệt nhé.`
    );
  };

  const handleSendConsultation = async (e) => {
    e.preventDefault();
    if (!consultationMsg.trim()) return;
    setSendingConsult(true);
    try {
      const targetUserId = selectedMom.userId || selectedMom.id;
      let fullContent = `[TƯ VẤN TỪ CARE STAFF]\n`;
      if (medicalNotes.trim()) {
        fullContent += `Ghi chú y tế: ${medicalNotes.trim()}\n`;
      }
      fullContent += `Lời khuyên: ${consultationMsg.trim()}`;

      await alertService.sendConsultationMessage(targetUserId, fullContent);
      toast.success(
        `Đã gửi tin nhắn tư vấn và lưu hồ sơ cho ${selectedMom.fullName || selectedMom.email}!`
      );
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
      setWeaningRequests((prev) => prev.filter((r) => r.id !== reqId));
      toast.success(`Đã duyệt món "${foodName}" và thêm vào danh mục ăn dặm.`);
    } catch (err) {
      console.error(err);
      toast.error("Không thể duyệt công thức.");
    }
  };

  const handleRejectWeaningFood = async (reqId, foodName, isRealApi) => {
    try {
      if (isRealApi) {
        await expertService.reviewRecipe(
          reqId,
          false,
          "Staff từ chối do rủi ro dị ứng/không phù hợp"
        );
      }
      setWeaningRequests((prev) => prev.filter((r) => r.id !== reqId));
      toast.error(`Đã từ chối món "${foodName}".`);
    } catch (err) {
      console.error(err);
      toast.error("Không thể từ chối công thức.");
    }
  };

  return (
    <div className="font-display space-y-6 max-w-6xl mx-auto pb-12 text-theme-ink">
      {/* Header */}
      <header className="bg-theme-surface rounded-3xl border border-theme-line p-6 sm:p-8 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-theme-brand-soft text-theme-ink px-3.5 py-1.5 text-xs font-bold border border-theme-brand/20">
          <HeartPulse className="w-4 h-4 text-theme-brand" aria-hidden="true" />
          <span>Không gian Điều phối Chăm sóc (Care Staff)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-ink tracking-tight">
          Cổng giám sát & đồng hành cùng mẹ
        </h1>
        <p className="text-sm text-theme-muted max-w-2xl font-medium leading-relaxed">
          Theo dõi các cảnh báo chỉ số sức khỏe, tiếp nhận đề xuất thực đơn ăn dặm và gửi phản hồi chăm sóc kịp thời cho mẹ bầu và mẹ sau sinh.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2.5" role="tablist" aria-label="Chức năng nhân viên chăm sóc">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "risk_monitoring"}
          onClick={() => setActiveTab("risk_monitoring")}
          className={`min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
            activeTab === "risk_monitoring"
              ? "bg-theme-brand text-theme-surface shadow-sm"
              : "bg-theme-surface text-theme-ink border border-theme-line hover:bg-theme-brand-soft"
          }`}
        >
          <ShieldAlert className="w-4 h-4" aria-hidden="true" />
          <span>Giám sát & tư vấn ({riskUsers.length})</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "weaning_requests"}
          onClick={() => setActiveTab("weaning_requests")}
          className={`min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
            activeTab === "weaning_requests"
              ? "bg-theme-brand text-theme-surface shadow-sm"
              : "bg-theme-surface text-theme-ink border border-theme-line hover:bg-theme-brand-soft"
          }`}
        >
          <Utensils className="w-4 h-4" aria-hidden="true" />
          <span>Duyệt món ăn dặm ({weaningRequests.length})</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "feedback"}
          onClick={() => setActiveTab("feedback")}
          className={`min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
            activeTab === "feedback"
              ? "bg-theme-brand text-theme-surface shadow-sm"
              : "bg-theme-surface text-theme-ink border border-theme-line hover:bg-theme-brand-soft"
          }`}
        >
          <MessageSquareHeart className="w-4 h-4" aria-hidden="true" />
          <span>Phản hồi người dùng</span>
        </button>
      </div>

      {/* TAB 1 */}
      {activeTab === "risk_monitoring" && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-theme-ink flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-theme-brand" aria-hidden="true" />
            <span>Danh sách mẹ cần theo dõi & hỗ trợ kịp thời</span>
          </h2>

          {loading ? (
            <div className="text-center py-16 bg-theme-surface rounded-3xl border border-theme-line">
              <p className="text-sm font-semibold text-theme-muted">Đang tải danh sách cảnh báo...</p>
            </div>
          ) : riskUsers.length === 0 ? (
            <div className="text-center py-16 bg-theme-surface rounded-3xl border border-theme-line space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-status-ok border border-emerald-200 flex items-center justify-center mx-auto">
                <UserCheck className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-theme-ink">Hệ thống đang ở trạng thái ổn định</h3>
              <p className="text-xs sm:text-sm text-theme-muted">
                Hiện không có cảnh báo bất thường nào cần nhân viên hỗ trợ khẩn cấp.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {riskUsers.map((r) => (
                <article
                  key={r.id || r.userId}
                  className="bg-theme-surface rounded-3xl p-5 sm:p-6 border border-theme-line shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs bg-red-50 border border-red-200 text-red-800 font-bold px-3 py-1 rounded-full">
                      <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{r.severity || "Ưu tiên cao"}</span>
                    </span>
                    <span className="text-xs text-theme-muted font-medium">
                      {r.updatedAt || "Gần đây"}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-theme-ink flex items-center gap-2">
                      <User className="w-4 h-4 text-theme-brand" aria-hidden="true" />
                      <span>{r.fullName || r.email}</span>
                    </h3>
                    <p className="text-xs text-theme-muted font-medium mt-0.5">Email: {r.email}</p>
                  </div>

                  <div className="p-3.5 bg-status-warn-bg rounded-2xl border border-status-warn-line/40 space-y-1">
                    <span className="text-xs font-bold text-status-warn-text block">
                      Lý do cảnh báo nguy cơ:
                    </span>
                    <p className="text-xs sm:text-sm text-status-warn-text font-semibold leading-relaxed">
                      {r.alertReason || "Cảnh báo chỉ số sức khỏe hàng ngày bất thường."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenConsultModal(r)}
                      className="flex-1 min-h-[44px] py-2.5 px-4 bg-theme-brand hover:bg-theme-ink text-theme-surface font-bold text-xs sm:text-sm rounded-2xl transition-colors inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                    >
                      <MessageSquare className="w-4 h-4" aria-hidden="true" />
                      <span>Xem hồ sơ & tư vấn</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolve(r.alertId || r.id, r.fullName || r.email)}
                      className="min-h-[44px] px-4 py-2.5 bg-theme-page hover:bg-emerald-50 border border-theme-line text-theme-ink font-bold text-xs sm:text-sm rounded-2xl transition-colors inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                    >
                      <CheckCircle className="w-4 h-4 text-status-ok" aria-hidden="true" />
                      <span>Đã xử lý</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 2 */}
      {activeTab === "weaning_requests" && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-theme-ink flex items-center gap-2">
            <Utensils className="w-5 h-5 text-theme-brand" aria-hidden="true" />
            <span>Phê duyệt đề xuất món ăn dặm mới</span>
          </h2>

          {weaningRequests.length === 0 ? (
            <div className="text-center py-16 bg-theme-surface rounded-3xl border border-theme-line space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-status-ok border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-theme-ink">Không có yêu cầu chờ duyệt</h3>
              <p className="text-xs sm:text-sm text-theme-muted">
                Tất cả đề xuất món ăn dặm mới đã được xử lý hoàn tất.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {weaningRequests.map((req) => (
                <article
                  key={req.id}
                  className="bg-theme-surface rounded-3xl p-5 sm:p-6 border border-theme-line shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold bg-theme-brand-soft text-theme-ink border border-theme-brand/20 px-3 py-0.5 rounded-full">
                        {req.babyAge}
                      </span>
                      <h3 className="font-bold text-base text-theme-ink">{req.foodName}</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-theme-muted font-medium">
                      <span className="font-bold text-theme-ink">Thành phần:</span> {req.ingredients}
                    </p>
                    <p className="text-xs text-status-warn-text font-semibold bg-status-warn-bg p-3 rounded-2xl border border-status-warn-line/40">
                      Ghi nhận phản ứng: {req.reactionReported}
                    </p>
                    <p className="text-xs text-theme-muted font-medium">
                      Đề xuất bởi: {req.momName} • {req.requestedAt}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
                    <button
                      type="button"
                      onClick={() => handleApproveWeaningFood(req.id, req.foodName, req.isRealApi)}
                      className="flex-1 md:flex-initial min-h-[44px] px-4 py-2.5 bg-status-ok hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-2xl transition-colors inline-flex items-center justify-center gap-1.5"
                    >
                      <ThumbsUp className="w-4 h-4" aria-hidden="true" />
                      <span>Chấp nhận</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectWeaningFood(req.id, req.foodName, req.isRealApi)}
                      className="flex-1 md:flex-initial min-h-[44px] px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 font-bold text-xs sm:text-sm rounded-2xl transition-colors inline-flex items-center justify-center gap-1.5"
                    >
                      <ThumbsDown className="w-4 h-4" aria-hidden="true" />
                      <span>Từ chối</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "feedback" && <AdminFeedbackPanel />}

      {/* Modal tư vấn */}
      {selectedMom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="staff-consult-title"
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <div className="bg-theme-surface rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-theme-line">
            <div className="flex justify-between items-center border-b border-theme-line pb-3">
              <h3 id="staff-consult-title" className="font-bold text-base text-theme-ink flex items-center gap-2">
                <FileText className="w-5 h-5 text-theme-brand" aria-hidden="true" />
                <span>Hồ sơ sức khỏe & tư vấn chăm sóc</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedMom(null)}
                aria-label="Đóng hộp thoại"
                className="w-10 h-10 inline-flex items-center justify-center text-theme-muted hover:bg-theme-page rounded-full"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="bg-theme-page p-4 rounded-2xl border border-theme-line space-y-1.5">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <h4 className="font-extrabold text-sm text-theme-ink">
                  {selectedMom.fullName || selectedMom.email}
                </h4>
                <span className="text-xs bg-theme-brand-soft text-theme-ink border border-theme-brand/20 font-bold px-2.5 py-0.5 rounded-full">
                  Theo dõi sau sinh
                </span>
              </div>
              <p className="text-xs text-theme-muted font-medium">Email: {selectedMom.email}</p>
              <p className="text-xs text-status-warn-text font-bold">
                Lý do cảnh báo: {selectedMom.alertReason}
              </p>
            </div>

            <form onSubmit={handleSendConsultation} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="staff-medical-notes" className="text-xs font-bold text-theme-ink block">
                  1. Ghi chú y tế & kế hoạch theo dõi
                </label>
                <textarea
                  id="staff-medical-notes"
                  rows={2}
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  placeholder="Ghi lại các đánh giá chăm sóc..."
                  className="w-full p-3 rounded-2xl border border-theme-line bg-theme-page/60 text-sm font-medium text-theme-ink placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-brand"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="staff-consult-msg" className="text-xs font-bold text-theme-ink block">
                  2. Tin nhắn tư vấn trực tiếp cho mẹ
                </label>
                <textarea
                  id="staff-consult-msg"
                  rows={3}
                  required
                  value={consultationMsg}
                  onChange={(e) => setConsultationMsg(e.target.value)}
                  placeholder="Soạn lời khuyên tâm lý hoặc chế độ sinh hoạt cho mẹ..."
                  className="w-full p-3 rounded-2xl border border-theme-line bg-theme-page/60 text-sm font-medium text-theme-ink placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-brand"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedMom(null)}
                  className="flex-1 min-h-[44px] py-2.5 bg-theme-page border border-theme-line hover:bg-theme-brand-soft text-theme-ink font-bold text-xs sm:text-sm rounded-2xl transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={sendingConsult}
                  className="flex-1 min-h-[44px] py-2.5 bg-theme-brand hover:bg-theme-ink text-theme-surface font-bold text-xs sm:text-sm rounded-2xl transition-colors inline-flex items-center justify-center gap-2 disabled:bg-theme-line disabled:text-theme-muted"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>{sendingConsult ? "Đang gửi..." : "Gửi lời khuyên & lưu hồ sơ"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
