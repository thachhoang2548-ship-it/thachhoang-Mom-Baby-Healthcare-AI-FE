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
    tone: 'bg-theme-brand-soft text-theme-brand',
    title: 'Theo hướng dẫn của WHO',
    text: 'Lượng ăn và cách cho bé ăn dặm theo từng tháng tuổi.',
  },
  {
    icon: Carrot,
    tone: 'bg-status-warn-bg text-status-warn-text',
    title: 'Dinh dưỡng từ dữ liệu USDA',
    text: 'Năng lượng, chất đạm, sắt của món ăn dựa trên dữ liệu thực phẩm của Bộ Nông nghiệp Hoa Kỳ.',
  },
  {
    icon: ShieldCheck,
    tone: 'bg-status-ok/15 text-status-ok',
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
    <details className="group font-display">
      <summary className="inline-flex min-h-[44px] cursor-pointer list-none items-center gap-2 rounded-full border border-theme-line bg-theme-surface px-4 py-2 text-sm font-semibold text-theme-ink transition-colors hover:border-theme-brand/40 hover:text-theme-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand [&::-webkit-details-marker]:hidden">
        <span>Xem nguồn tham khảo ({SCIENTIFIC_REFERENCES.length})</span>
        <ChevronDown className="h-4 w-4 text-theme-muted transition-transform group-open:rotate-180" />
      </summary>
      <ul className="mt-4 space-y-3 text-left">
        {SCIENTIFIC_REFERENCES.map(ref => (
          <li key={ref.url}>
            <a
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl border border-theme-line bg-theme-surface p-4 transition-colors hover:border-theme-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
            >
              <span className="block text-xs font-semibold text-theme-muted">
                {ref.org}{ref.year && ` · ${ref.year}`}
              </span>
              <span className="mt-1 flex items-start justify-between gap-3 text-sm font-semibold text-theme-ink sm:text-base">
                <span>{ref.title}</span>
                <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-theme-muted" />
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
        className={`mt-8 space-y-5 rounded-3xl border border-theme-line bg-theme-surface p-5 font-display sm:p-6 ${className}`}
        aria-label="Cơ sở của thực đơn"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TRUST_POINTS.map(p => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="flex items-center gap-3.5">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${p.tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-theme-ink sm:text-base">{p.title}</span>
              </div>
            );
          })}
        </div>
        <div className="border-t border-theme-line pt-4">
          <SourcesDisclosure />
        </div>
      </section>
    );
  }

  // Trang chủ: 3 thẻ có hình + một câu
  return (
    <section className={`border-t border-theme-line bg-theme-sidebar/55 font-display ${className}`}>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-theme-line bg-theme-surface px-3.5 py-1 text-xs font-semibold text-theme-brand">
            Cơ sở khoa học rõ ràng
          </span>
          <h2 className="mt-3 text-2xl font-bold text-theme-ink sm:text-3xl">
            Vì sao mẹ có thể yên tâm?
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {TRUST_POINTS.map(p => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="flex flex-col items-start rounded-3xl border border-theme-line bg-theme-surface p-6 text-left shadow-sm"
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${p.tone}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-theme-ink">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-theme-muted sm:text-base">{p.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <SourcesDisclosure />
        </div>
      </div>
    </section>
  );
}
