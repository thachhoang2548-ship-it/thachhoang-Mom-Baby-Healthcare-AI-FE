import React from "react";

const NotificationFilters = ({ filters, setFilters }) => {
  const types = ["all", "symptom", "medication", "resolved"];
  return (
    <div className="sticky top-16 z-10 -mx-4 px-4 sm:mx-0 sm:px-0 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm py-2 transition-all duration-200">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide sm:flex-wrap">
        {types.map(type => (
          <button
            key={type}
            onClick={() => setFilters(prev => ({ ...prev, type }))}
            className={`flex h-9 sm:h-10 shrink-0 items-center gap-x-2 rounded-full px-4 text-sm font-medium transition-colors duration-200 ${
              filters.type === type 
                ? "bg-primary text-white shadow-md" 
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            }`}
          >
            <p>
              {type === "all" && "Tất cả"}
              {type === "symptom" && "Triệu chứng"}
              {type === "medication" && "Thuốc"}
              {type === "resolved" && "Đã xử lý"}
            </p>
            {type === "all" && (
              <span className={`grid size-5 place-items-center rounded-full text-xs font-bold ${
                filters.type === type ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}>
                {filters.length}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NotificationFilters;
