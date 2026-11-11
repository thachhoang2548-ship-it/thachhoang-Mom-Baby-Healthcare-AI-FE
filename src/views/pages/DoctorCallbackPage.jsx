import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Crown,
  Loader2,
  Phone,
  PhoneIncoming,
  QrCode,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAuthController } from "../../controllers/authController";
import { checkTierUnlocked } from "../../utils/tierHelpers";
import { ADVISOR_DOCTOR, EMERGENCY_NUMBER } from "../../config/advisor";
import doctorCallbackService, {
  CALLBACK_FEE,
  CALLBACK_STATUS_META,
} from "../../models/services/doctorCallbackService";
import { getPaymentStatus } from "../../models/services/paymentService";
import symptomService from "../../models/services/symptomService";

const URGENCY_VI = { Low: "Thấp", Medium: "Trung bình", High: "Cao", Critical: "Khẩn cấp" };

const formatMoney = (amount) => `${Number(amount || 0).toLocaleString("vi-VN")}đ`;
const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })
    : "";
const errorMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback;
const isCompleted = (status) => status === 1 || status === "Completed";
const isFailed = (status) => status === 2 || status === "Failed";

const TIME_OPTIONS = ["Càng sớm càng tốt", "Buổi sáng (8h–11h)", "Buổi chiều (13h–17h)", "Buổi tối (19h–21h)"];

