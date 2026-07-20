import React, { useState, useEffect } from "react";
import adminService from "../../../models/services/adminService";
import { Users, Lock, Unlock, UserPlus, ShieldAlert, FileText, Settings, CheckCircle2, Database, RefreshCw, Edit, Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("users"); // "users" | "risk" | "rules"
  const [users, setUsers] = useState([]);
  const [riskUsers, setRiskUsers] = useState([]);
  const [businessRules, setBusinessRules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal create staff/expert
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "Staff" // "Staff" | "Expert"
  });

  // USDA sync states
  const [usdaQuery, setUsdaQuery] = useState("milk");
  const [usdaMaxItems, setUsdaMaxItems] = useState(5);
  const [usdaLoading, setUsdaLoading] = useState(false);

  // Edit Business Rule States
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [ruleForm, setRuleForm] = useState({
    code: "",
    title: "",
    description: "",
    targetMetric: "EPDS_SCORE",
    operator: ">=",
    thresholdValue: 9,
    severity: 1, // 0: Critical, 1: High, 2: Medium, 3: Warning
    isActive: true
  });

  const handleOpenEditRule = (rule) => {
    setEditingRule(rule);
    setRuleForm({
      code: rule.code || rule.ruleName || "RULE_01",
      title: rule.title || rule.name || "Cấu hình quy tắc",
      description: rule.description || "",
      targetMetric: rule.targetMetric || "EPDS_SCORE",
      operator: rule.operator || ">=",
      thresholdValue: rule.thresholdValue ?? rule.value ?? 9,
      severity: rule.severity ?? 1,
      isActive: rule.isActive ?? true
    });
    setShowRuleModal(true);
  };

  const handleOpenCreateRule = () => {
    setEditingRule(null);
    setRuleForm({
      code: "RULE_NEW",
      title: "Quy tắc mới",
      description: "Mô tả quy tắc mới",
      targetMetric: "EPDS_SCORE",
      operator: ">=",
      thresholdValue: 10,
      severity: 1,
      isActive: true
    });
    setShowRuleModal(true);
  };

  const handleRuleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRule) {
        const res = await adminService.updateBusinessRule(editingRule.id, ruleForm);
        if (res.isSuccess || res.success) {
          toast.success("Đã cập nhật quy tắc vận hành thành công! 🎉");
          setShowRuleModal(false);
          loadData();
        }
      } else {
        const res = await adminService.createBusinessRule(ruleForm);
        if (res.isSuccess || res.success) {
          toast.success("Đã tạo mới quy tắc vận hành! 🎉");
          setShowRuleModal(false);
          loadData();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUsdaSync = async (e) => {
    e.preventDefault();
    if (!usdaQuery.trim()) return;
    setUsdaLoading(true);
    try {
      const res = await adminService.syncUsdaData(usdaQuery, parseInt(usdaMaxItems));
      if (res.isSuccess || res.success) {
        toast.success(res.message || res.data || `Đã đồng bộ dữ liệu dinh dưỡng "${usdaQuery}"!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUsdaLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "users") {
        const res = await adminService.getAllUsers();
        if (res.isSuccess && res.data) setUsers(res.data);
        else if (Array.isArray(res.data)) setUsers(res.data);
      } else if (activeTab === "risk") {
        const res = await adminService.getUsersAtRisk();
        if (res.isSuccess && res.data) setRiskUsers(res.data);
        else if (Array.isArray(res.data)) setRiskUsers(res.data);
      } else if (activeTab === "rules") {
        const res = await adminService.getBusinessRules();
        if (res.isSuccess && res.data) setBusinessRules(res.data);
        else if (Array.isArray(res.data)) setBusinessRules(res.data);
      }
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleLockToggle = async (user) => {
    try {
      if (user.isLocked || user.lockoutEnabled) {
        const res = await adminService.unlockUser(user.id);
        if (res.isSuccess || res.success) {
          toast.success(`Đã mở khóa tài khoản ${user.email}`);
          loadData();
        }
      } else {
        const res = await adminService.lockUser(user.id);
        if (res.isSuccess || res.success) {
          toast.success(`Đã khóa tài khoản ${user.email}`);
          loadData();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await adminService.createStaffOrExpert(createForm);
      if (res.isSuccess || res.success) {
        toast.success(`Đã tạo tài khoản ${createForm.role} thành công! 🎉`);
        setShowCreateModal(false);
        setCreateForm({ email: "", password: "", fullName: "", role: "Staff" });
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Admin Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="z-10">
          <div className="flex items-center gap-2 text-blue-400 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" /> System Administrator Portal
          </div>
          <h1 className="text-2xl font-black">Cổng Quản Trị Hệ Thống ⚙️</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl font-medium leading-relaxed">
            Quản lý tài khoản người dùng, phân quyền Nhân viên / Chuyên gia, giám sát nguy cơ sức khỏe và cấu hình quy tắc vận hành.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 z-10 shrink-0 flex-wrap gap-1">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "users" ? "bg-white text-gray-900 shadow-md" : "text-slate-200 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4 text-blue-500" /> Người Dùng
          </button>
          <button
            onClick={() => setActiveTab("risk")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "risk" ? "bg-white text-gray-900 shadow-md" : "text-slate-200 hover:text-white"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-500" /> Nguy Cơ Cao
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "rules" ? "bg-white text-gray-900 shadow-md" : "text-slate-200 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-500" /> Quy Tắc DB
          </button>
        </div>
      </div>

      {/* Main View */}
      {loading ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-gray-500">Đang tải dữ liệu quản trị...</p>
        </div>
      ) : activeTab === "users" ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <h2 className="text-base font-extrabold text-gray-850 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" /> Quản Lý Danh Sách Người Dùng Hợp Tác
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2 transition-all"
            >
              <UserPlus className="w-4 h-4" /> Tạo Nhân Viên / Chuyên Gia
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Họ và Tên / Email</th>
                    <th className="py-3.5 px-4">Vai Trò (Roles)</th>
                    <th className="py-3.5 px-4">Trạng Thái Khoá</th>
                    <th className="py-3.5 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 font-medium">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-400">Không tìm thấy người dùng nào.</td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const isLocked = u.isLocked || u.lockoutEnabled;
                      const rolesList = Array.isArray(u.roles) ? u.roles.join(", ") : (u.roles || "Mom");
                      return (
                        <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-gray-900 dark:text-white">{u.fullName || u.email}</div>
                            <div className="text-[10px] text-gray-400">{u.email}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-extrabold px-2.5 py-0.5 rounded-full text-[10px]">
                              {rolesList}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {isLocked ? (
                              <span className="bg-red-50 text-red-600 font-bold px-2.5 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Đã khóa
                              </span>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-600 font-bold px-2.5 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Hoạt động
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleLockToggle(u)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all inline-flex items-center gap-1 ${
                                isLocked
                                  ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                  : "bg-red-50 text-red-600 hover:bg-red-100"
                              }`}
                            >
                              {isLocked ? <><Unlock className="w-3.5 h-3.5" /> Mở khoá</> : <><Lock className="w-3.5 h-3.5" /> Khóa TK</>}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === "risk" ? (
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-gray-850 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" /> Danh Sách Mẹ Bầu Kích Hoạt Cảnh Báo Nguy Cơ Cao
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskUsers.length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-400 font-semibold">Hiện không có mẹ bầu nào kích hoạt cảnh báo nguy cơ cao.</p>
              </div>
            ) : (
              riskUsers.map((r) => (
                <div key={r.id || r.userId} className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-red-100 dark:border-red-900/40 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] bg-red-100 text-red-700 font-black px-2.5 py-0.5 rounded-full">HIGH SEVERITY</span>
                    <span className="text-[10px] text-gray-400">{r.updatedAt || "Gần đây"}</span>
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">{r.fullName || r.email}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Lý do: {r.alertReason || "Chỉ số đường huyết hoặc triệu chứng bất thường."}</p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-gray-850 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" /> Cấu Hình Quy Tắc Hệ Thống (Business Rules)
          </h2>

          {/* USDA Integration Sync UI */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-lg space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm text-emerald-300">Đồng Bộ Dữ Liệu Dinh Dưỡng Quốc Tế (USDA FoodData Central)</h3>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                POST /api/admin/usda/sync
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tải tự động thông tin Năng lượng (Calo), Đạm (Protein), Tinh bột (Carbs) và Chất béo (Fat) từ Bộ Nông nghiệp Hoa Kỳ vào DB local.
            </p>
            <form onSubmit={handleUsdaSync} className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  required
                  placeholder="Từ khóa (VD: milk, salmon, apple...)"
                  value={usdaQuery}
                  onChange={(e) => setUsdaQuery(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-xs font-semibold text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div className="w-24">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={usdaMaxItems}
                  onChange={(e) => setUsdaMaxItems(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-xs font-bold text-white text-center focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <button
                type="submit"
                disabled={usdaLoading}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black text-xs rounded-2xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${usdaLoading ? "animate-spin" : ""}`} />
                {usdaLoading ? "Đang đồng bộ..." : "Đồng Bộ Dữ Liệu"}
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-extrabold text-xs text-gray-500 uppercase tracking-wider">Danh Sách Tham Số Ngưỡng (Threshold Parameters)</h3>
              <button
                onClick={handleOpenCreateRule}
                className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm Quy Tắc
              </button>
            </div>

            {businessRules.length === 0 ? (
              <p className="text-xs text-gray-400 font-semibold">Chưa có quy tắc nào được định nghĩa trong hệ thống.</p>
            ) : (
              businessRules.map((rule) => (
                <div key={rule.id} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex justify-between items-center gap-4 hover:border-blue-200 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-extrabold bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                        {rule.code || rule.ruleName || "BR"}
                      </span>
                      <h4 className="font-bold text-xs text-gray-900 dark:text-white">{rule.title || rule.name}</h4>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">{rule.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800">
                      Ngưỡng: {rule.operator || ">="} {rule.thresholdValue ?? rule.value ?? 9}
                    </span>
                    <button
                      onClick={() => handleOpenEditRule(rule)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-xl transition-all"
                      title="Chỉnh sửa tham số quy tắc"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal Edit/Create Business Rule */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100 dark:border-gray-700">
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-500" />
              {editingRule ? `Điều Chỉnh Quy Tắc ${editingRule.code || editingRule.ruleName || ""}` : "Tạo Quy Tắc Hệ Thống Mới"}
            </h3>
            <form onSubmit={handleRuleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Mã Quy Tắc (Code)</label>
                <input
                  type="text"
                  required
                  placeholder="VD: BR05_EPDS"
                  value={ruleForm.code}
                  onChange={(e) => setRuleForm({ ...ruleForm, code: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Tên Quy Tắc (Title)</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Ngưỡng cảnh báo trầm cảm EPDS"
                  value={ruleForm.title}
                  onChange={(e) => setRuleForm({ ...ruleForm, title: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Toán Tử (Operator)</label>
                  <select
                    value={ruleForm.operator}
                    onChange={(e) => setRuleForm({ ...ruleForm, operator: e.target.value })}
                    className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value=">=">&gt;= (Lớn hơn hoặc bằng)</option>
                    <option value=">">&gt; (Lớn hơn)</option>
                    <option value="<=">&lt;= (Nhỏ hơn hoặc bằng)</option>
                    <option value="<">&lt; (Nhỏ hơn)</option>
                    <option value="==">== (Bằng)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Giá Trị Ngưỡng (Threshold)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={ruleForm.thresholdValue}
                    onChange={(e) => setRuleForm({ ...ruleForm, thresholdValue: parseFloat(e.target.value) })}
                    className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Mô Tả Quy Tắc</label>
                <textarea
                  rows="2"
                  value={ruleForm.description}
                  onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all"
                >
                  Lưu Quy Tắc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Create Staff/Expert */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100 dark:border-gray-700">
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" /> Tạo Tài Khoản Nhân Viên / Chuyên Gia
            </h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Họ và Tên</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bác sĩ Nguyễn Văn A"
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Email Đăng Nhập</label>
                <input
                  type="email"
                  required
                  placeholder="expert@momi.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Mật Khẩu Khởi Tạo</label>
                <input
                  type="password"
                  required
                  placeholder="Mật khẩu an toàn"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Loại Vai Trò (Role)</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Staff">Care Staff (Nhân viên chăm sóc)</option>
                  <option value="Expert">Medical Expert (Chuyên gia y tế / Dinh dưỡng)</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
