import React, { useState, useEffect } from "react";
import expertService from "../../../models/services/expertService";
import { CheckCircle, XCircle, Clock, Utensils, UserCheck, MessageSquare, Sparkles, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function ExpertDashboardPage() {
  const [activeTab, setActiveTab] = useState("recipes"); // "recipes" | "moms"
  const [pendingRecipes, setPendingRecipes] = useState([]);
  const [assignedMoms, setAssignedMoms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state for rejection
  const [rejectingRecipe, setRejectingRecipe] = useState(null);
  const [rejectNote, setRejectNote] = useState("");

  // Consultation state
  const [selectedMom, setSelectedMom] = useState(null);
  const [consultMessage, setConsultMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "recipes") {
        const res = await expertService.getPendingRecipes();
        if (res.isSuccess && res.data) {
          setPendingRecipes(res.data);
        } else if (Array.isArray(res.data)) {
          setPendingRecipes(res.data);
        }
      } else {
        const res = await expertService.getAssignedMoms();
        if (res.isSuccess && res.data) {
          setAssignedMoms(res.data);
        } else if (Array.isArray(res.data)) {
          setAssignedMoms(res.data);
        }
      }
    } catch (err) {
      console.error("Failed to load expert data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleApprove = async (recipeId) => {
    try {
      const res = await expertService.reviewRecipe(recipeId, true, "Đã kiểm duyệt bởi chuyên gia dinh dưỡng.");
      if (res.isSuccess || res.success) {
        toast.success("Đã phê duyệt công thức món ăn thành công! 🎉");
        setPendingRecipes(pendingRecipes.filter((r) => r.id !== recipeId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingRecipe) return;
    try {
      const res = await expertService.reviewRecipe(rejectingRecipe.id, false, rejectNote || "Công thức chưa đạt yêu cầu dinh dưỡng.");
      if (res.isSuccess || res.success) {
        toast.success("Đã từ chối công thức thành công.");
        setPendingRecipes(pendingRecipes.filter((r) => r.id !== rejectingRecipe.id));
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
      const res = await expertService.consultMom(selectedMom.id || selectedMom.userId, consultMessage);
      if (res.isSuccess || res.success) {
        toast.success(`Đã gửi lời tư vấn cho mẹ ${selectedMom.fullName || selectedMom.email}!`);
        setSelectedMom(null);
        setConsultMessage("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Portal */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="z-10">
          <div className="flex items-center gap-2 text-pink-300 font-extrabold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" /> Portals Dành Cho Chuyên Gia (Medical Expert)
          </div>
          <h1 className="text-2xl font-black">Cổng Kiểm Duyệt & Tư Vấn Y Khoa 🩺</h1>
          <p className="text-xs text-purple-200 mt-1 max-w-xl font-medium leading-relaxed">
            Kiểm duyệt công thức dinh dưỡng do AI tạo trước khi cung cấp cho Mẹ bầu, đồng thời thực hiện tư vấn sức khỏe cá nhân hóa.
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
            Công Thức AI Chờ Duyệt ({pendingRecipes.length})
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

      {/* Main Content View */}
      {loading ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
          <div className="w-8 h-8 border-4 border-momPurple border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-gray-500">Đang tải dữ liệu kiểm duyệt...</p>
        </div>
      ) : activeTab === "recipes" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-gray-850 dark:text-white flex items-center gap-2">
              <Utensils className="w-5 h-5 text-momPink" />
              Danh Sách Thực Đơn Sinh Bởi AI Đang Chờ Chuyên Gia Duyệt
            </h2>
            <span className="text-xs text-gray-400 font-semibold">Tự động làm mới</span>
          </div>

          {pendingRecipes.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">Không có thực đơn nào đang chờ duyệt</h3>
              <p className="text-xs text-gray-400 mt-1">Tất cả thực đơn đề xuất từ AI đã được xử lý hoàn tất.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pendingRecipes.map((item) => {
                let recipeDetails = item;
                if (item.recipesJson) {
                  try {
                    const parsed = JSON.parse(item.recipesJson);
                    recipeDetails = Array.isArray(parsed) ? parsed[0] : parsed;
                  } catch (e) {}
                }
                return (
                  <div key={item.id} className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700/60 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-bold px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                          Chờ Chuyên Gia Phê Duyệt
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {recipeDetails.cookTime || 30} phút
                        </span>
                      </div>
                      
                      <h3 className="font-extrabold text-base text-gray-900 dark:text-white leading-snug">
                        {recipeDetails.title || recipeDetails.name || item.name || "Thực đơn dinh dưỡng AI"}
                      </h3>

                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                        {recipeDetails.description || "Công thức giàu dưỡng chất phù hợp cho thai kỳ."}
                      </p>

                      {/* Ingredients list preview */}
                      {recipeDetails.ingredients && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Thành phần nguyên liệu:</span>
                          <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                            {Array.isArray(recipeDetails.ingredients) ? recipeDetails.ingredients.join(", ") : recipeDetails.ingredients}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 flex gap-3">
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Chấp Thuận & Phát Hành
                      </button>
                      <button
                        onClick={() => setRejectingRecipe(item)}
                        className="px-4 py-2.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-red-200 dark:border-red-800"
                      >
                        <XCircle className="w-4 h-4" />
                        Từ Chối
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
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
                    <MessageSquare className="w-4 h-4" />
                    Tư Vấn Y Khoa
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Rejection Note Modal */}
      {rejectingRecipe && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100 dark:border-gray-700">
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2 text-red-500">
              <XCircle className="w-5 h-5" /> Từ Chối Thực Đơn AI
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Vui lòng nhập lý do hoặc ghi chú chỉnh sửa gửi cho hệ thống:
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                rows={3}
                required
                placeholder="Ví dụ: Lượng đường trong món ăn vượt quá mức khuyến cáo cho mami tiểu đường thai kỳ..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setRejectingRecipe(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Xác Nhận Từ Chối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consultation Modal */}
      {selectedMom && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100 dark:border-gray-700">
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2 text-momPurple">
              <MessageSquare className="w-5 h-5" /> Tư Vấn Cho: {selectedMom.fullName || selectedMom.email}
            </h3>
            <form onSubmit={handleConsultSubmit} className="space-y-4">
              <textarea
                rows={4}
                required
                placeholder="Nhập lời khuyên dinh dưỡng, chế độ nghỉ ngơi hoặc chỉ định y khoa..."
                value={consultMessage}
                onChange={(e) => setConsultMessage(e.target.value)}
                className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-momPurple"
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedMom(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-momPurple text-white rounded-xl text-xs font-bold shadow-md"
                >
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
