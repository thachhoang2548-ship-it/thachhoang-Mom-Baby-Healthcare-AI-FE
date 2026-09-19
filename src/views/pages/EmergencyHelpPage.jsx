import React, { useEffect, useState } from 'react';
import { AlertTriangle, HeartPulse, PhoneCall, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import wellnessService from '../../models/services/wellnessService';

export default function EmergencyHelpPage() {
  const [guide, setGuide] = useState(null);

  useEffect(() => {
    wellnessService.getEmergencyGuide()
      .then(setGuide)
      .catch((error) => {
        console.error(error);
        toast.error('Không thể tải hướng dẫn khẩn cấp.');
      });
  }, []);

  const redFlags = guide?.redFlags || [];
  const actions = guide?.actions || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="rounded-3xl bg-red-50 border border-red-100 p-6">
        <div className="w-12 h-12 rounded-2xl bg-white text-red-600 flex items-center justify-center shadow-sm mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{guide?.headline || 'Trợ giúp khẩn cấp'}</h1>
        <p className="text-sm font-semibold text-gray-600 mt-2 leading-relaxed">{guide?.notice || 'Đang tải hướng dẫn...'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-red-500" /> Dấu hiệu đỏ
          </h2>
          <div className="mt-4 space-y-3">
            {redFlags.map((item) => (
              <div key={item} className="rounded-2xl border border-red-100 bg-red-50/50 p-4 text-sm font-bold text-gray-700">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-emerald-600" /> Hành động ngay
          </h2>
          <div className="mt-4 space-y-3 text-sm font-semibold text-gray-600 leading-relaxed">
            {actions.map((item) => (
              <p key={item} className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">{item}</p>
            ))}
          </div>
        </section>
      </div>

      <div className="rounded-3xl bg-white border border-blue-100 p-5 shadow-sm flex gap-3">
        <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0" />
        <p className="text-xs font-semibold text-gray-500 leading-relaxed">{guide?.disclaimer || 'Mom Ơi chỉ hỗ trợ theo dõi và gợi ý chăm sóc.'}</p>
      </div>
    </div>
  );
}
