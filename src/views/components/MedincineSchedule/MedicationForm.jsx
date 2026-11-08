import React, { useState } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import medicationService from "../../../models/services/medicationService";

const frequencies = ["Hàng ngày", "Hàng tuần", "Hai lần một ngày", "Tùy chỉnh"];

const MedicationForm = ({ onAdd }) => {
  const [form, setForm] = useState({
    medName: "",
    dosage: "",
    frequency: "Hàng ngày",
    time: "09:00",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.medName.trim() || !form.dosage.trim()) {
      toast.error("Vui lòng nhập tên thuốc và liều lượng.");
      return;
    }

    const newMed = {
      medName: form.medName.trim(),
      dosage: form.dosage.trim(),
      times: [form.time],
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      notes: form.notes,
    };

    setSaving(true);
    try {
      const res = await medicationService.addMedication(newMed);
      onAdd(res);
      setForm({ medName: "", dosage: "", frequency: "Hàng ngày", time: "09:00", notes: "" });
      toast.success("Đã thêm lịch uống thuốc mới.");
    } catch (err) {
      console.error("Error adding medication:", err);
      toast.error("Không thể thêm thuốc mới.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm space-y-4"
    >
      <div className="pb-3 border-b border-theme-line">
        <h2 className="text-lg font-bold text-theme-ink">Thêm lịch uống thuốc mới</h2>
        <p className="text-xs text-theme-muted font-medium mt-0.5">
          Luôn tham khảo ý kiến bác sĩ trước khi dùng bất kỳ loại thuốc nào trong thai kỳ và giai đoạn cho con bú.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="med-name" className="block text-xs font-bold text-theme-ink">
          Tên thuốc hoặc vitamin
        </label>
        <input
          id="med-name"
          name="medName"
          placeholder="Ví dụ: Sắt hữu cơ, Canxi..."
          className="w-full min-h-[48px] rounded-2xl border border-theme-line bg-theme-page/60 px-4 py-3 text-sm font-semibold text-theme-ink placeholder:text-theme-muted focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/30"
          value={form.medName}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <label htmlFor="med-dosage" className="block text-xs font-bold text-theme-ink">
            Liều lượng
          </label>
          <input
            id="med-dosage"
            name="dosage"
            placeholder="Ví dụ: 1 viên (500mg)"
            className="w-full min-h-[48px] rounded-2xl border border-theme-line bg-theme-page/60 px-4 py-3 text-sm font-semibold text-theme-ink placeholder:text-theme-muted focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/30"
            value={form.dosage}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="med-frequency" className="block text-xs font-bold text-theme-ink">
            Tần suất
          </label>
          <select
            id="med-frequency"
            name="frequency"
            className="w-full min-h-[48px] rounded-2xl border border-theme-line bg-theme-page/60 px-4 py-3 text-sm font-semibold text-theme-ink focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/30"
            value={form.frequency}
            onChange={handleChange}
          >
            {frequencies.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="med-time" className="block text-xs font-bold text-theme-ink">
          Giờ uống thuốc
        </label>
        <input
          id="med-time"
          name="time"
          type="time"
          className="w-full min-h-[48px] rounded-2xl border border-theme-line bg-theme-page/60 px-4 py-3 text-sm font-semibold text-theme-ink focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/30"
          value={form.time}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="med-notes" className="block text-xs font-bold text-theme-ink">
          Ghi chú (không bắt buộc)
        </label>
        <textarea
          id="med-notes"
          name="notes"
          rows={3}
          placeholder="Ví dụ: Uống sau bữa sáng 30 phút, không uống chung với sữa..."
          className="w-full rounded-2xl border border-theme-line bg-theme-page/60 px-4 py-3 text-sm font-medium text-theme-ink placeholder:text-theme-muted focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/30"
          value={form.notes}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold bg-theme-brand text-theme-surface hover:bg-theme-ink transition-colors disabled:bg-theme-line disabled:text-theme-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>{saving ? "Đang lưu..." : "Lưu lịch thuốc"}</span>
        </button>
        <button
          type="button"
          onClick={() =>
            setForm({ medName: "", dosage: "", frequency: "Hàng ngày", time: "09:00", notes: "" })
          }
          className="min-h-[48px] inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold bg-theme-page border border-theme-line text-theme-ink hover:bg-theme-brand-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
        >
          Đặt lại
        </button>
      </div>
    </form>
  );
};

export default MedicationForm;
