import React from 'react';
import { Globe2, Carrot, ShieldCheck, ExternalLink, ChevronDown } from 'lucide-react';

/**
 * Khối "Vì sao mẹ có thể yên tâm": 3 ý ngắn có hình minh họa, nguồn tham khảo
 * được thu gọn (bấm mới mở) để mẹ không bị ngợp chữ.
 *
 * Chỉ liệt kê nguồn CÓ THẬT và đúng là cơ sở của tính năng. Không dùng logo
 * WHO/USDA (WHO không cho phép dùng biểu tượng khi chưa được cấp phép).
 */

const TRUST_POINTS = [
  {
    icon: Globe2,
    tone: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    title: 'Theo hướng dẫn của WHO',
    text: 'Lượng ăn và cách cho bé ăn dặm theo từng tháng tuổi.',
  },
  {
    icon: Carrot,
    tone: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    title: 'Dinh dưỡng từ dữ liệu USDA',
    text: 'Năng lượng, chất đạm, sắt của món ăn dựa trên dữ liệu thực phẩm của Bộ Nông nghiệp Hoa Kỳ.',
  },
  {
    icon: ShieldCheck,
    tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    title: 'Tránh món bé bị dị ứng',
    text: 'Tự bỏ các món có trứng, cá, sữa nếu mẹ đã khai bé bị dị ứng.',
  },
];

// Nguồn tham khảo — chỉ những tài liệu thật sự làm cơ sở cho tính năng
const SCIENTIFIC_REFERENCES = [
  {
    org: 'Tổ chức Y tế Thế giới (WHO)',
    title: 'WHO Guideline for complementary feeding of infants and young children 6–23 months of age',
    year: '2023',
    url: 'https://www.who.int/publications/i/item/9789240081864',
  },
  {
    org: 'Tổ chức Y tế Thế giới (WHO)',
    title: 'Complementary feeding: report of the global consultation, and summary of guiding principles',
    year: '2001',
    url: 'https://www.who.int/nutrition/publications/infantfeeding/924156209X/en/',
  },
  {
    org: 'Bộ Nông nghiệp Hoa Kỳ (USDA)',
    title: 'FoodData Central — cơ sở dữ liệu thành phần dinh dưỡng thực phẩm',
    year: '',
    url: 'https://fdc.nal.usda.gov/',
  },
  {
    org: 'Cơ quan An toàn Thực phẩm châu Âu (EFSA)',
    title: 'Scientific Opinion on Dietary Reference Values for water',
    year: '2010',
    url: 'https://doi.org/10.2903/j.efsa.2010.1459',
  },
];

function SourcesDisclosure() {
  return (
    <details className="group">
      <summary className="inline-flex items-center gap-2 cursor-pointer list-none text-base font-semibold text-momPink-dark dark:text-pink-300 hover:underline [&::-webkit-details-marker]:hidden">
        Xem nguồn tham khảo ({SCIENTIFIC_REFERENCES.length})
        <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
      </summary>
      <ul className="mt-3 space-y-3 text-left">
        {SCIENTIFIC_REFERENCES.map(ref => (
          <li key={ref.url}>
            <a
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-momPink"
            >
              <span className="block text-sm font-semibold text-gray-500 dark:text-gray-400">
                {ref.org}{ref.year && ` · ${ref.year}`}
              </span>
              <span className="mt-1 flex items-start gap-2 text-base font-semibold text-gray-800 dark:text-gray-100">
                {ref.title}
                <ExternalLink className="w-4 h-4 shrink-0 mt-1 text-gray-400" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

export default function ScientificEvidenceFooter({
  variant = 'full', // 'full' | 'menu-addon'
  className = '',
}) {
  // Nhúng ngay dưới thực đơn: một dải gọn
  if (variant === 'menu-addon') {
    return (
      <section
        className={`mt-8 rounded-3xl border border-pink-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6 space-y-5 ${className}`}
        aria-label="Cơ sở của thực đơn"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TRUST_POINTS.map(p => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="flex items-center gap-3">
                <span className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${p.tone}`}>
                  <Icon className="w-6 h-6" />
                </span>
                <span className="text-base font-semibold text-gray-800 dark:text-gray-100">{p.title}</span>
              </div>
            );
          })}
        </div>
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <SourcesDisclosure />
        </div>
      </section>
    );
  }

  // Trang chủ: 3 thẻ có hình + một câu
  return (
    <section className={`bg-[#FFF7F8] dark:bg-gray-950 border-t border-pink-100 dark:border-gray-800 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-14 space-y-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white text-center">
          Vì sao mẹ có thể yên tâm?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TRUST_POINTS.map(p => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="bg-white dark:bg-gray-900 border border-pink-100 dark:border-gray-800 rounded-3xl p-6 text-center space-y-3">
                <span className={`mx-auto w-20 h-20 rounded-3xl flex items-center justify-center ${p.tone}`}>
                  <Icon className="w-10 h-10" />
                </span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{p.title}</h3>
                <p className="text-base text-gray-600 dark:text-gray-300">{p.text}</p>
              </div>
            );
          })}
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <SourcesDisclosure />
        </div>
      </div>
    </section>
  );
}
