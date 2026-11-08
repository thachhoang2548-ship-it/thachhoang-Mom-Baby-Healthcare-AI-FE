import React, { useState, useEffect, useCallback } from "react";
import adminService from "../../../models/services/adminService";
import AdminPaymentsPanel from "./AdminPaymentsPanel";
import AdminFeedbackPanel from "./AdminFeedbackPanel";
import {
  Users,
  Lock,
  Unlock,
  UserPlus,
  ShieldAlert,
  FileText,
  Settings,
  CheckCircle2,
  Database,
  RefreshCw,
  Edit,
  Plus,
  DollarSign,
  CreditCard,
  TrendingUp,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import toast from "react-hot-toast";
import { useThemeColors } from "../../../hooks/useThemeColors";

export default function AdminDashboardPage() {
  const colors = useThemeColors();
  const planColors = [colors.brand, colors.ok, colors.info, colors.warn, colors.muted];
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [riskUsers, setRiskUsers] = useState([]);
  const [businessRules, setBusinessRules] = useState([]);
  const [revenueSummary, setRevenueSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "Staff",
  });

  const formatMoney = (amount) =>
    Number(amount || 0).toLocaleString("vi-VN") + " đ";

  const revenueChartData = (revenueSummary?.monthlyTrend || []).map((item) => ({
    ...item,
    label: item.month?.length === 10 ? item.month.slice(5).replace("-", "/") : item.month,
  }));

  const planChartData = (revenueSummary?.byPlan || []).map((item) => ({
    ...item,
    name: item.planCode || item.tier || "Gói dịch vụ",
    value: Number(item.revenue || 0),
  }));

  const [usdaQuery, setUsdaQuery] = useState("milk");
  const [usdaMaxItems, setUsdaMaxItems] = useState(5);
  const [usdaLoading, setUsdaLoading] = useState(false);

  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [ruleForm, setRuleForm] = useState({
    code: "",
    title: "",
    description: "",
    targetMetric: "EPDS_SCORE",
    operator: ">=",
    thresholdValue: 9,
    severity: 1,
    isActive: true,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "users") {
        const res = await adminService.getAllUsers();
        if (res.isSuccess && res.data) setUsers(res.data);
        else if (Array.isArray(res.data)) setUsers(res.data);

        const revenueRes = await adminService.getRevenueSummary();
        if (revenueRes.isSuccess && revenueRes.data) setRevenueSummary(revenueRes.data);
      } else if (activeTab === "risk") {
        const res = await adminService.getUsersAtRisk();
        if (res.isSuccess && res.data) setRiskUsers(res.data);
        else if (Array.isArray(res.data)) setRiskUsers(res.data);
      } else if (activeTab === "rules") {
        const res = await adminService.getBusinessRules();
        if (res.isSuccess && res.data) setBusinessRules(res.data);
        else if (Array.isArray(res.data)) setBusinessRules(res.data);
      } else if (activeTab === "revenue") {
        const res = await adminService.getRevenueSummary();
        if (res.isSuccess && res.data) setRevenueSummary(res.data);
        else setRevenueSummary(res.data || null);
      }
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      isActive: rule.isActive ?? true,
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
      isActive: true,
    });
    setShowRuleModal(true);
  };

  const handleRuleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRule) {
        const res = await adminService.updateBusinessRule(editingRule.id, ruleForm);
        if (res.isSuccess || res.success) {
          toast.success("Đã cập nhật quy tắc vận hành thành công.");
          setShowRuleModal(false);
          loadData();
        }
      } else {
        const res = await adminService.createBusinessRule(ruleForm);
        if (res.isSuccess || res.success) {
          toast.success("Đã tạo mới quy tắc vận hành.");
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
      const res = await adminService.syncUsdaData(usdaQuery, parseInt(usdaMaxItems, 10));
      if (res.isSuccess || res.success) {
        toast.success(
          res.message || res.data || `Đã đồng bộ dữ liệu dinh dưỡng "${usdaQuery}"!`
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUsdaLoading(false);
    }
  };

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
        toast.success(`Đã tạo tài khoản ${createForm.role} thành công.`);
        setShowCreateModal(false);
        setCreateForm({ email: "", password: "", fullName: "", role: "Staff" });
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="font-display space-y-6 max-w-6xl mx-auto pb-12 text-theme-ink">
      {/* Header */}
      <header className="bg-theme-surface rounded-3xl border border-theme-line p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-theme-brand-soft text-theme-ink px-3.5 py-1.5 text-xs font-bold border border-theme-brand/20">
            <Settings className="w-4 h-4 text-theme-brand" aria-hidden="true" />
            <span>Quản trị vận hành hệ thống</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-ink tracking-tight">
            Cổng quản trị Mom Ơi!
          </h1>
          <p className="text-sm text-theme-muted font-medium leading-relaxed">
            Theo dõi doanh thu hội viên, quản lý tài khoản người dùng, phân quyền nhân sự chuyên môn và cấu hình tham số cảnh báo y khoa.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0" role="tablist" aria-label="Phân hệ quản trị">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "users"}
            onClick={() => setActiveTab("users")}
            className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
              activeTab === "users"
                ? "bg-theme-brand text-theme-surface shadow-sm"
                : "bg-theme-page text-theme-ink border border-theme-line hover:bg-theme-brand-soft"
            }`}
          >
            <Users className="w-4 h-4" aria-hidden="true" />
            <span>Người dùng & doanh thu</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "risk"}
            onClick={() => setActiveTab("risk")}
            className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
              activeTab === "risk"
                ? "bg-theme-brand text-theme-surface shadow-sm"
                : "bg-theme-page text-theme-ink border border-theme-line hover:bg-theme-brand-soft"
            }`}
          >
            <ShieldAlert className="w-4 h-4" aria-hidden="true" />
            <span>Nguy cơ cao</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "rules"}
            onClick={() => setActiveTab("rules")}
            className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
              activeTab === "rules"
                ? "bg-theme-brand text-theme-surface shadow-sm"
                : "bg-theme-page text-theme-ink border border-theme-line hover:bg-theme-brand-soft"
            }`}
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            <span>Quy tắc & dữ liệu</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      {loading ? (
        <div className="text-center py-16 bg-theme-surface rounded-3xl border border-theme-line">
          <p className="text-sm font-semibold text-theme-muted">Đang tải dữ liệu quản trị...</p>
        </div>
      ) : activeTab === "users" ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <h2 className="text-lg font-bold text-theme-ink flex items-center gap-2">
              <Users className="w-5 h-5 text-theme-brand" aria-hidden="true" />
              <span>Tổng quan vận hành & danh sách tài khoản</span>
            </h2>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="min-h-[44px] px-4 py-2.5 bg-theme-brand hover:bg-theme-ink text-theme-surface rounded-2xl text-xs sm:text-sm font-bold shadow-sm inline-flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
            >
              <UserPlus className="w-4 h-4" aria-hidden="true" />
              <span>Tạo tài khoản Nhân viên / Chuyên gia</span>
            </button>
          </div>

          {revenueSummary && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Tổng doanh thu",
                    value: formatMoney(revenueSummary.totalRevenue),
                    icon: DollarSign,
                    iconBox: "bg-status-ok-bg text-status-ok border border-status-ok-line",
                  },
                  {
                    label: "Doanh thu tháng này",
                    value: formatMoney(revenueSummary.monthlyRevenue),
                    icon: TrendingUp,
                    iconBox: "bg-theme-brand-soft text-theme-brand border border-theme-brand/20",
                  },
                  {
                    label: "Doanh thu hôm nay",
                    value: formatMoney(revenueSummary.todayRevenue),
                    icon: CreditCard,
                    iconBox: "bg-theme-page text-theme-ink border border-theme-line",
                  },
                  {
                    label: "Hội viên trả phí",
                    value: revenueSummary.payingUserCount || 0,
                    icon: Users,
                    iconBox: "bg-status-warn-bg text-status-warn-text border border-status-warn-line/40",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <article
                      key={item.label}
                      className="bg-theme-surface rounded-3xl border border-theme-line p-5 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-theme-muted">{item.label}</p>
                          <p className="text-xl font-extrabold text-theme-ink mt-1">{item.value}</p>
                        </div>
                        <div className={`w-11 h-11 rounded-2xl ${item.iconBox} flex items-center justify-center shrink-0`}>
                          <Icon className="w-5 h-5" aria-hidden="true" />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
                <section className="xl:col-span-3 bg-theme-surface rounded-3xl border border-theme-line p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-theme-ink">Xu hướng doanh thu</h3>
                      <p className="text-xs font-medium text-theme-muted mt-0.5">Theo 14 ngày gần nhất</p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="h-72">
                    {revenueChartData.length === 0 ? (
                      <div className="h-full rounded-2xl bg-theme-page border border-theme-line flex items-center justify-center text-xs sm:text-sm font-semibold text-theme-muted">
                        Chưa có dữ liệu doanh thu.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.line} />
                          <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: colors.muted, fontWeight: 600 }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: colors.muted, fontWeight: 600 }}
                            tickFormatter={(value) => `${Number(value) / 1000}k`}
                            width={46}
                          />
                          <Tooltip
                            formatter={(value) => [formatMoney(value), "Doanh thu"]}
                            labelFormatter={(label) => `Ngày ${label}`}
                            contentStyle={{
                              borderRadius: 16,
                              border: `1px solid ${colors.line}`,
                              backgroundColor: colors.surface,
                              color: colors.ink,
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke={colors.brand}
                            strokeWidth={2.5}
                            fill={colors.brandSoft}
                            fillOpacity={0.75}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </section>

                <section className="xl:col-span-2 bg-theme-surface rounded-3xl border border-theme-line p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-theme-ink">Cơ cấu gói hội viên</h3>
                      <p className="text-xs font-medium text-theme-muted mt-0.5">Tỷ trọng doanh thu</p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center">
                      <CreditCard className="w-5 h-5" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="h-64">
                    {planChartData.length === 0 ? (
                      <div className="h-full rounded-2xl bg-theme-page border border-theme-line flex items-center justify-center text-xs sm:text-sm font-semibold text-theme-muted">
                        Chưa có dữ liệu gói.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={planChartData}
                            innerRadius={58}
                            outerRadius={88}
                            paddingAngle={3}
                            dataKey="value"
                            nameKey="name"
                          >
                            {planChartData.map((entry, index) => (
                              <Cell
                                key={entry.name}
                                fill={planColors[index % planColors.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name) => [formatMoney(value), name]}
                            contentStyle={{
                              borderRadius: 16,
                              border: `1px solid ${colors.line}`,
                              backgroundColor: colors.surface,
                              color: colors.ink,
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {planChartData.slice(0, 4).map((plan, index) => (
                      <div
                        key={plan.name}
                        className="flex items-center gap-2 text-xs font-bold text-theme-ink min-w-0"
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: planColors[index % planColors.length] }}
                        />
                        <span className="truncate">{plan.name}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <section className="bg-theme-surface rounded-3xl border border-theme-line p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-theme-ink">Số lượt mua theo từng gói</h3>
                    <p className="text-xs font-medium text-theme-muted mt-0.5">
                      Đối chiếu số lượng đơn hàng hoàn tất giữa các gói dịch vụ
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center">
                    <Database className="w-5 h-5" aria-hidden="true" />
                  </div>
                </div>
                <div className="h-64">
                  {planChartData.length === 0 ? (
                    <div className="h-full rounded-2xl bg-theme-page border border-theme-line flex items-center justify-center text-xs sm:text-sm font-semibold text-theme-muted">
                      Chưa có dữ liệu giao dịch.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={planChartData}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.line} />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: colors.muted, fontWeight: 600 }}
                        />
                        <YAxis
                          allowDecimals={false}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: colors.muted, fontWeight: 600 }}
                          width={38}
                        />
                        <Tooltip
                          formatter={(value) => [value, "Lượt mua"]}
                          contentStyle={{
                            borderRadius: 16,
                            border: `1px solid ${colors.line}`,
                            backgroundColor: colors.surface,
                            color: colors.ink,
                          }}
                        />
                        <Bar dataKey="transactionCount" radius={[10, 10, 0, 0]} fill={colors.ok} barSize={34} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <section className="bg-theme-surface rounded-3xl border border-theme-line p-5 sm:p-6 shadow-sm">
                  <h3 className="text-base font-bold text-theme-ink mb-3">Doanh thu chi tiết theo gói</h3>
                  <div className="space-y-3">
                    {(revenueSummary.byPlan || []).length === 0 ? (
                      <p className="text-xs sm:text-sm text-theme-muted font-medium">
                        Chưa có giao dịch hoàn tất.
                      </p>
                    ) : (
                      revenueSummary.byPlan.map((plan) => (
                        <div
                          key={`${plan.planCode}-${plan.durationMonths}`}
                          className="flex items-center justify-between gap-3 rounded-2xl bg-theme-page border border-theme-line p-3.5"
                        >
                          <div>
                            <p className="text-sm font-bold text-theme-ink">{plan.planCode}</p>
                            <p className="text-xs text-theme-muted font-medium">
                              {plan.tier} • {plan.durationMonths} tháng • {plan.transactionCount} giao dịch
                            </p>
                          </div>
                          <span className="text-sm font-extrabold text-theme-ink">
                            {formatMoney(plan.revenue)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <section className="bg-theme-surface rounded-3xl border border-theme-line p-5 sm:p-6 shadow-sm">
                  <h3 className="text-base font-bold text-theme-ink mb-3">Giao dịch hoàn tất mới nhất</h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {(revenueSummary.recentTransactions || []).length === 0 ? (
                      <p className="text-xs sm:text-sm text-theme-muted font-medium">
                        Chưa có giao dịch hoàn tất.
                      </p>
                    ) : (
                      revenueSummary.recentTransactions.map((txn) => (
                        <div
                          key={txn.id || txn.orderCode}
                          className="rounded-2xl border border-theme-line bg-theme-page/50 p-3.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-theme-ink truncate">
                                {txn.userName || txn.userEmail || "Người dùng"}
                              </p>
                              <p className="text-xs text-theme-muted font-medium truncate">
                                Mã đơn: {txn.orderCode}
                              </p>
                              <p className="text-xs text-theme-muted font-medium">
                                {txn.planCode} • {txn.paymentMethod}
                              </p>
                            </div>
                            <span className="text-sm font-extrabold text-theme-brand shrink-0">
                              {formatMoney(txn.amount)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}

          <AdminPaymentsPanel />
          <AdminFeedbackPanel />

          {/* Bảng người dùng */}
          <section className="bg-theme-surface rounded-3xl border border-theme-line overflow-hidden shadow-sm">
            <div className="p-5 sm:p-6 border-b border-theme-line">
              <h3 className="text-base font-bold text-theme-ink">Danh sách tài khoản người dùng</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-theme-page border-b border-theme-line text-theme-muted font-bold">
                    <th className="py-3.5 px-5">Họ và tên / Email</th>
                    <th className="py-3.5 px-5">Vai trò</th>
                    <th className="py-3.5 px-5">Trạng thái</th>
                    <th className="py-3.5 px-5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-line">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-theme-muted font-semibold">
                        Không tìm thấy người dùng nào.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const isLocked = u.isLocked || u.lockoutEnabled;
                      const rolesList = Array.isArray(u.roles)
                        ? u.roles.join(", ")
                        : u.roles || "Mom";
                      return (
                        <tr key={u.id} className="hover:bg-theme-page/50 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="font-bold text-theme-ink">{u.fullName || u.email}</div>
                            <div className="text-xs text-theme-muted">{u.email}</div>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="inline-flex bg-theme-brand-soft text-theme-ink border border-theme-brand/20 font-bold px-2.5 py-0.5 rounded-full text-xs">
                              {rolesList}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            {isLocked ? (
                              <span className="bg-status-danger-bg border border-status-danger-line text-status-danger-text font-bold px-2.5 py-0.5 rounded-full text-xs inline-flex items-center gap-1">
                                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Đã khóa</span>
                              </span>
                            ) : (
                              <span className="bg-status-ok-bg border border-status-ok-line text-status-ok-text font-bold px-2.5 py-0.5 rounded-full text-xs inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Hoạt động</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <button
                              type="button"
                              onClick={() => handleLockToggle(u)}
                              className={`min-h-[44px] px-3.5 py-2 rounded-2xl font-bold text-xs transition-colors inline-flex items-center gap-1.5 ${
                                isLocked
                                  ? "bg-status-ok-bg border border-status-ok-line text-status-ok-text hover:bg-status-ok-bg"
                                  : "bg-status-danger-bg border border-status-danger-line text-status-danger-text hover:bg-status-danger-bg"
                              }`}
                            >
                              {isLocked ? (
                                <>
                                  <Unlock className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>Mở khóa</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>Khóa tài khoản</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : activeTab === "risk" ? (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-theme-ink flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-status-danger-text" aria-hidden="true" />
            <span>Danh sách mẹ kích hoạt cảnh báo nguy cơ cao</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskUsers.length === 0 ? (
              <div className="md:col-span-2 text-center py-12 bg-theme-surface rounded-3xl border border-theme-line">
                <p className="text-sm text-theme-muted font-semibold">
                  Hiện không có tài khoản nào kích hoạt cảnh báo nguy cơ cao.
                </p>
              </div>
            ) : (
              riskUsers.map((r) => (
                <article
                  key={r.id || r.userId}
                  className="bg-theme-surface rounded-3xl p-5 sm:p-6 border border-status-danger-line shadow-sm space-y-2.5"
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs bg-status-danger-bg border border-status-danger-line text-status-danger-text font-bold px-3 py-1 rounded-full">
                      Nguy cơ cao
                    </span>
                    <span className="text-xs text-theme-muted font-medium">
                      {r.updatedAt || "Gần đây"}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-theme-ink">{r.fullName || r.email}</h3>
                  <p className="text-xs sm:text-sm text-theme-muted font-medium leading-relaxed">
                    Lý do: {r.alertReason || "Chỉ số đường huyết hoặc triệu chứng bất thường."}
                  </p>
                </article>
              ))
            )}
          </div>
        </section>
      ) : (
        <div className="space-y-5">
          <h2 className="text-lg font-bold text-theme-ink flex items-center gap-2">
            <FileText className="w-5 h-5 text-theme-brand" aria-hidden="true" />
            <span>Cấu hình quy tắc vận hành & đồng bộ dữ liệu dinh dưỡng</span>
          </h2>

          {/* USDA Sync */}
          <section className="bg-theme-surface rounded-3xl border border-theme-line p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-status-ok-bg border border-status-ok-line text-status-ok flex items-center justify-center">
                  <Database className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-theme-ink">
                    Đồng bộ dữ liệu dinh dưỡng quốc tế (USDA FoodData Central)
                  </h3>
                  <p className="text-xs text-theme-muted font-medium">
                    Tải tự động thông tin Năng lượng (Calo), Đạm, Tinh bột và Chất béo từ Bộ Nông nghiệp Hoa Kỳ.
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs bg-theme-page text-theme-ink font-bold px-3 py-1 rounded-full border border-theme-line">
                POST /api/admin/usda/sync
              </span>
            </div>

            <form onSubmit={handleUsdaSync} className="flex flex-wrap items-end gap-3 pt-1">
              <div className="flex-1 min-w-[200px] space-y-1.5">
                <label htmlFor="usda-query" className="block text-xs font-bold text-theme-ink">
                  Từ khóa thực phẩm (tiếng Anh)
                </label>
                <input
                  id="usda-query"
                  type="text"
                  required
                  placeholder="Ví dụ: milk, salmon, spinach..."
                  value={usdaQuery}
                  onChange={(e) => setUsdaQuery(e.target.value)}
                  className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl bg-theme-page/60 border border-theme-line text-sm font-semibold text-theme-ink placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-brand"
                />
              </div>
              <div className="w-28 space-y-1.5">
                <label htmlFor="usda-max" className="block text-xs font-bold text-theme-ink">
                  Số lượng tối đa
                </label>
                <input
                  id="usda-max"
                  type="number"
                  min="1"
                  max="50"
                  value={usdaMaxItems}
                  onChange={(e) => setUsdaMaxItems(e.target.value)}
                  className="w-full min-h-[48px] px-3 py-2.5 rounded-2xl bg-theme-page/60 border border-theme-line text-sm font-bold text-theme-ink text-center focus:outline-none focus:ring-2 focus:ring-theme-brand"
                />
              </div>
              <button
                type="submit"
                disabled={usdaLoading}
                className="min-h-[48px] px-5 py-2.5 bg-status-ok hover:bg-status-ok-text text-theme-surface font-bold text-xs sm:text-sm rounded-2xl transition-colors inline-flex items-center gap-2 disabled:bg-theme-line disabled:text-theme-muted"
              >
                <RefreshCw
                  className={`w-4 h-4 ${usdaLoading ? "animate-spin motion-reduce:animate-none" : ""}`}
                  aria-hidden="true"
                />
                <span>{usdaLoading ? "Đang đồng bộ..." : "Đồng bộ dữ liệu"}</span>
              </button>
            </form>
          </section>

          {/* Business Rules */}
          <section className="bg-theme-surface rounded-3xl p-6 border border-theme-line space-y-4 shadow-sm">
            <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-theme-line">
              <div>
                <h3 className="font-bold text-base text-theme-ink">
                  Danh sách tham số ngưỡng cảnh báo (Business Rules)
                </h3>
                <p className="text-xs text-theme-muted font-medium">
                  Quản lý điều kiện kích hoạt cảnh báo tự động cho EPDS và sinh hiệu.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateRule}
                className="min-h-[44px] px-4 py-2 bg-theme-brand-soft border border-theme-brand/25 text-theme-ink hover:bg-theme-brand hover:text-theme-surface font-bold text-xs sm:text-sm rounded-2xl transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Thêm quy tắc mới</span>
              </button>
            </div>

            {businessRules.length === 0 ? (
              <p className="text-sm text-theme-muted font-medium py-4">
                Chưa có quy tắc nào được định nghĩa trong hệ thống.
              </p>
            ) : (
              <div className="space-y-3">
                {businessRules.map((rule) => (
                  <article
                    key={rule.id}
                    className="p-4 rounded-2xl border border-theme-line bg-theme-page/50 flex flex-wrap justify-between items-center gap-4 hover:border-theme-brand/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-extrabold bg-theme-surface border border-theme-line px-2.5 py-0.5 rounded-md text-theme-ink">
                          {rule.code || rule.ruleName || "BR"}
                        </span>
                        <h4 className="font-bold text-sm text-theme-ink">
                          {rule.title || rule.name}
                        </h4>
                      </div>
                      <p className="text-xs text-theme-muted leading-relaxed">
                        {rule.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-xs font-bold text-theme-ink bg-theme-brand-soft px-3 py-1.5 rounded-full border border-theme-brand/20">
                        Ngưỡng: {rule.operator || ">="} {rule.thresholdValue ?? rule.value ?? 9}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenEditRule(rule)}
                        aria-label={`Chỉnh sửa quy tắc ${rule.code || rule.ruleName || ""}`}
                        className="w-11 h-11 inline-flex items-center justify-center text-theme-ink bg-theme-surface border border-theme-line hover:bg-theme-brand-soft rounded-2xl transition-colors"
                      >
                        <Edit className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Modal Edit/Create Rule */}
      {showRuleModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-rule-modal-title"
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <div className="bg-theme-surface rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-theme-line">
            <div className="flex items-center justify-between gap-3">
              <h3 id="admin-rule-modal-title" className="font-bold text-base text-theme-ink flex items-center gap-2">
                <Settings className="w-5 h-5 text-theme-brand" aria-hidden="true" />
                <span>
                  {editingRule
                    ? `Điều chỉnh quy tắc ${editingRule.code || editingRule.ruleName || ""}`
                    : "Tạo quy tắc hệ thống mới"}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setShowRuleModal(false)}
                aria-label="Đóng hộp thoại"
                className="w-10 h-10 inline-flex items-center justify-center rounded-full text-theme-muted hover:bg-theme-page"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={handleRuleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="rule-code" className="text-xs font-bold text-theme-ink block">
                  Mã quy tắc
                </label>
                <input
                  id="rule-code"
                  type="text"
                  required
                  placeholder="Ví dụ: BR05_EPDS"
                  value={ruleForm.code}
                  onChange={(e) => setRuleForm({ ...ruleForm, code: e.target.value })}
                  className="w-full min-h-[48px] p-3 rounded-2xl border border-theme-line bg-theme-page/60 text-sm font-semibold text-theme-ink focus:outline-none focus:ring-2 focus:ring-theme-brand"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="rule-title" className="text-xs font-bold text-theme-ink block">
                  Tên quy tắc
                </label>
                <input
                  id="rule-title"
                  type="text"
                  required
                  placeholder="Ví dụ: Ngưỡng cảnh báo trầm cảm EPDS"
                  value={ruleForm.title}
                  onChange={(e) => setRuleForm({ ...ruleForm, title: e.target.value })}
                  className="w-full min-h-[48px] p-3 rounded-2xl border border-theme-line bg-theme-page/60 text-sm font-semibold text-theme-ink focus:outline-none focus:ring-2 focus:ring-theme-brand"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="rule-op" className="text-xs font-bold text-theme-ink block">
                    Toán tử
                  </label>
                  <select
                    id="rule-op"
                    value={ruleForm.operator}
                    onChange={(e) => setRuleForm({ ...ruleForm, operator: e.target.value })}
                    className="w-full min-h-[48px] p-3 rounded-2xl border border-theme-line bg-theme-page/60 text-sm font-bold text-theme-ink focus:outline-none focus:ring-2 focus:ring-theme-brand"
                  >
                    <option value=">=">&gt;= (Lớn hơn / bằng)</option>
                    <option value=">">&gt; (Lớn hơn)</option>
                    <option value="<=">&lt;= (Nhỏ hơn / bằng)</option>
                    <option value="<">&lt; (Nhỏ hơn)</option>
                    <option value="==">== (Bằng)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="rule-threshold" className="text-xs font-bold text-theme-ink block">
                    Giá trị ngưỡng
                  </label>
                  <input
                    id="rule-threshold"
                    type="number"
                    step="any"
                    required
                    value={ruleForm.thresholdValue}
                    onChange={(e) =>
                      setRuleForm({ ...ruleForm, thresholdValue: parseFloat(e.target.value) })
                    }
                    className="w-full min-h-[48px] p-3 rounded-2xl border border-theme-line bg-theme-page/60 text-sm font-extrabold text-theme-ink focus:outline-none focus:ring-2 focus:ring-theme-brand"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="rule-desc" className="text-xs font-bold text-theme-ink block">
                  Mô tả quy tắc
                </label>
                <textarea
                  id="rule-desc"
                  rows={2}
                  value={ruleForm.description}
                  onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                  className="w-full p-3 rounded-2xl border border-theme-line bg-theme-page/60 text-sm font-medium text-theme-ink focus:outline-none focus:ring-2 focus:ring-theme-brand"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="flex-1 min-h-[44px] py-2.5 bg-theme-page border border-theme-line hover:bg-theme-brand-soft text-theme-ink font-bold text-xs sm:text-sm rounded-2xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] py-2.5 bg-theme-brand hover:bg-theme-ink text-theme-surface font-bold text-xs sm:text-sm rounded-2xl transition-colors"
                >
                  Lưu quy tắc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Create Staff/Expert */}
      {showCreateModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-create-user-title"
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <div className="bg-theme-surface rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-theme-line">
            <div className="flex items-center justify-between gap-3">
              <h3 id="admin-create-user-title" className="font-bold text-base text-theme-ink flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-theme-brand" aria-hidden="true" />
                <span>Tạo tài khoản Nhân viên / Chuyên gia</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                aria-label="Đóng hộp thoại"
                className="w-10 h-10 inline-flex items-center justify-center rounded-full text-theme-muted hover:bg-theme-page"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="staff-fullname" className="text-xs font-bold text-theme-ink block">
                  Họ và tên
                </label>
                <input
                  id="staff-fullname"
                  type="text"
                  required
                  placeholder="Ví dụ: Bác sĩ Nguyễn Văn A"
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  className="w-full min-h-[48px] p-3 rounded-2xl border border-theme-line bg-theme-page/60 text-sm font-semibold text-theme-ink focus:outline-none focus:ring-2 focus:ring-theme-brand"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="staff-email" className="text-xs font-bold text-theme-ink block">
                  Email đăng nhập
                </label>
                <input
                  id="staff-email"
                  type="email"
                  required
                  placeholder="expert@momoi.vn"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full min-h-[48px] p-3 rounded-2xl border border-theme-line bg-theme-page/60 text-sm font-semibold text-theme-ink focus:outline-none focus:ring-2 focus:ring-theme-brand"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="staff-password" className="text-xs font-bold text-theme-ink block">
                  Mật khẩu khởi tạo
                </label>
                <input
                  id="staff-password"
                  type="password"
                  required
                  placeholder="Nhập mật khẩu an toàn"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full min-h-[48px] p-3 rounded-2xl border border-theme-line bg-theme-page/60 text-sm font-semibold text-theme-ink focus:outline-none focus:ring-2 focus:ring-theme-brand"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="staff-role" className="text-xs font-bold text-theme-ink block">
                  Vai trò chuyên môn
                </label>
                <select
                  id="staff-role"
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full min-h-[48px] p-3 rounded-2xl border border-theme-line bg-theme-page/60 text-sm font-semibold text-theme-ink focus:outline-none focus:ring-2 focus:ring-theme-brand"
                >
                  <option value="Staff">Care Staff (Nhân viên chăm sóc)</option>
                  <option value="Expert">Medical Expert (Chuyên gia y tế / Dinh dưỡng)</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="min-h-[44px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold text-theme-ink bg-theme-page border border-theme-line hover:bg-theme-brand-soft"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 bg-theme-brand hover:bg-theme-ink text-theme-surface rounded-2xl text-xs sm:text-sm font-bold"
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
