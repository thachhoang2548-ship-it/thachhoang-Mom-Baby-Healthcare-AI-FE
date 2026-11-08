import React, { useState, useEffect, useCallback } from "react";
import expertService from "../../../models/services/expertService";
import {
  CheckCircle,
  XCircle,
  Clock,
  Utensils,
  UserCheck,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  BadgeCheck,
  Baby,
  Heart,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

function RecipeTable({ title, icon, recipes, onApprove, onReject }) {
  const approved = recipes.filter((r) => r.status === "Approved" || r._reviewedStatus === "approved");
  const pending = recipes.filter((r) => r.status !== "Approved" && r._reviewedStatus !== "approved");
  const sorted = [...approved, ...pending];

  return (
    <section className="bg-theme-surface rounded-3xl border border-theme-line shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-theme-page/70 border-b border-theme-line flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div>
            <h2 className="text-base font-bold text-theme-ink">{title}</h2>
            <p className="text-xs text-theme-muted font-medium">{recipes.length} công thức trong danh mục</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs bg-status-ok-bg text-status-ok-text border border-status-ok-line px-3 py-1 rounded-full font-bold">
            <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{approved.length} đã duyệt</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs bg-status-warn-bg text-status-warn-text border border-status-warn-line/50 px-3 py-1 rounded-full font-bold">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{pending.length} chờ duyệt</span>
          </span>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12 px-6 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center mx-auto">
            <Utensils className="w-6 h-6" aria-hidden="true" />
          </div>
          <p className="text-sm font-bold text-theme-ink">Chưa có thực đơn nào trong danh mục này</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-theme-line bg-theme-page/40 text-theme-muted font-bold">
                <th className="px-5 py-3.5 w-12">STT</th>
                <th className="px-5 py-3.5">Tên thực đơn</th>
                <th className="px-5 py-3.5">Mô tả dinh dưỡng</th>
                <th className="px-5 py-3.5 text-center">Năng lượng</th>
                <th className="px-5 py-3.5 text-center">Trạng thái</th>
                <th className="px-5 py-3.5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-line">
              {sorted.map((item, idx) => {
                const isApproved = item.status === "Approved";
                const isPending = item.status === "PendingReview" && !item._reviewedStatus;
                const localApproved = item._reviewedStatus === "approved";
                const localRejected = item._reviewedStatus === "rejected";

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-theme-page/50 ${
                      isApproved || localApproved ? "bg-status-ok-bg/20" : ""
                    }`}
                  >
                    <td className="px-5 py-4 text-xs font-bold text-theme-muted">{idx + 1}</td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {(isApproved || localApproved) && (
                          <BadgeCheck className="w-4 h-4 text-status-ok shrink-0" aria-hidden="true" />
                        )}
                        <span className="text-sm font-bold text-theme-ink leading-snug">
                          {item.title || item.name || "Thực đơn gợi ý"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-xs text-theme-muted font-medium line-clamp-2 max-w-xs leading-relaxed">
                        {item.description || "Công thức dinh dưỡng chờ chuyên gia thẩm định."}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <span className="text-xs font-bold text-theme-ink">
                        {item.calories || 0} kcal
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      {isApproved || localApproved ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-status-ok-bg text-status-ok-text font-bold px-2.5 py-1 rounded-full border border-status-ok-line">
                          <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Đã duyệt</span>
                        </span>
                      ) : localRejected ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-status-danger-bg text-status-danger-text font-bold px-2.5 py-1 rounded-full border border-status-danger-line">
                          <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Đã từ chối</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-status-warn-bg text-status-warn-text font-bold px-2.5 py-1 rounded-full border border-status-warn-line/50">
                          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Chờ duyệt</span>
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      {isPending && !localApproved && !localRejected ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            type="button"
                            onClick={() => onApprove(item.id)}
                            className="min-h-[44px] px-3.5 py-2 bg-status-ok hover:bg-status-ok-text text-theme-surface rounded-2xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                          >
                            <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Duyệt</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject(item)}
                            className="min-h-[44px] px-3.5 py-2 bg-status-danger-bg text-status-danger-text hover:bg-status-danger-bg rounded-2xl text-xs font-bold transition-colors border border-status-danger-line inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-danger-text"
                          >
                            <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Từ chối</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-theme-muted font-semibold">Đã xử lý</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function ExpertDashboardPage() {
  const [activeTab, setActiveTab] = useState("recipes");
  const [momRecipes, setMomRecipes] = useState([]);
  const [babyRecipes, setBabyRecipes] = useState([]);
  const [pendingRecipes, setPendingRecipes] = useState([]);
  const [assignedMoms, setAssignedMoms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rejectingRecipe, setRejectingRecipe] = useState(null);
  const [rejectNote, setRejectNote] = useState("");
  const [selectedMom, setSelectedMom] = useState(null);
  const [consultMessage, setConsultMessage] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "recipes") {
        try {
          const res = await expertService.getAllRecipes();
          if ((res.isSuccess || res.success) && res.data) {
            const payload = res.data.momRecipes ? res.data : res.data.data || {};
            setMomRecipes(payload.momRecipes || []);
            setBabyRecipes(payload.babyRecipes || []);
            return;
          }
        } catch {
          const res = await expertService.getPendingRecipes();
          if ((res.isSuccess || res.success) && res.data) {
            setPendingRecipes(Array.isArray(res.data) ? res.data : []);
          }
        }
      } else {
        const res = await expertService.getAssignedMoms();
        if ((res.isSuccess || res.success) && res.data) {
          setAssignedMoms(Array.isArray(res.data) ? res.data : []);
        }
      }
    } catch (err) {
      console.error("Failed to load expert data", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateRecipeStatus = (recipeId, status) => {
    const updater = (prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, _reviewedStatus: status } : r));
    setMomRecipes(updater);
    setBabyRecipes(updater);
    setPendingRecipes(updater);
  };

  const handleApprove = async (recipeId) => {
    try {
      const res = await expertService.reviewRecipe(
        recipeId,
        true,
        "Đã kiểm duyệt bởi chuyên gia dinh dưỡng."
      );
      if (res.isSuccess || res.success) {
        toast.success("Đã phê duyệt công thức món ăn thành công.");
        updateRecipeStatus(recipeId, "approved");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingRecipe) return;
    try {
      const res = await expertService.reviewRecipe(
        rejectingRecipe.id,
        false,
        rejectNote || "Công thức chưa đạt yêu cầu dinh dưỡng."
      );
      if (res.isSuccess || res.success) {
        toast.success("Đã từ chối công thức thành công.");
        updateRecipeStatus(rejectingRecipe.id, "rejected");
        setRejectingRecipe(null);
        setRejectNote("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConsultSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMom || !consultMessage.trim()) return;
    try {
      const res = await expertService.consultMom(
        selectedMom.id || selectedMom.userId,
        consultMessage
      );
      if (res.isSuccess || res.success) {
        toast.success(`Đã gửi lời tư vấn cho mẹ ${selectedMom.fullName || selectedMom.email}!`);
        setSelectedMom(null);
        setConsultMessage("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const effectiveMomRecipes = momRecipes.length > 0 ? momRecipes : pendingRecipes;
  const totalPending = [...effectiveMomRecipes, ...babyRecipes].filter(
    (r) => (r.status === "PendingReview" || !r.status) && !r._reviewedStatus
  ).length;

  return (
    <div className="font-display space-y-6 max-w-6xl mx-auto pb-12 text-theme-ink">
      {/* Header */}
      <header className="bg-theme-surface rounded-3xl border border-theme-line p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-theme-brand-soft text-theme-ink px-3.5 py-1.5 text-xs font-bold border border-theme-brand/20">
            <ShieldCheck className="w-4 h-4 text-theme-brand" aria-hidden="true" />
            <span>Không gian làm việc Chuyên gia Y tế</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-ink tracking-tight">
            Cổng kiểm duyệt dinh dưỡng & tư vấn y khoa
          </h1>
          <p className="text-sm text-theme-muted font-medium leading-relaxed">
            Thẩm định các thực đơn cho mẹ bầu và bé ăn dặm trước khi gắn nhãn đã kiểm duyệt, đồng thời gửi hướng dẫn chuyên môn trực tiếp cho mẹ.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0" role="tablist" aria-label="Chế độ chuyên gia">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "recipes"}
            onClick={() => setActiveTab("recipes")}
            className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
              activeTab === "recipes"
                ? "bg-theme-brand text-theme-surface shadow-sm"
                : "bg-theme-page text-theme-ink border border-theme-line hover:bg-theme-brand-soft"
            }`}
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>Thực đơn ({totalPending} chờ duyệt)</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "moms"}
            onClick={() => setActiveTab("moms")}
            className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
              activeTab === "moms"
                ? "bg-theme-brand text-theme-surface shadow-sm"
                : "bg-theme-page text-theme-ink border border-theme-line hover:bg-theme-brand-soft"
            }`}
          >
            <UserCheck className="w-4 h-4" aria-hidden="true" />
            <span>Tư vấn mẹ bầu</span>
          </button>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-16 bg-theme-surface rounded-3xl border border-theme-line">
          <p className="text-sm font-semibold text-theme-muted">Đang tải dữ liệu thẩm định...</p>
        </div>
      ) : activeTab === "recipes" ? (
        <div className="space-y-6">
          <RecipeTable
            title="Thực đơn dành cho mẹ bầu & sau sinh"
            icon={<Heart className="w-5 h-5" aria-hidden="true" />}
            recipes={effectiveMomRecipes}
            onApprove={handleApprove}
            onReject={setRejectingRecipe}
          />

          <RecipeTable
            title="Thực đơn ăn dặm cho bé"
            icon={<Baby className="w-5 h-5" aria-hidden="true" />}
            recipes={babyRecipes}
            onApprove={handleApprove}
            onReject={setRejectingRecipe}
          />
        </div>
      ) : (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-theme-ink flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-theme-brand" aria-hidden="true" />
            <span>Danh sách mẹ bầu được phân công tư vấn</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {assignedMoms.length === 0 ? (
              <div className="md:col-span-3 text-center py-16 bg-theme-surface rounded-3xl border border-theme-line">
                <p className="text-sm text-theme-muted font-semibold">
                  Hiện chưa có hồ sơ mẹ bầu nào được phân công tư vấn trực tiếp.
                </p>
              </div>
            ) : (
              assignedMoms.map((mom) => (
                <article
                  key={mom.id || mom.userId}
                  className="bg-theme-surface rounded-3xl p-5 border border-theme-line shadow-sm flex flex-col justify-between gap-4"
                >
                  <div>
                    <h3 className="font-bold text-base text-theme-ink">
                      {mom.fullName || mom.email}
                    </h3>
                    <p className="text-xs text-theme-muted mt-0.5">{mom.email}</p>
                    <div className="mt-3 inline-flex bg-theme-brand-soft text-theme-ink text-xs font-bold px-3 py-1 rounded-full border border-theme-brand/20">
                      Giai đoạn: {mom.stage || "Thai kỳ"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMom(mom)}
                    className="w-full min-h-[44px] py-2.5 bg-theme-brand text-theme-surface rounded-2xl text-xs sm:text-sm font-bold hover:bg-theme-ink transition-colors inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                  >
                    <MessageSquare className="w-4 h-4" aria-hidden="true" />
                    <span>Gửi tư vấn y khoa</span>
                  </button>
                </article>
              ))
            )}
          </div>
        </section>
      )}

      {/* Modal từ chối thực đơn */}
      {rejectingRecipe && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-recipe-title"
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <div className="bg-theme-surface rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-theme-line">
            <div className="flex items-center justify-between gap-3">
              <h3 id="reject-recipe-title" className="font-bold text-base text-status-danger-text flex items-center gap-2">
                <XCircle className="w-5 h-5" aria-hidden="true" />
                <span>Từ chối công thức món ăn</span>
              </h3>
              <button
                type="button"
                onClick={() => setRejectingRecipe(null)}
                aria-label="Đóng hộp thoại"
                className="w-10 h-10 rounded-full inline-flex items-center justify-center text-theme-muted hover:bg-theme-page"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-theme-muted font-medium">
              Vui lòng ghi rõ lý do chuyên môn để hệ thống điều chỉnh lại thực đơn:
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label htmlFor="reject-note" className="sr-only">
                  Lý do từ chối
                </label>
                <textarea
                  id="reject-note"
                  rows={3}
                  required
                  placeholder="Ví dụ: Lượng đường hoặc muối vượt mức khuyến nghị cho giai đoạn này..."
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border border-theme-line bg-theme-page/60 text-sm font-medium text-theme-ink placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-brand"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setRejectingRecipe(null)}
                  className="min-h-[44px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold text-theme-ink bg-theme-page border border-theme-line hover:bg-theme-brand-soft"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-2xl text-xs sm:text-sm font-bold"
                >
                  Xác nhận từ chối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal gửi tư vấn */}
      {selectedMom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="consult-mom-title"
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <div className="bg-theme-surface rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-theme-line">
            <div className="flex items-center justify-between gap-3">
              <h3 id="consult-mom-title" className="font-bold text-base text-theme-ink flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-theme-brand" aria-hidden="true" />
                <span>Tư vấn cho {selectedMom.fullName || selectedMom.email}</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedMom(null)}
                aria-label="Đóng hộp thoại"
                className="w-10 h-10 rounded-full inline-flex items-center justify-center text-theme-muted hover:bg-theme-page"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={handleConsultSubmit} className="space-y-4">
              <div>
                <label htmlFor="expert-consult-msg" className="block text-xs font-bold text-theme-ink mb-1.5">
                  Nội dung khuyến nghị chuyên môn
                </label>
                <textarea
                  id="expert-consult-msg"
                  rows={4}
                  required
                  placeholder="Nhập lời khuyên dinh dưỡng, chế độ nghỉ ngơi hoặc lưu ý theo dõi..."
                  value={consultMessage}
                  onChange={(e) => setConsultMessage(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border border-theme-line bg-theme-page/60 text-sm font-medium text-theme-ink placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-brand"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedMom(null)}
                  className="min-h-[44px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold text-theme-ink bg-theme-page border border-theme-line hover:bg-theme-brand-soft"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 bg-theme-brand hover:bg-theme-ink text-theme-surface rounded-2xl text-xs sm:text-sm font-bold"
                >
                  Gửi tư vấn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