/** Mã VietQR thu phí 5.000đ cho một cuộc tư vấn đã hoàn tất; tự kiểm tra mỗi 4 giây. */
function FeePaymentPanel({ callbackId, onPaid, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const paidRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    doctorCallbackService
      .createFeePayment(callbackId)
      .then((data) => !cancelled && setOrder(data))
      .catch((err) => !cancelled && setError(errorMessage(err, "Không tạo được mã thanh toán.")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [callbackId]);

  const check = useCallback(
    async (silent) => {
      if (!order?.orderCode || paidRef.current) return;
      if (!silent) setChecking(true);
      try {
        const status = await getPaymentStatus(order.orderCode);
        if (isCompleted(status.status)) {
          paidRef.current = true;
          toast.success("Đã nhận phí tư vấn. Cảm ơn mẹ!");
          onPaid();
        } else if (isFailed(status.status)) {
          setError(status.failureReason || "Giao dịch không thành công.");
        } else if (!silent) {
          toast("Chưa ghi nhận chuyển khoản. Mẹ đợi thêm một lát nhé.");
        }
      } catch (err) {
        if (!silent) toast.error(errorMessage(err, "Không kiểm tra được thanh toán."));
      } finally {
        if (!silent) setChecking(false);
      }
    },
    [order?.orderCode, onPaid]
  );

  useEffect(() => {
    if (!order?.orderCode) return undefined;
    const timer = setInterval(() => check(true), 4000);
    return () => clearInterval(timer);
  }, [order?.orderCode, check]);

  const copy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(String(text));
      toast.success(`Đã sao chép ${label}`);
    } catch {
      toast.error("Không sao chép được.");
    }
  };

  return (
    <div className="mt-3 space-y-4 rounded-2xl border border-theme-line bg-theme-page/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-theme-ink">Thanh toán phí tư vấn {formatMoney(CALLBACK_FEE)}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng thanh toán"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-theme-muted hover:bg-theme-surface"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-theme-brand motion-reduce:animate-none" aria-label="Đang tạo mã" />
        </div>
      ) : error && !order ? (
        <p className="text-sm font-semibold text-status-danger-text">{error}</p>
      ) : (
        <div className="grid items-center gap-4 sm:grid-cols-2">
          <div className="mx-auto w-full max-w-[220px] rounded-2xl border-2 border-theme-line bg-white p-3">
            {order?.qrUrl ? (
              <img src={order.qrUrl} alt="Mã VietQR thanh toán phí tư vấn" className="aspect-square w-full object-contain" />
            ) : (
              <QrCode className="mx-auto h-16 w-16 text-theme-muted" />
            )}
          </div>
          <div className="space-y-2 text-sm">
            {[
              ["Ngân hàng", order?.bankInfo?.bankShortName || order?.bankInfo?.bankName],
              ["Số tài khoản", order?.bankInfo?.accountNumber],
              ["Chủ tài khoản", order?.bankInfo?.accountName],
              ["Số tiền", formatMoney(order?.amount)],
              ["Nội dung", order?.transferMemo],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-2 rounded-xl border border-theme-line bg-theme-surface px-3 py-2">
                <div className="min-w-0">
                  <span className="block text-xs text-theme-muted">{label}</span>
                  <span className="break-words font-bold text-theme-ink">{value || "—"}</span>
                </div>
                {value && (
                  <button
                    type="button"
                    onClick={() => copy(label === "Số tiền" ? order.amount : value, label)}
                    aria-label={`Sao chép ${label}`}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-theme-line hover:bg-theme-brand-soft"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {order && (
        <>
          <p className="flex items-start gap-2 text-xs font-medium text-status-warn-text">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            Giữ nguyên nội dung chuyển khoản để hệ thống tự xác nhận.
          </p>
          {error && <p className="text-xs font-semibold text-status-danger-text">{error}</p>}
          <button
            type="button"
            onClick={() => check(false)}
            disabled={checking}
            className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-theme-brand px-5 text-sm font-bold text-theme-surface hover:bg-theme-ink disabled:bg-theme-line disabled:text-theme-muted"
          >
            {checking ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <CheckCircle2 className="h-4 w-4" />}
            <span>Tôi đã chuyển khoản</span>
          </button>
        </>
      )}
    </div>
  );
}

export default function DoctorCallbackPage() {
  const location = useLocation();
  const { user, tier } = useAuthController();
  const isVip = checkTierUnlocked(tier, "SuperMomVip");

  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [concern, setConcern] = useState((location.state?.concern || "").slice(0, 1000));
  const [preferredTime, setPreferredTime] = useState(TIME_OPTIONS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [symptomLogId, setSymptomLogId] = useState(location.state?.symptomLogId || null);
  const [recentSymptoms, setRecentSymptoms] = useState([]);

  // Các lần kiểm tra triệu chứng gần đây để mẹ đính kèm (bác sĩ sẽ xem ảnh và kết quả AI).
  useEffect(() => {
    if (!isVip) return;
    let cancelled = false;
    symptomService
      .fetchHistory()
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res?.data) ? res.data : [];
        setRecentSymptoms(
          [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isVip]);

  const loadRequests = useCallback(async () => {
    try {
      setRequests(await doctorCallbackService.getMine());
    } catch (err) {
      toast.error(errorMessage(err, "Không tải được danh sách yêu cầu."));
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const pending = requests.find((r) => r.status === "Pending");
  const unpaid = requests.find((r) => r.feeDue);
  const blockedReason = pending
    ? "Mẹ đang có một yêu cầu chờ bác sĩ gọi."
    : unpaid
    ? "Mẹ vui lòng thanh toán phí cuộc tư vấn trước để gửi yêu cầu mới."
    : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (concern.trim().length < 10) {
      toast.error("Mẹ mô tả thêm một chút (ít nhất 10 ký tự) nhé.");
      return;
    }
    setSubmitting(true);
    try {
      await doctorCallbackService.create({ contactPhone: phone, concern: concern.trim(), preferredTime, symptomLogId });
      toast.success("Đã gửi yêu cầu. Bác sĩ sẽ gọi lại cho mẹ sớm nhất có thể.");
      setConcern("");
      setSymptomLogId(null);
      await loadRequests();
    } catch (err) {
      toast.error(errorMessage(err, "Không gửi được yêu cầu. Mẹ thử lại nhé."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Mẹ muốn huỷ yêu cầu gọi lại này?")) return;
    try {
      await doctorCallbackService.cancel(id);
      toast.success("Đã huỷ yêu cầu.");
      await loadRequests();
    } catch (err) {
      toast.error(errorMessage(err, "Không huỷ được yêu cầu."));
    }
  };

  const handlePaid = useCallback(() => {
    setPayingId(null);
    loadRequests();
  }, [loadRequests]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10 font-display text-theme-ink">
      <header className="space-y-2 border-b border-theme-line pb-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-theme-brand-soft px-3.5 py-1 text-xs font-semibold text-theme-ink">
          <Crown className="h-3.5 w-3.5 text-theme-brand" />
          Đặc quyền Super Mom VIP
        </span>
        <h1 className="text-2xl font-bold sm:text-3xl">Bác sĩ gọi lại tư vấn</h1>
        <p className="text-sm text-theme-muted sm:text-base">
          Mẹ để lại số điện thoại và điều muốn hỏi, {ADVISOR_DOCTOR.displayName} sẽ gọi lại cho mẹ.
        </p>
      </header>

      <ol className="grid gap-3 sm:grid-cols-3">
        {[
          ["1", "Gửi yêu cầu", "Số điện thoại và điều mẹ muốn hỏi."],
          ["2", "Bác sĩ gọi lại", "Mẹ để ý điện thoại vào khung giờ đã chọn."],
          ["3", `Chỉ ${formatMoney(CALLBACK_FEE)}/cuộc`, "Chỉ tính khi bác sĩ tư vấn thành công. Gọi không được thì không mất phí."],
        ].map(([step, title, body]) => (
          <li key={step} className="rounded-2xl border border-theme-line bg-theme-surface p-4">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-theme-brand text-xs font-bold text-theme-surface">
              {step}
            </span>
            <p className="mt-2 font-bold">{title}</p>
            <p className="mt-0.5 text-sm text-theme-muted">{body}</p>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-3 rounded-2xl border border-status-danger-line bg-status-danger-bg p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-status-danger-text">
          Mẹ hoặc bé có dấu hiệu nguy hiểm (khó thở, co giật, ra máu nhiều, sốt cao li bì)? Đừng chờ, gọi cấp cứu ngay.
        </p>
        <a
          href={`tel:${EMERGENCY_NUMBER}`}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-full bg-red-700 px-5 text-sm font-bold text-white hover:bg-red-800"
        >
          <Phone className="h-4 w-4" />
          Gọi {EMERGENCY_NUMBER}
        </a>
      </div>

      {isVip ? (
        <section className="space-y-5 rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm">
          <h2 className="text-lg font-bold">Gửi yêu cầu gọi lại</h2>

          {blockedReason ? (
            <p className="flex items-start gap-2 rounded-2xl border border-status-warn-line/50 bg-status-warn-bg p-4 text-sm font-semibold text-status-warn-text">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {blockedReason}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="callback-phone" className="mb-1.5 block text-sm font-semibold">
                  Số điện thoại của mẹ
                </label>
                <input
                  id="callback-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  maxLength={20}
                  placeholder="Ví dụ: 0912 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-theme-line bg-theme-page/50 px-4 py-3 text-base font-semibold focus:border-theme-brand focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <label htmlFor="callback-concern" className="text-sm font-semibold">
                    Mẹ muốn hỏi bác sĩ điều gì?
                  </label>
                  <span className="text-xs text-theme-muted">{concern.length}/1000</span>
                </div>
                <textarea
                  id="callback-concern"
                  rows={4}
                  maxLength={1000}
                  required
                  placeholder="Ví dụ: Bé 8 tháng sốt 38 độ từ tối qua, vẫn bú được. Mẹ muốn hỏi cách hạ sốt và khi nào cần đi khám."
                  value={concern}
                  onChange={(e) => setConcern(e.target.value)}
                  className="w-full rounded-2xl border border-theme-line bg-theme-page/50 p-4 text-sm leading-relaxed focus:border-theme-brand focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
                />
              </div>

              {recentSymptoms.length > 0 && (
                <fieldset>
                  <legend className="mb-1 text-sm font-semibold">Đính kèm kết quả kiểm tra triệu chứng</legend>
                  <p className="mb-2 text-xs text-theme-muted">
                    Bác sĩ sẽ xem ảnh mẹ đã chụp và kết quả AI trước khi gọi.
                  </p>
                  <div className="space-y-2">
                    {[{ id: null }, ...recentSymptoms].map((s) => {
                      const selected = (symptomLogId || null) === (s.id || null);
                      const image = s.imageUrl || s.images?.[0];
                      return (
                        <label
                          key={s.id ?? "none"}
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-colors ${
                            selected ? "border-theme-brand bg-theme-brand-soft/50" : "border-theme-line bg-theme-page/40 hover:bg-theme-brand-soft/30"
                          }`}
                        >
                          <input
                            type="radio"
                            name="attach-symptom"
                            checked={selected}
                            onChange={() => {
                              setSymptomLogId(s.id || null);
                              if (s.id && !concern.trim()) setConcern((s.textDescription || "").slice(0, 1000));
                            }}
                            className="h-4 w-4 accent-current text-theme-brand"
                          />
                          {s.id ? (
                            <>
                              {image ? (
                                <img src={image} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                              ) : (
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-theme-surface text-xs text-theme-muted">
                                  Không ảnh
                                </span>
                              )}
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-semibold">{s.textDescription}</span>
                                <span className="block text-xs text-theme-muted">
                                  {formatDateTime(s.createdAt)}
                                  {s.analysisResult?.urgencyLevel
                                    ? ` · Mức độ: ${URGENCY_VI[s.analysisResult.urgencyLevel] || s.analysisResult.urgencyLevel}`
                                    : ""}
                                </span>
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-semibold">Không đính kèm</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              <fieldset>
                <legend className="mb-1.5 text-sm font-semibold">Khung giờ mẹ tiện nghe máy</legend>
                <div className="flex flex-wrap gap-2">
                  {TIME_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={preferredTime === option}
                      onClick={() => setPreferredTime(option)}
                      className={`min-h-[40px] rounded-full border px-4 text-sm font-semibold transition-colors ${
                        preferredTime === option
                          ? "border-theme-brand bg-theme-brand text-theme-surface"
                          : "border-theme-line bg-theme-page/50 hover:bg-theme-brand-soft"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={submitting}
                className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-status-ok px-6 text-base font-bold text-theme-surface hover:bg-status-ok-text disabled:bg-theme-line disabled:text-theme-muted"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" /> : <PhoneIncoming className="h-5 w-5" />}
                <span>{submitting ? "Đang gửi..." : "Gửi yêu cầu bác sĩ gọi lại"}</span>
              </button>
              <p className="text-center text-xs text-theme-muted">
                Phí {formatMoney(CALLBACK_FEE)} chỉ tính sau khi bác sĩ tư vấn thành công. Mẹ thanh toán bằng VietQR ngay trên trang này.
              </p>
            </form>
          )}
        </section>
      ) : (
        <section className="space-y-3 rounded-3xl border border-theme-line bg-theme-surface p-6 text-center shadow-sm">
          <Crown className="mx-auto h-8 w-8 text-theme-brand" />
          <h2 className="text-lg font-bold">Tính năng dành cho hội viên Super Mom VIP</h2>
          <p className="mx-auto max-w-md text-sm text-theme-muted">
            Nâng cấp để được {ADVISOR_DOCTOR.displayName} gọi lại tư vấn trực tiếp. Phí {formatMoney(CALLBACK_FEE)}/cuộc, chỉ tính khi tư vấn thành công.
          </p>
          <Link
            to="/upgrade"
            state={{ targetTier: "SuperMomVip" }}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-theme-brand px-6 text-sm font-bold text-theme-surface hover:bg-theme-ink"
          >
            Xem gói Super Mom VIP
          </Link>
        </section>
      )}

      {(loadingList || requests.length > 0) && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">Yêu cầu của mẹ</h2>
          {loadingList ? (
            <p className="text-sm text-theme-muted">Đang tải...</p>
          ) : (
            <ul className="space-y-3">
              {requests.map((r) => {
                const meta = CALLBACK_STATUS_META[r.status] || CALLBACK_STATUS_META.Pending;
                return (
                  <li key={r.id} className="rounded-2xl border border-theme-line bg-theme-surface p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${meta.badge}`}>
                        {meta.label}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-theme-muted">
                        <Clock className="h-3.5 w-3.5" />
                        Gửi lúc {formatDateTime(r.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm">{r.concern}</p>
                    <p className="mt-1 text-xs text-theme-muted">
                      Gọi tới {r.contactPhone}
                      {r.preferredTime ? ` · ${r.preferredTime}` : ""}
                      {r.symptomLogId ? " · Có đính kèm kết quả kiểm tra triệu chứng" : ""}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {r.status === "Pending" && (
                        <button
                          type="button"
                          onClick={() => handleCancel(r.id)}
                          className="min-h-[40px] rounded-full border border-theme-line px-4 text-sm font-semibold hover:bg-theme-page"
                        >
                          Huỷ yêu cầu
                        </button>
                      )}
                      {r.feeDue && payingId !== r.id && (
                        <button
                          type="button"
                          onClick={() => setPayingId(r.id)}
                          className="inline-flex min-h-[40px] items-center gap-2 rounded-full bg-theme-brand px-4 text-sm font-bold text-theme-surface hover:bg-theme-ink"
                        >
                          <QrCode className="h-4 w-4" />
                          Thanh toán {formatMoney(r.fee)}
                        </button>
                      )}
                      {r.status === "Completed" && !r.feeDue && r.feePaidAt && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-status-ok-text">
                          <CheckCircle2 className="h-4 w-4" />
                          Đã thanh toán {formatMoney(r.fee)}
                        </span>
                      )}
                      {(r.status === "Unreachable" || r.status === "Cancelled") && (
                        <span className="text-xs text-theme-muted">Không tính phí.</span>
                      )}
                    </div>

                    {payingId === r.id && (
                      <FeePaymentPanel callbackId={r.id} onPaid={handlePaid} onClose={() => setPayingId(null)} />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
