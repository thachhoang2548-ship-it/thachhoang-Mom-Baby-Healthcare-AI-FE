import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, Clock, Loader2, Phone, PhoneOff, RefreshCw } from "lucide-react";
import doctorCallbackService, {
  CALLBACK_FEE,
  CALLBACK_STATUS_META,
} from "../../../models/services/doctorCallbackService";

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })
    : "";
const errorMessage = (error, fallback) => error?.response?.data?.message || fallback;

/**
 * Hàng đợi "bác sĩ gọi lại" cho bác sĩ / chuyên gia.
 * Bác sĩ bấm số để gọi từ điện thoại của mình, rồi đánh dấu kết quả:
 * "Đã tư vấn xong" phát sinh phí 5.000đ cho mẹ; "Không liên lạc được" không tính phí.
 */
export default function DoctorCallbackQueue({ onPendingCountChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [notes, setNotes] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await doctorCallbackService.getQueue();
      setItems(data);
      onPendingCountChange?.(data.filter((i) => i.status === "Pending").length);
    } catch (err) {
      toast.error(errorMessage(err, "Không tải được danh sách yêu cầu gọi lại."));
    } finally {
      setLoading(false);
    }
  }, [onPendingCountChange]);

  useEffect(() => {
    load();
  }, [load]);

  const resolve = async (item, outcome) => {
    const confirmText =
      outcome === "complete"
        ? `Xác nhận đã tư vấn xong cho ${item.momName}? Mẹ sẽ được tính phí ${CALLBACK_FEE.toLocaleString("vi-VN")}đ.`
        : `Đánh dấu không liên lạc được với ${item.momName}? Mẹ không bị tính phí.`;
    if (!window.confirm(confirmText)) return;

    setBusyId(item.id);
    try {
      const note = notes[item.id] || "";
      if (outcome === "complete") await doctorCallbackService.complete(item.id, note);
      else await doctorCallbackService.markUnreachable(item.id, note);
      toast.success(outcome === "complete" ? "Đã ghi nhận cuộc tư vấn." : "Đã ghi nhận không liên lạc được.");
      await load();
    } catch (err) {
      toast.error(errorMessage(err, "Không cập nhật được yêu cầu."));
    } finally {
      setBusyId(null);
    }
  };

  const pending = items.filter((i) => i.status === "Pending");
  const handled = items.filter((i) => i.status !== "Pending");

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-theme-ink">
          <Phone className="h-5 w-5 text-theme-brand" aria-hidden="true" />
          <span>Mẹ đang chờ bác sĩ gọi lại ({pending.length})</span>
        </h2>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-2xl border border-theme-line bg-theme-surface px-4 text-sm font-bold hover:bg-theme-brand-soft disabled:text-theme-muted"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin motion-reduce:animate-none" : ""}`} aria-hidden="true" />
          Tải lại
        </button>
      </div>

      {loading && items.length === 0 ? (
        <div className="rounded-3xl border border-theme-line bg-theme-surface py-12 text-center text-sm font-semibold text-theme-muted">
          Đang tải...
        </div>
      ) : pending.length === 0 ? (
        <div className="rounded-3xl border border-theme-line bg-theme-surface py-12 text-center text-sm font-semibold text-theme-muted">
          Chưa có mẹ nào đang chờ gọi lại.
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {pending.map((item) => (
            <li key={item.id} className="space-y-3 rounded-3xl border border-theme-line bg-theme-surface p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-base font-bold text-theme-ink">{item.momName}</p>
                  <p className="inline-flex items-center gap-1 text-xs text-theme-muted">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    Gửi lúc {formatDateTime(item.createdAt)}
                    {item.preferredTime ? ` · Tiện nghe: ${item.preferredTime}` : ""}
                  </p>
                </div>
                <a
                  href={`tel:${item.contactPhone}`}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-status-ok px-4 text-sm font-bold text-theme-surface hover:bg-status-ok-text"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {item.contactPhone}
                </a>
              </div>

              <p className="whitespace-pre-line rounded-2xl bg-theme-page p-3 text-sm leading-relaxed text-theme-ink">
                {item.concern}
              </p>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-theme-muted">Ghi chú sau cuộc gọi (chỉ bác sĩ thấy)</span>
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={notes[item.id] || ""}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  className="w-full rounded-2xl border border-theme-line bg-theme-page/50 p-3 text-sm focus:border-theme-brand focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => resolve(item, "complete")}
                  disabled={busyId === item.id}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-theme-brand px-4 text-sm font-bold text-theme-surface hover:bg-theme-ink disabled:bg-theme-line disabled:text-theme-muted"
                >
                  {busyId === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  )}
                  Đã tư vấn xong
                </button>
                <button
                  type="button"
                  onClick={() => resolve(item, "unreachable")}
                  disabled={busyId === item.id}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-theme-line px-4 text-sm font-bold text-theme-ink hover:bg-theme-page disabled:text-theme-muted"
                >
                  <PhoneOff className="h-4 w-4" aria-hidden="true" />
                  Không liên lạc được
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {handled.length > 0 && (
        <div className="overflow-x-auto rounded-3xl border border-theme-line bg-theme-surface shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-theme-page text-theme-muted">
              <tr>
                <th className="px-4 py-3">Mẹ</th>
                <th className="px-4 py-3">Kết quả</th>
                <th className="px-4 py-3">Phí</th>
                <th className="px-4 py-3">Xử lý lúc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-line">
              {handled.map((item) => {
                const meta = CALLBACK_STATUS_META[item.status] || CALLBACK_STATUS_META.Pending;
                return (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-semibold text-theme-ink">{item.momName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${meta.badge}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-theme-ink">
                      {item.fee > 0
                        ? `${Number(item.fee).toLocaleString("vi-VN")}đ · ${item.feePaidAt ? "đã trả" : "chưa trả"}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-theme-muted">{formatDateTime(item.handledAt)}</td>
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
