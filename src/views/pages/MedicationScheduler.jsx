import React, { useEffect, useState, useCallback } from "react";
import MedicationForm from "../components/MedincineSchedule/MedicationForm";
import MedicationList from "../components/MedincineSchedule/MedicationList";
import NextDoseCard from "../components/MedincineSchedule/NextDoseCard";
import medicationService from "../../models/services/medicationService";

const MedicationScheduler = () => {
  const [medications, setMedications] = useState([]);
  const [nextDose, setNextDose] = useState(null);

  const fetchMeds = async () => {
    try {
      const meds = (await medicationService.getMedications()) || [];
      setMedications(meds);
      updateNextDose(meds);
    } catch (err) {
      console.error("Error fetching meds:", err);
    }
  };

  useEffect(() => {
    fetchMeds();
    const timer = setInterval(() => updateNextDose(medications), 1000);
    return () => clearInterval(timer);
  }, [medications]);

  const updateNextDose = useCallback((meds) => {
    if (!meds || meds.length === 0) return setNextDose(null);

    const now = new Date();
    const upcoming = meds
      .filter((m) => !m.status || m.status === "pending")
      .flatMap((m) => m.times.map((time) => ({
        ...m,
        doseTime: new Date(`${now.toISOString().slice(0,10)}T${time}:00`)
      })))
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
    } catch (err) {
      console.error("Error deleting medication:", err);
    }
  };

  return (
    <main className="px-4 sm:px-8 lg:px-10 py-8 mx-auto w-full max-w-7xl">
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-[#181611] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
            Lịch uống thuốc
          </h1>
          <p className="text-[#8a8060] dark:text-white/70 text-base font-normal leading-normal">
            Quản lý và theo dõi việc uống thuốc của bạn một cách dễ dàng.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 lg:sticky lg:top-8">
            <MedicationForm onAdd={handleAdd} />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-6">
            <h2 className="text-[#181611] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
              Lịch trình hôm nay
            </h2>
            <MedicationList
              medications={medications}
              onUpdateAdherence={handleUpdate}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>

      <NextDoseCard
        nextDose={nextDose}
        onMarkTaken={() => nextDose && handleUpdate(nextDose._id, "taken")}
        onSkip={() => nextDose && handleUpdate(nextDose._id, "skipped")}
      />
    </main>
  );
};

export default MedicationScheduler;
