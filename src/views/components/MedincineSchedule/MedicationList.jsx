import React from "react";
import MedicationItem from "./MedicationItem";

const MedicationList = ({ medications = [], onUpdateAdherence, onDelete }) => {
  if (!medications.length)
    return <p className="text-sm text-gray-500 dark:text-white/50">Chưa có lịch uống thuốc nào được lên lịch.</p>;

  return (
    <div className="flex flex-col gap-4">
      {medications.map((med) => (
        <MedicationItem key={med._id} med={med} onUpdate={onUpdateAdherence} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default MedicationList;
