import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DailyInputForm from "../components/lifestyle/DailyInputForm";

const LifestyleInputPage = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <header className="flex items-center space-x-4">
        <Link
          to="/dashboard-lifestyle"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Nhật ký Lối sống Sinh viên
          </h1>
          <p className="text-sm text-gray-500">
            Ghi nhận các thông số học tập, sinh hoạt để nhận phân tích tức thì
          </p>
        </div>
      </header>

      <main>
        <DailyInputForm />
      </main>
    </div>
  );
};

export default LifestyleInputPage;
