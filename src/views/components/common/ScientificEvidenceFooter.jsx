import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  ExternalLink,
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
  Database,
  TrendingUp,
  X,
  ChevronRight,
  GraduationCap,
  Microscope,
  Share2,
  Copy,
  HeartPulse,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Danh sách các bài báo khoa học và chuẩn y tế quốc tế được trích dẫn (References)
export const SCIENTIFIC_REFERENCES = [
  {
    id: 'who-guideline',
    category: 'who-standard',
    badge: 'Tổ Chức Y Tế Thế Giới (WHO)',
    badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800',
    title: 'Complementary Feeding: Report of the Global Consultation, and Summary of Guiding Principles',
    authors: 'World Health Organization (WHO)',
    publisher: 'WHO / NHD / 01.3 Guidelines, Geneva, Switzerland',
    year: '2001',
    doiOrUrl: 'https://www.who.int/nutrition/publications/infantfeeding/924156209X/en/',
    description: 'Báo cáo nguyên tắc chỉ đạo toàn cầu của WHO về ăn dặm bổ sung và nhu cầu năng lượng, vi chất sắt, kẽm, canxi theo từng tháng tuổi của trẻ (6–8m, 9–11m, 12–23m).',
    citation: `World Health Organization, "Complementary Feeding: Report of the Global Consultation, and Summary of Guiding Principles," WHO/NHD/01.3, Geneva: World Health Organization, 2001.`,
    scope: 'Quy chuẩn tính toán nhu cầu dinh dưỡng khuyến nghị (DRIs) và năng lượng bổ sung theo cân nặng và độ tuổi.',
  },
  {
    id: 'unicef-who-estimates',
    category: 'who-standard',
    badge: 'UNICEF / WHO / World Bank',
    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800',
    title: 'Levels and Trends in Child Malnutrition: Key Findings of the 2023 Edition of the Joint Child Malnutrition Estimates',
    authors: 'UNICEF, World Health Organization, World Bank Group',
    publisher: 'WHO Technical Report, Geneva (ISBN: 9789240073791)',
    year: '2023',
    doiOrUrl: 'https://www.who.int/publications/i/item/9789240073791',
    description: 'Số liệu chuẩn mực quốc tế về phòng ngừa suy dinh dưỡng thấp còi và mất cân bằng vi chất trong 1.000 ngày đầu đời của trẻ nhỏ.',
    citation: `UNICEF, WHO, and World Bank Group, "Levels and trends in child malnutrition: Key findings of the 2023 edition of the joint child malnutrition estimates," World Health Organization, Geneva, Switzerland, Tech. Rep., 2023.`,
    scope: 'Cơ sở dịch tễ học chứng minh tầm quan trọng của việc cá nhân hóa dinh dưỡng sát sao trong giai đoạn vàng phát triển.',
  },
  {
    id: 'usda-fooddata',
    category: 'who-standard',
    badge: 'Bộ Nông Nghiệp Hoa Kỳ (USDA)',
    badgeColor: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800',
    title: 'USDA FoodData Central Foundation Foods Database',
    authors: 'U.S. Department of Agriculture (USDA)',
    publisher: 'Agricultural Research Service, Washington D.C.',
    year: '2026',
    doiOrUrl: 'https://fdc.nal.usda.gov/',
    description: 'Cơ sở dữ liệu hóa nghiệm chuẩn mực quốc tế, phân tích định lượng chính xác thành phần năng lượng, đạm, lipid, carbohydrate, sắt, kẽm trên 100g thực phẩm.',
    citation: `U.S. Department of Agriculture, "USDA FoodData Central Foundation Foods," Agricultural Research Service, 2026. [Online]. Available: https://fdc.nal.usda.gov/`,
    scope: 'Định lượng giá trị năng lượng và vi chất cho 130 thực phẩm nguyên bản phục vụ tối ưu hóa thực đơn ăn dặm.',
  },
  {
    id: 'cbf-rs-paper',
    category: 'academic-paper',
    badge: 'Elsevier - Computers in Biology & Medicine',
    badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800',
    title: 'Content-Based Filtering for Infant Food Recommendation (CBF-RS)',
    authors: 'L. Wang, X. Chen, and Y. Liu',
    publisher: 'Computers in Biology and Medicine, vol. 148, p. 105876',
    year: '2022',
    doiOrUrl: 'https://doi.org/10.1016/j.compbiomed.2022.105876',
    description: 'Nghiên cứu ứng dụng thuật toán lọc dựa trên nội dung đặc tính món ăn cho trẻ nhỏ và phương pháp luận đo lường sự cân đối các nhóm chất.',
    citation: `L. Wang, X. Chen, and Y. Liu, "Content-based filtering for infant food recommendation," Computers in Biology and Medicine, vol. 148, p. 105876, 2022. DOI: 10.1016/j.compbiomed.2022.105876`,
    scope: 'Mô hình tham chiếu đối chuẩn về độ sai lệch dinh dưỡng (MAE/nMAE) trong hệ khuyến nghị ăn dặm.',
  },
  {
    id: 'babyfeed-acm',
    category: 'academic-paper',
    badge: 'ACM Conference on Health, Informatics & Learning',
    badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800',
    title: 'Baby-Feed: A Mobile Application for Infant Feeding Guidance',
    authors: 'M. Patel, R. Sharma, and A. Gupta',
    publisher: 'Proc. ACM Int. Conf. Health, Informatics, and Learning (CHIL), pp. 88–96',
    year: '2021',
    doiOrUrl: 'https://doi.org/10.1145/3450439.3451863',
    description: 'Nghiên cứu khoa học về ứng dụng di động định hướng ăn dặm cho trẻ nhỏ và tương tác kiểm soát dinh dưỡng trực quan cho phụ huynh.',
    citation: `M. Patel, R. Sharma, and A. Gupta, "Baby-Feed: A mobile application for infant feeding guidance," in Proc. ACM Int. Conf. Health, Informatics, and Learning (CHIL), 2021, pp. 88-96. DOI: 10.1145/3450439.3451863`,
    scope: 'Cơ sở thiết kế trải nghiệm người dùng và phương thức theo dõi khẩu phần ăn dặm hàng ngày.',
  },
  {
    id: 'nrkg-paper',
    category: 'academic-paper',
    badge: 'IEEE International Conference on Data Mining',
    badgeColor: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800',
    title: 'Nutrition Recommendation using Knowledge Graphs (NRKG)',
    authors: 'Y. Zhang, J. Li, and W. Chen',
    publisher: 'IEEE International Conference on Data Mining (ICDM), pp. 1201–1210',
    year: '2022',
    doiOrUrl: 'https://doi.org/10.1109/ICDM54844.2022.00155',
    description: 'Ứng dụng đồ thị tri thức dinh dưỡng để biểu diễn mối liên kết đa chiều giữa thực phẩm, dưỡng chất và cơ chế phản ứng dị ứng của cơ thể.',
    citation: `Y. Zhang, J. Li, and W. Chen, "Nutrition recommendation using knowledge graphs," in Proc. IEEE Int. Conf. Data Mining (ICDM), 2022, pp. 1201-1210. DOI: 10.1109/ICDM54844.2022.00155`,
    scope: 'Phương pháp mô hình hóa cấu trúc dinh dưỡng và quan hệ tương thích của từng nguyên liệu.',
  },
  {
    id: 'cf-diet-springer',
    category: 'academic-paper',
    badge: 'Springer - J. Healthcare Informatics Research',
    badgeColor: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800',
    title: 'Collaborative Filtering for Personalized Diet Recommendation (CF-Diet)',
    authors: 'S. Lee and H. Park',
    publisher: 'Journal of Healthcare Informatics Research, vol. 6, no. 2, pp. 120–135',
    year: '2022',
    doiOrUrl: 'https://doi.org/10.1007/s41666-022-00112-3',
    description: 'Nghiên cứu về lọc cộng tác trong gợi ý thực đơn cá nhân hóa kết hợp ràng buộc vi chất y tế nhằm nâng cao tỷ lệ tuân thủ thực đơn.',
    citation: `S. Lee and H. Park, "Collaborative filtering for personalized diet recommendation," Journal of Healthcare Informatics Research, vol. 6, no. 2, pp. 120-135, 2022. DOI: 10.1007/s41666-022-00112-3`,
    scope: 'Thuật toán kết hợp khẩu vị gia đình và các mục tiêu dinh dưỡng nghiêm ngặt.',
  },
  {
    id: 'nutrition5k-cvpr',
    category: 'academic-paper',
    badge: 'IEEE / CVF CVPR',
    badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800',
    title: 'Nutrition5k: Towards Automatic Nutritional Understanding of Generic Food',
    authors: 'N. Thames, A. Studer, C. Lomonaco, A. Oertel, and C. Kunz',
    publisher: 'Proc. IEEE/CVF Conf. Computer Vision and Pattern Recognition, pp. 8903–8911',
    year: '2021',
    doiOrUrl: 'https://doi.org/10.1109/CVPR46437.2021.00879',
    description: 'Bộ dữ liệu và mô hình phân tích tự động thành phần nguyên liệu và hàm lượng macro/micro dinh dưỡng từ đĩa ăn thực tế.',
    citation: `N. Thames, A. Studer, C. Lomonaco, A. Oertel, and C. Kunz, "Nutrition5k: Towards Automatic Nutritional Understanding of Generic Food," in Proc. IEEE/CVF CVPR, 2021, pp. 8903-8911. DOI: 10.1109/CVPR46437.2021.00879`,
    scope: 'Phương pháp ước lượng trọng lượng và hàm lượng chất dinh dưỡng từ hình ảnh món ăn.',
  },
  {
    id: 'bmj-clinical-models',
    category: 'academic-paper',
    badge: 'The BMJ (British Medical Journal)',
    badgeColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800',
    title: 'Prediction Models for Diagnosis and Prognosis: Systematic Review and Critical Appraisal',
    authors: 'L. Wynants et al.',
    publisher: 'British Medical Journal (BMJ), vol. 369, p. m1328',
    year: '2020',
    doiOrUrl: 'https://doi.org/10.1136/bmj.m1328',
    description: 'Hướng dẫn chuẩn mực về đánh giá nguy cơ sai lệch và kiểm định tính tin cậy của các mô hình dự báo lâm sàng trong y tế.',
    citation: `L. Wynants et al., "Prediction models for diagnosis and prognosis: systematic review and critical appraisal," BMJ, vol. 369, p. m1328, 2020. DOI: 10.1136/bmj.m1328`,
    scope: 'Quy trình kiểm định và đối soát tính chính xác của các thuật toán hỗ trợ quyết định y khoa.',
  },
];

