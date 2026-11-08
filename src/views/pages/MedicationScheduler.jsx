import React, { useEffect, useState, useCallback } from "react";
import { Pill } from "lucide-react";
import toast from "react-hot-toast";
import MedicationForm from "../components/MedincineSchedule/MedicationForm";
import MedicationList from "../components/MedincineSchedule/MedicationList";
import NextDoseCard from "../components/MedincineSchedule/NextDoseCard";
import medicationService from "../../models/services/medicationService";

const MedicationScheduler = () => {
  const [medications, setMedications] = useState([]);
  const [nextDose, setNextDose] = useState(null);

  const updateNextDose = useCallback((meds) => {
    if (!meds || meds.length === 0) return setNextDose(null);

    const now = new Date();
    const upcoming = meds
      .filter((m) => !m.status || m.status === "pending")
      .flatMap((m) =>
        (m.times || []).map((time) => ({
          ...m,
          doseTime: new Date(`${now.toISOString().slice(0, 10)}T${time}:00`),
        }))
      )
      .filter((m) => m.doseTime > now)
      .sort((a, b) => a.doseTime - b.doseTime);

    if (!upcoming.length) return setNextDose(null);

    const next = upcoming[0];
    const diff = next.doseTime - now;
    const hours = String(Math.floor(diff / 3600000)).padStart(2, "0");
    const mins = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
    const secs = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
    setNextDose({ ...next, time: `${hours}:${mins}:${secs}` });
  }, []);

  useEffect(() => {
    let active = true;
    medicationService
      .getMedications()
      .then((res) => {
        if (!active) return;
        const meds = res || [];
        setMedications(meds);
        updateNextDose(meds);
      })
      .catch((err) => {
        console.error("Error fetching meds:", err);
      });
    return () => {
      active = false;
    };
  }, [updateNextDose]);

  useEffect(() => {
    const timer = setInterval(() => updateNextDose(medications), 1000);
    return () => clearInterval(timer);
  }, [medications, updateNextDose]);

  const handleAdd = (med) => {
    const updated = [...medications, med];
    setMedications(updated);
    updateNextDose(updated);
  };

  const handleUpdate = (id, status) => {
    const updated = medications.map((m) => (m._id === id ? { ...m, status } : m));
    setMedications(updated);
    updateNextDose(updated);
  };

  const handleDelete = async (id) => {
    try {
      await medicationService.deleteMedication(id);
      const updated = medications.filter((m) => m._id !== id);
      setMedications(updated);
      updateNextDose(updated);
      toast.success("Đã xóa lịch thuốc.");
    } catch (err) {
      console.error("Error deleting medication:", err);
      toast.error("Không thể xóa lịch thuốc.");
    }
  };

  return (
    <div className="font-display max-w-6xl mx-auto space-y-6 pb-24 text-theme-ink">
      <header className="bg-theme-surface rounded-3xl border border-theme-line p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-theme-brand-soft text-theme-ink px-3.5 py-1.5 text-xs font-bold border border-theme-brand/20">
          <Pill className="w-4 h-4 text-theme-brand" aria-hidden="true" />
          <span>Vitamin & thuốc theo chỉ định</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-theme-ink mt-3">
          Lịch uống thuốc & vi chất
        </h1>
        <p className="text-sm sm:text-base text-theme-muted font-medium mt-1.5 max-w-2xl leading-relaxed">
          Quản lý lịch uống sắt, canxi, axit folic hoặc thuốc theo toa bác sĩ để mẹ luôn đúng giờ mỗi ngày.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <MedicationForm onAdd={handleAdd} />
        </div>

        <section className="lg:col-span-7 bg-theme-surface rounded-3xl border border-theme-line p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-theme-line">
            <div>
              <h2 className="text-lg font-bold text-theme-ink">Lịch trình hôm nay</h2>
              <p className="text-xs text-theme-muted font-medium">Đánh dấu đã uống để hệ thống cập nhật cữ kế tiếp</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-theme-page border border-theme-line px-3 py-1 text-xs font-bold text-theme-ink">
              {medications.length} loại
            </span>
          </div>

          <MedicationList
            medications={medications}
            onUpdateAdherence={handleUpdate}
            onDelete={handleDelete}
          />
        </section>
      </div>

      <NextDoseCard
        nextDose={nextDose}
        onMarkTaken={() => nextDose && handleUpdate(nextDose._id, "taken")}
        onSkip={() => nextDose && handleUpdate(nextDose._id, "skipped")}
      />
    </div>
  );
};

export default MedicationScheduler;
