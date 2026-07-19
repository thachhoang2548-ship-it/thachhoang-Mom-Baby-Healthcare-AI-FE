import React, { useState, useEffect } from "react";
import expertService from "../../../models/services/expertService";
import { CheckCircle, XCircle, Clock, Utensils, UserCheck, MessageSquare, Sparkles, ShieldCheck, BadgeCheck, Baby, Heart } from "lucide-react";
import toast from "react-hot-toast";

// ── Reusable Recipe Table Component ──────────────────────────────────────────
function RecipeTable({ title, icon, iconColor, accentFrom, accentTo, recipes, onApprove, onReject }) {
  const approved = recipes.filter(r => r.status === "Approved");
  const pending = recipes.filter(r => r.status !== "Approved");
  // Show approved first, then pending
  const sorted = [...approved, ...pending];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className={`bg-gradient-to-r ${accentFrom} ${accentTo} px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-2.5 text-white">
          {icon}
          <h3 className="text-sm font-extrabold">{title}</h3>
          <span className="text-[10px] bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full font-bold">
            {recipes.length} công thức
          </span>
        </div>
        <div className="flex gap-2">
          <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
            <BadgeCheck className="w-3 h-3" /> {approved.length} đã duyệt
          </span>
          <span className="text-[9px] bg-amber-400/30 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" /> {pending.length} chờ duyệt
          </span>
        </div>
      </div>

      {/* Table Body */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 px-6">
          <Utensils className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-gray-400">Chưa có thực đơn nào trong danh mục này</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase w-10">TT</th>
                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase">Tên thực đơn</th>
                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase">Mô tả</th>
                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase text-center">Kcal</th>
                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase text-center">Trạng thái</th>
                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item, idx) => {
                const isApproved = item.status === "Approved";
                const isPending = item.status === "PendingReview" && !item._reviewedStatus;
                const localApproved = item._reviewedStatus === "approved";
                const localRejected = item._reviewedStatus === "rejected";

                return (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-50 dark:border-gray-800 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-900/20 ${
                      isApproved || localApproved ? "bg-emerald-50/20 dark:bg-emerald-950/10" : ""
                    }`}
                  >
                    {/* Index */}
                    <td className="px-5 py-3.5 text-xs font-bold text-gray-400">{idx + 1}</td>

                    {/* Title */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {(isApproved || localApproved) && (
                          <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                        <span className="text-xs font-extrabold text-gray-800 dark:text-white leading-tight">
                          {item.title || item.name || "Thực đơn AI"}
                        </span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-5 py-3.5">
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium line-clamp-2 max-w-xs">
                        {item.description || "Công thức dinh dưỡng do AI tạo."}
                      </p>
                    </td>

                    {/* Calories */}
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {item.calories || 0}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-3.5 text-center">
                      {isApproved || localApproved ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle className="w-3 h-3" /> Đã Duyệt ✓
                        </span>
                      ) : localRejected ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-red-50 dark:bg-red-900/30 text-red-500 font-bold px-2.5 py-1 rounded-full border border-red-200 dark:border-red-800">
                          <XCircle className="w-3 h-3" /> Đã Từ Chối
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-bold px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800 animate-pulse">
                          <Clock className="w-3 h-3" /> Chờ duyệt
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-center">
                      {isPending && !localApproved && !localRejected ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => onApprove(item.id)}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" /> Duyệt
                          </button>
                          <button
                            onClick={() => onReject(item)}
                            className="px-3 py-1.5 bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-100 rounded-lg text-[10px] font-bold transition-all border border-red-200 dark:border-red-800 flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" /> Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-semibold">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main Expert Dashboard ────────────────────────────────────────────────────
export default function ExpertDashboardPage() {
  const [activeTab, setActiveTab] = useState("recipes"); // "recipes" | "moms"
  const [momRecipes, setMomRecipes] = useState([]);
  const [babyRecipes, setBabyRecipes] = useState([]);
  const [pendingRecipes, setPendingRecipes] = useState([]);
  const [assignedMoms, setAssignedMoms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [rejectingRecipe, setRejectingRecipe] = useState(null);
  const [rejectNote, setRejectNote] = useState("");
  const [selectedMom, setSelectedMom] = useState(null);
  const [consultMessage, setConsultMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "recipes") {
        // Try new grouped endpoint first, fall back to pending-only
        try {
          const res = await expertService.getAllRecipes();
          if ((res.isSuccess || res.success) && res.data) {
            setMomRecipes(res.data.momRecipes || []);
            setBabyRecipes(res.data.babyRecipes || []);
            return;
          }
        } catch {
          // Fallback: use old pending endpoint
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
  };

  useEffect(() => { loadData(); }, [activeTab]);

  // Helper: update recipe status in the correct list
  const updateRecipeStatus = (recipeId, status) => {
    const updater = prev => prev.map(r => r.id === recipeId ? { ...r, _reviewedStatus: status } : r);
    setMomRecipes(updater);
    setBabyRecipes(updater);
    setPendingRecipes(updater);
  };

  const handleApprove = async (recipeId) => {
    try {
      const res = await expertService.reviewRecipe(recipeId, true, "Đã kiểm duyệt bởi chuyên gia dinh dưỡng.");
      if (res.isSuccess || res.success) {
        toast.success("Đã phê duyệt công thức món ăn thành công! 🎉");
        updateRecipeStatus(recipeId, "approved");
      }
    } catch (err) { console.error(err); }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingRecipe) return;
    try {
      const res = await expertService.reviewRecipe(rejectingRecipe.id, false, rejectNote || "Công thức chưa đạt yêu cầu dinh dưỡng.");
      if (res.isSuccess || res.success) {
        toast.success("Đã từ chối công thức thành công.");
        updateRecipeStatus(rejectingRecipe.id, "rejected");
        setRejectingRecipe(null);
        setRejectNote("");
      }
    } catch (err) { console.error(err); }
  };

  const handleConsultSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMom || !consultMessage.trim()) return;
    try {
      const res = await expertService.consultMom(selectedMom.id || selectedMom.userId, consultMessage);
      if (res.isSuccess || res.success) {
        toast.success(`Đã gửi lời tư vấn cho mẹ ${selectedMom.fullName || selectedMom.email}!`);
        setSelectedMom(null);
        setConsultMessage("");
      }
    } catch (err) { console.error(err); }
  };

  // Merge pending recipes into mom list if we're using old endpoint fallback
  const effectiveMomRecipes = momRecipes.length > 0 ? momRecipes : pendingRecipes;
  const totalPending = [...effectiveMomRecipes, ...babyRecipes].filter(
    r => (r.status === "PendingReview" || !r.status) && !r._reviewedStatus
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="z-10">
          <div className="flex items-center gap-2 text-pink-300 font-extrabold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" /> Portals Dành Cho Chuyên Gia (Medical Expert)
          </div>
          <h1 className="text-2xl font-black">Cổng Kiểm Duyệt & Tư Vấn Y Khoa 🩺</h1>
          <p className="text-xs text-purple-200 mt-1 max-w-xl font-medium leading-relaxed">
            Kiểm duyệt công thức dinh dưỡng do AI tạo cho Mẹ bầu và Bé yêu. Thực đơn đã duyệt sẽ được ưu tiên hiển thị kèm dấu tích ✓.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 z-10 shrink-0">
          <button
            onClick={() => setActiveTab("recipes")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "recipes" ? "bg-white text-purple-900 shadow-md" : "text-purple-100 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Thực Đơn ({totalPending} chờ duyệt)
          </button>
          <button
            onClick={() => setActiveTab("moms")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "moms" ? "bg-white text-purple-900 shadow-md" : "text-purple-100 hover:text-white"
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-500" />
            Tư Vấn Mẹ Bầu
          </button>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
          <div className="w-8 h-8 border-4 border-momPurple border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-gray-500">Đang tải dữ liệu kiểm duyệt...</p>
        </div>

      ) : activeTab === "recipes" ? (
        /* ── Two Recipe Tables ── */
        <div className="space-y-6">
          {/* Mom Recipes Table */}
          <RecipeTable
            title="Thực Đơn Cho Mẹ Bầu"
            icon={<Heart className="w-5 h-5 text-white" />}
            iconColor="text-pink-400"
            accentFrom="from-pink-500"
            accentTo="to-rose-500"
            recipes={effectiveMomRecipes}
            onApprove={handleApprove}
            onReject={setRejectingRecipe}
          />

          {/* Baby Recipes Table */}
          <RecipeTable
            title="Thực Đơn Cho Bé Yêu"
            icon={<Baby className="w-5 h-5 text-white" />}
            iconColor="text-sky-400"
            accentFrom="from-sky-500"
            accentTo="to-cyan-500"
            recipes={babyRecipes}
            onApprove={handleApprove}
            onReject={setRejectingRecipe}
          />
        </div>

      ) : (
        /* ── Mom Consultation Tab ── */
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-gray-850 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-momPurple" />
            Danh Sách Mẹ Bầu Cần Tư Vấn Chuyên Gia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {assignedMoms.length === 0 ? (
              <div className="col-span-3 text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-400 font-semibold">Chưa có mami nào được phân công tư vấn trực tiếp.</p>
              </div>
            ) : (
              assignedMoms.map((mom) => (
                <div key={mom.id || mom.userId} className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">{mom.fullName || mom.email}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{mom.email}</p>
                    <div className="mt-3 inline-block bg-pink-50 dark:bg-pink-900/30 text-momPink text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                      Giai đoạn: {mom.stage || "Thai kỳ"}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMom(mom)}
                    className="w-full py-2.5 bg-momPurple text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/10"
                  >
                    <MessageSquare className="w-4 h-4" /> Tư Vấn Y Khoa
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Rejection Modal ── */}
      {rejectingRecipe && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100 dark:border-gray-700">
            <h3 className="font-extrabold text-base text-red-500 flex items-center gap-2">
              <XCircle className="w-5 h-5" /> Từ Chối Thực Đơn AI
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Vui lòng nhập lý do hoặc ghi chú chỉnh sửa gửi cho hệ thống:
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                rows={3} required
                placeholder="Ví dụ: Lượng đường trong món ăn vượt quá mức khuyến cáo..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setRejectingRecipe(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Hủy
                </button>
                <button type="submit"
                  className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-md">
                  Xác Nhận Từ Chối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Consultation Modal ── */}
      {selectedMom && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100 dark:border-gray-700">
            <h3 className="font-extrabold text-base text-momPurple flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> Tư Vấn Cho: {selectedMom.fullName || selectedMom.email}
            </h3>
            <form onSubmit={handleConsultSubmit} className="space-y-4">
              <textarea
                rows={4} required
                placeholder="Nhập lời khuyên dinh dưỡng, chế độ nghỉ ngơi hoặc chỉ định y khoa..."
                value={consultMessage}
                onChange={(e) => setConsultMessage(e.target.value)}
                className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-momPurple"
              />
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setSelectedMom(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Hủy
                </button>
                <button type="submit"
                  className="px-5 py-2 bg-momPurple text-white rounded-xl text-xs font-bold shadow-md">
                  Gửi Tư Vấn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