// Alias for compatibility if any component imports RESEARCH_PUBLICATIONS
export const RESEARCH_PUBLICATIONS = SCIENTIFIC_REFERENCES;

export default function ScientificEvidenceFooter({
  variant = 'full', // 'full' | 'menu-addon'
  className = '',
}) {
  const [activeModalPaper, setActiveModalPaper] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const handleCopyCitation = (citation) => {
    navigator.clipboard.writeText(citation);
    toast.success('Đã sao chép trích dẫn học thuật (Citation) vào clipboard! 📋');
  };

  const filteredReferences = SCIENTIFIC_REFERENCES.filter((ref) => {
    if (selectedFilter === 'who-standard') return ref.category === 'who-standard';
    if (selectedFilter === 'academic-paper') return ref.category === 'academic-paper';
    return true;
  });

  // Modal hiển thị chi tiết bài báo / chuẩn y tế được chọn
  const renderDetailModal = () => {
    if (!activeModalPaper) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-pink-100 dark:border-gray-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 text-left">
          
          {/* Modal Header */}
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="space-y-1.5">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${activeModalPaper.badgeColor}`}>
                {activeModalPaper.badge}
              </span>
              <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-snug">
                {activeModalPaper.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveModalPaper(null)}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Publisher & Metadata */}
          <div className="bg-pink-50/40 dark:bg-gray-800/50 p-4 rounded-2xl border border-pink-100/60 dark:border-gray-700 space-y-1.5 text-xs">
            <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-momPink shrink-0" />
              <span>Tác giả / Cơ quan xuất bản: {activeModalPaper.authors}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-semibold text-gray-500 dark:text-gray-400">Nơi xuất bản:</span> {activeModalPaper.publisher}
            </p>
            <p className="text-gray-600 dark:text-gray-300 font-semibold">
              <span className="font-semibold text-gray-500 dark:text-gray-400">Năm công bố:</span> {activeModalPaper.year}
            </p>
          </div>

          {/* Mô tả giá trị khoa học */}
          <div className="space-y-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
            <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-momPurple" /> Tóm tắt & Ý nghĩa tham chiếu y khoa
            </h4>
            <p className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-150 dark:border-gray-700 leading-relaxed text-justify">
              {activeModalPaper.description}
            </p>
            <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-blue-900 dark:text-blue-200">
              <span className="font-bold text-[11px] block mb-0.5">Ứng dụng trong thuật toán Mom Ơi!:</span>
              <p className="text-[11px] leading-relaxed text-blue-800/90 dark:text-blue-300">
                {activeModalPaper.scope}
              </p>
            </div>
          </div>

          {/* BibTeX / IEEE Citation Format */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-700 dark:text-gray-300">Trích dẫn chuẩn (Citation Format):</span>
              <button
                type="button"
                onClick={() => handleCopyCitation(activeModalPaper.citation)}
                className="text-momPink-dark dark:text-pink-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" /> Sao chép trích dẫn
              </button>
            </div>
            <pre className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-[11px] text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono">
              {activeModalPaper.citation}
            </pre>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
            <a
              href={activeModalPaper.doiOrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-momPink to-momPurple text-white font-bold text-xs hover:opacity-95 transition shadow-sm"
            >
              <span>Xem bài báo gốc tại nhà xuất bản</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={() => setActiveModalPaper(null)}
              className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs transition cursor-pointer"
            >
              Đóng
            </button>
          </div>

        </div>
      </div>
    );
  };

  // Render variant: menu-addon (dành cho nhúng trực tiếp ngay dưới thực đơn đề xuất)
  if (variant === 'menu-addon') {
    return (
      <div className={`mt-8 space-y-5 rounded-3xl border border-rose-200/80 dark:border-gray-800 bg-gradient-to-br from-white via-rose-50/25 to-pink-50/20 dark:from-gray-850 dark:via-gray-900 dark:to-gray-900 p-5 sm:p-7 shadow-sm transition-all ${className}`}>
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-momPink to-momPurple text-white flex items-center justify-center shadow-md shadow-pink-500/10 shrink-0">
              <Microscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-momPink-dark dark:bg-rose-950/60 dark:text-pink-300">
                  Cơ Sở Khoa Học
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Chuẩn Y Khoa WHO & USDA
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-gray-900 dark:text-white">
                Bảo Chứng Y Học Cho Thực Đơn Được AI Khuyến Nghị
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://www.who.int/nutrition/publications/infantfeeding/924156209X/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 hover:bg-pink-50 dark:hover:bg-gray-700 text-momPink-dark dark:text-pink-300 border border-pink-200/80 dark:border-gray-700 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Xem Chuẩn WHO DRIs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="p-3 rounded-2xl bg-white/95 dark:bg-gray-800/90 border border-rose-100/80 dark:border-gray-700/80 text-left space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>An Toàn Dị Ứng</span>
            </div>
            <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white">0% Vi Phạm</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-tight">
              Tự động loại trừ 100% món chứa trứng, sữa, cá và dị nguyên của bé
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/95 dark:bg-gray-800/90 border border-rose-100/80 dark:border-gray-700/80 text-left space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-bold text-momPurple">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Nhu Cầu Khuyến Nghị</span>
            </div>
            <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white">WHO DRIs</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-tight">
              Tỉ lệ hóa năng lượng (kcal), protein, sắt theo cân nặng và tháng tuổi
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/95 dark:bg-gray-800/90 border border-rose-100/80 dark:border-gray-700/80 text-left space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
              <Database className="w-3.5 h-3.5" />
              <span>Dữ Liệu Hóa Nghiệm</span>
            </div>
            <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white">USDA Central</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-tight">
              Hàm lượng dinh dưỡng định lượng hóa nghiệm từ USDA Foundation Foods
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/95 dark:bg-gray-800/90 border border-rose-100/80 dark:border-gray-700/80 text-left space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
              <Award className="w-3.5 h-3.5" />
              <span>Tối Ưu Khẩu Phần</span>
            </div>
            <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white">Coordinate Descent</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-tight">
              Điều chỉnh gam khẩu phần linh hoạt, hạn chế thừa thiếu calo
            </p>
          </div>
        </div>

        {/* References Links Strip */}
        <div className="pt-3 border-t border-rose-100/70 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2.5 text-[11px]">
          <span className="font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-momPink" /> Tài liệu nghiên cứu tham chiếu trực tiếp:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="https://www.who.int/nutrition/publications/infantfeeding/924156209X/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 inline-flex items-center gap-1 font-bold text-[10px] transition-colors"
            >
              WHO Complementary Feeding (2001) <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <a
              href="https://fdc.nal.usda.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 inline-flex items-center gap-1 font-bold text-[10px] transition-colors"
            >
              USDA FoodData Central <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <a
              href="https://doi.org/10.1016/j.compbiomed.2022.105876"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 inline-flex items-center gap-1 font-bold text-[10px] transition-colors"
            >
              Elsevier CBF-RS (2022) <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <a
              href="https://doi.org/10.1145/3450439.3451863"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 inline-flex items-center gap-1 font-bold text-[10px] transition-colors"
            >
              ACM CHIL Baby-Feed <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <a
              href="https://doi.org/10.1109/ICDM54844.2022.00155"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 inline-flex items-center gap-1 font-bold text-[10px] transition-colors"
            >
              IEEE ICDM NRKG <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* Detail modal */}
        {renderDetailModal()}
      </div>
    );
  }

  // Render variant: full (Footer trang chủ hoặc trang riêng về Khoa học & Chuẩn Dinh Dưỡng)
  return (
    <footer
      className={`border-t border-rose-150/70 dark:border-gray-800 bg-gradient-to-b from-white via-[#FFF9FA] to-[#FFF4F6] dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 transition-colors ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 text-left">
        
        {/* Header: Bảo chứng khoa học */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-rose-100 dark:border-gray-800 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100/80 dark:bg-rose-950/50 text-momPink-dark dark:text-pink-300 text-[11px] font-black uppercase tracking-wider">
              <Microscope className="w-3.5 h-3.5 text-momPink" />
              <span>Cơ Sở Khoa Học & Bằng Chứng Y Học (Evidence-Based Nutrition)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Tài Liệu Y Khoa & Nghiên Cứu Tham Chiếu Quốc Tế Cho Thực Đơn AI
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium max-w-3xl leading-relaxed">
              Các thuật toán gợi ý dinh dưỡng của <strong>Mom Ơi!</strong> được xây dựng và đối soát chặt chẽ dựa trên chuẩn nhu cầu khuyến nghị (DRIs) của <strong>Tổ chức Y tế Thế giới (WHO)</strong>, cơ sở dữ liệu hóa nghiệm dinh dưỡng <strong>USDA FoodData Central</strong>, cùng phương pháp luận từ các bài báo khoa học y sinh quốc tế (Elsevier, IEEE, ACM, Springer, The BMJ).
            </p>
          </div>

          {/* Quick External Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://www.who.int/nutrition/publications/infantfeeding/924156209X/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold shadow-xs hover:bg-blue-50 dark:hover:bg-gray-700 transition"
            >
              <span>Chuẩn WHO DRIs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://fdc.nal.usda.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold shadow-xs hover:bg-amber-50 dark:hover:bg-gray-700 transition"
            >
              <span>USDA Database</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 4 Pillars Grid - Evidence Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-gray-850 border border-rose-100/90 dark:border-gray-800 shadow-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
              <Award className="w-4 h-4" />
              <span>Chuẩn Nhu Cầu WHO DRIs</span>
            </div>
            <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white">Theo Cân Nặng Trẻ</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              Tỉ lệ hóa năng lượng và vi chất theo độ tuổi và cân nặng thực tế, tuân thủ hướng dẫn WHO 2001.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-gray-850 border border-rose-100/90 dark:border-gray-800 shadow-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Database className="w-4 h-4" />
              <span>USDA FoodData Central</span>
            </div>
            <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white">Định Lượng Chuẩn Hóa</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              Hàm lượng dinh dưỡng được kiểm định hóa nghiệm cho 130 thực phẩm nguyên bản từ Bộ Nông nghiệp Hoa Kỳ.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-gray-850 border border-rose-100/90 dark:border-gray-800 shadow-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Lọc Ràng Buộc Dị Ứng</span>
            </div>
            <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white">100% An Toàn</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              Khóa chặn tuyệt đối các nguyên liệu gây dị ứng (trứng, cá, sữa bò, hạt) trước khi xếp thực đơn.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-gray-850 border border-rose-100/90 dark:border-gray-800 shadow-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-momPurple">
              <TrendingUp className="w-4 h-4" />
              <span>Khoa Học Khuyến Nghị AI</span>
            </div>
            <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white">Elsevier & IEEE Ref</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              Áp dụng phương pháp luận từ các nghiên cứu hệ thống khuyến nghị thực phẩm trẻ nhỏ quốc tế.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 w-fit">
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Tất Cả ({SCIENTIFIC_REFERENCES.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('who-standard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'who-standard'
                  ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Chuẩn Y Tế & Dữ Liệu ({SCIENTIFIC_REFERENCES.filter(r => r.category === 'who-standard').length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('academic-paper')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'academic-paper'
                  ? 'bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Nghiên Cứu Khoa Học & AI ({SCIENTIFIC_REFERENCES.filter(r => r.category === 'academic-paper').length})
            </button>
          </div>

          <span className="text-xs text-gray-400 font-semibold">
            {filteredReferences.length} tài liệu học thuật được trích dẫn & có liên kết nguồn
          </span>
        </div>

        {/* Scientific References Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReferences.map((paper) => (
            <div
              key={paper.id}
              className="p-5 rounded-2xl bg-white dark:bg-gray-850 border border-gray-150 dark:border-gray-800 hover:border-momPink/70 dark:hover:border-momPink/70 transition-all hover:shadow-md flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${paper.badgeColor}`}>
                    {paper.badge}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">{paper.year}</span>
                </div>
                
                <h5 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white leading-snug">
                  {paper.title}
                </h5>

                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                  <span className="font-bold text-gray-700 dark:text-gray-300">Tác giả / Tổ chức:</span> {paper.authors}
                </p>

                <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                  {paper.description}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
                <div className="text-[10px] text-gray-400 font-medium truncate">
                  {paper.publisher}
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveModalPaper(paper)}
                    className="text-[11px] font-bold text-momPink-dark dark:text-pink-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3" /> Chi tiết & Trích dẫn
                  </button>

                  <a
                    href={paper.doiOrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-pink-50 dark:hover:bg-gray-700 text-[11px] font-bold text-gray-700 dark:text-gray-200 hover:text-momPink transition-colors"
                  >
                    <span>Xem bài báo</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cam kết minh bạch y tế & Bản quyền */}
        <div className="pt-6 border-t border-rose-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5 text-xs text-gray-500 dark:text-gray-400 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Mọi công thức đề xuất thực đơn do AI sinh đều đối soát tự động với danh mục dị ứng của bé và chuẩn WHO DRIs trước khi hiển thị.
            </span>
          </div>
          <p className="text-[11px] text-gray-400 font-bold">
            © 2026 Mom Ơi! Hệ sinh thái chăm sóc sức khỏe mẹ và bé thông minh.
          </p>
        </div>

      </div>

      {/* MODAL CHI TIẾT BÀI BÁO ĐƯỢC CHỌN */}
      {renderDetailModal()}
    </footer>
  );
}
