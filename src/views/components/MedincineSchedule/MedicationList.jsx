import React from "react";
import { Pill } from "lucide-react";
import MedicationItem from "./MedicationItem";

const MedicationList = ({ medications = [], onUpdateAdherence, onDelete }) => {
  if (!medications.length) {
    return (
      <div className="rounded-2xl bg-theme-page border border-theme-line p-8 text-center space-y-2">
        <div className="w-11 h-11 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center mx-auto">
          <Pill className="w-5 h-5" aria-hidden="true" />
        </div>
        <p className="text-sm font-bold text-theme-ink">Chưa có lịch uống thuốc nào được tạo</p>
        <p className="text-xs text-theme-muted font-medium max-w-sm mx-auto">
          Mẹ có thể thêm lịch uống vitamin bầu, sắt hoặc canxi ở biểu mẫu bên cạnh để được nhắc đúng giờ.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {medications.map((med) => (
        <MedicationItem
          key={med._id}
          med={med}
          onUpdate={onUpdateAdherence}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default MedicationList;
