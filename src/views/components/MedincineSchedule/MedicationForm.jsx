import React, { useState } from "react";
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.medName || !form.dosage) return alert("Vui lòng điền đầy đủ các thông tin bắt buộc.");

    const newMed = {
      medName: form.medName,
      dosage: form.dosage,
      times: [form.time],
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      notes: form.notes,
    };

    try {
      const res = await medicationService.addMedication(newMed);
      onAdd(res);
      setForm({ medName: "", dosage: "", frequency: "Hàng ngày", time: "09:00", notes: "" });
    } catch (err) {
      console.error("Error adding medication:", err);
      alert("Không thể thêm thuốc mới.");
    }
  };

  return (
    <div className="rounded-xl border border-[#e6e3db] dark:border-primary/20 bg-white dark:bg-background-dark shadow-sm">
      <h2 className="text-[#181611] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-6 pt-5 pb-3">
        Thêm lịch uống thuốc mới
      </h2>
      <div className="flex flex-col gap-4 p-6 pt-2">
        <label className="flex flex-col">
          <p className="text-[#181611] dark:text-white/90 text-sm font-medium leading-normal pb-2">Tên thuốc</p>
          <input
            name="medName"
            placeholder="Ví dụ: Paracetamol"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181611] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#e6e3db] dark:border-primary/20 bg-background-light dark:bg-background-dark focus:border-primary h-12 placeholder:text-[#8a8060] dark:placeholder:text-white/50 px-4 text-base font-normal leading-normal"
            value={form.medName}
            onChange={handleChange}
          />
        </label>

        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex flex-col flex-1">
            <p className="text-[#181611] dark:text-white/90 text-sm font-medium leading-normal pb-2">Liều lượng</p>
            <input
              name="dosage"
              placeholder="Ví dụ: 500mg"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181611] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#e6e3db] dark:border-primary/20 bg-background-light dark:bg-background-dark focus:border-primary h-12 placeholder:text-[#8a8060] dark:placeholder:text-white/50 px-4 text-base font-normal leading-normal"
              value={form.dosage}
              onChange={handleChange}
            />
          </label>

          <label className="flex flex-col flex-1">
            <p className="text-[#181611] dark:text-white/90 text-sm font-medium leading-normal pb-2">Tần suất</p>
            <select
              name="frequency"
              className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181611] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#e6e3db] dark:border-primary/20 bg-background-light dark:bg-background-dark focus:border-primary h-12 px-4 text-base font-normal leading-normal"
              value={form.frequency}
              onChange={handleChange}
            >
              {frequencies.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col">
          <p className="text-[#181611] dark:text-white/90 text-sm font-medium leading-normal pb-2">Giờ uống thuốc</p>
          <input
            name="time"
            type="time"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181611] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#e6e3db] dark:border-primary/20 bg-background-light dark:bg-background-dark focus:border-primary h-12 placeholder:text-[#8a8060] dark:placeholder:text-white/50 px-4 text-base font-normal leading-normal"
            value={form.time}
            onChange={handleChange}
          />
        </label>

        <label className="flex flex-col">
          <p className="text-[#181611] dark:text-white/90 text-sm font-medium leading-normal pb-2">Ghi chú (Không bắt buộc)</p>
          <textarea
            name="notes"
            placeholder="Ví dụ: Uống sau khi ăn"
            className="form-textarea flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-lg text-[#181611] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#e6e3db] dark:border-primary/20 bg-background-light dark:bg-background-dark focus:border-primary min-h-24 placeholder:text-[#8a8060] dark:placeholder:text-white/50 p-4 text-base font-normal leading-normal"
            value={form.notes}
            onChange={handleChange}
          />
        </label>

        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={handleSubmit}
            className="flex-1 flex items-center justify-center whitespace-nowrap rounded-lg h-12 px-6 text-base font-bold bg-primary text-black hover:brightness-95"
          >
            Lưu lịch uống thuốc
          </button>
          <button
            type="button"
            onClick={() => setForm({ medName: "", dosage: "", frequency: "Hàng ngày", time: "09:00", notes: "" })}
            className="flex-1 flex items-center justify-center whitespace-nowrap rounded-lg h-12 px-6 text-base font-bold bg-[#f5f3f0] dark:bg-primary/20 text-[#181611] dark:text-white hover:bg-black/10 dark:hover:bg-primary/30"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicationForm;
