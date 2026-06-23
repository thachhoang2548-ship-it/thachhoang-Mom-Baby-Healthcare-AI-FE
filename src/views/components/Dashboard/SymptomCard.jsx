import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import tethoscope from "../../assets/DashboardAssets/stethoscope_6467872.png";

const SymptomCard = ({ entries = [] }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!entries.length) return;

    const ctx = chartRef.current.getContext("2d");
    const labels = entries.map(e => new Date(e.createdAt).toLocaleDateString());
    const dataPoints = entries.map(e => e.severityScore);

    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Mức độ nghiêm trọng",
            data: dataPoints,
            fill: true,
            borderColor: "#F5B947",
            backgroundColor: "rgba(245, 185, 71, 0.2)",
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 20 },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [entries]);

  return (
    <div className="w-full lg:col-span-2 xl:col-span-2 bg-surface-light dark:bg-surface-dark rounded-DEFAULT shadow-soft overflow-hidden">
      <div className="p-6 border-b border-border-light flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
         
        </div>
        <h2 className="text-xl font-bold text-text-light dark:text-text-dark">Xu hướng triệu chứng</h2>
      </div>
      <div className="p-6">
        <canvas ref={chartRef}></canvas>
      </div>
      <div className="p-6 border-t border-border-light">
        <h3 className="font-semibold mb-2 text-text-light dark:text-text-dark">Lịch sử ghi gần đây</h3>
        <ul className="space-y-2 max-h-40 overflow-y-auto">
          {entries.slice(-5).reverse().map((e) => (
            <li key={e._id} className="flex justify-between border-b border-gray-200 py-1">
              <span className="truncate">{e.textDescription}</span>
              <span className="font-semibold">{e.severityScore}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SymptomCard;
