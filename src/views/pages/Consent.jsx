import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ShieldAlert, FileCheck2 } from "lucide-react";
import { MARKET } from "../../config/market.vn";
import momOiLogo from "../../assets/Logo/mom-oi-submark-cropped.png";

export default function ConsentDocument() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecked, setIsChecked] = useState(false);
  // Trang này cũng là Chính sách quyền riêng tư công khai (link trong app mobile và Google Play),
  // nên phải đọc được khi mở trực tiếp. Chỉ hiện ô đồng ý khi đi từ bước đăng ký.
  const registrationData = location.state?.registrationData ?? null;

  const handleContinue = () => {
    if (isChecked && registrationData) {
      navigate("/register", {
        state: { registrationData, consentAccepted: true },
      });
    }
  };

  return (
    <div className="min-h-screen bg-theme-page px-4 py-8 font-display text-theme-ink sm:px-6 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-3 text-sm font-semibold text-theme-muted transition-colors hover:bg-theme-surface hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Về trang chủ</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <img
              src={momOiLogo}
              alt="Mom Ơi!"
              className="h-9 w-9 rounded-full border border-theme-line object-cover"
            />
            <span className="font-brand text-xl font-extrabold leading-none text-theme-brand">
              Mom Ơi!
            </span>
          </div>
        </div>

        <article className="rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm sm:p-10">
          <div className="border-b border-theme-line pb-6 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-theme-brand-soft px-3.5 py-1 text-xs font-semibold text-theme-ink">
              <FileCheck2 className="h-3.5 w-3.5 text-theme-brand" />
              Tài liệu pháp lý &amp; bảo vệ dữ liệu cá nhân
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-theme-ink sm:text-4xl">
              Điều khoản &amp; Quyền riêng tư
            </h1>
            <p className="mt-2 text-sm font-medium text-theme-muted sm:text-base">{MARKET.tagline}</p>
          </div>

          <div className="mt-8 space-y-7 text-sm leading-relaxed text-theme-ink sm:text-base">
            <section>
              <h2 className="mb-2 text-lg font-bold text-theme-ink sm:text-xl">1. Giới thiệu</h2>
              <p className="text-theme-ink/90">
                {MARKET.appName} là ứng dụng <strong>hỗ trợ chăm sóc sức khỏe thai kỳ và sau sinh</strong> dành cho{" "}
                <strong>các bà mẹ trẻ Việt Nam</strong>. Ứng dụng giúp bạn theo dõi thụ thai, tính toán chu kỳ phát triển thai nhi, gợi ý chế độ dinh dưỡng, tầm soát trầm cảm sau sinh (EPDS) và trò chuyện với trợ lý AI — <strong>không thay thế bác sĩ sản khoa hay nhi khoa chuyên môn</strong>.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-theme-ink sm:text-xl">
                2. Tuân thủ Quyền riêng tư (Nghị định 13/2023/NĐ-CP)
              </h2>
              <ul className="list-disc space-y-1.5 pl-6 text-theme-ink/90">
                <li>Chúng tôi tuân thủ nghiêm ngặt <strong>Luật bảo vệ dữ liệu cá nhân Việt Nam (Nghị định 13/2023/NĐ-CP)</strong>.</li>
                <li>Thông tin tài khoản và dữ liệu sức khỏe được lưu trên máy chủ có bảo mật, truyền qua kết nối mã hóa. Ngoài bạn, chỉ <strong>chuyên gia và nhân viên chăm sóc của {MARKET.appName}</strong> được xem dữ liệu cần thiết khi tư vấn hoặc xử lý cảnh báo sức khỏe cho bạn.</li>
                <li>Kết quả phân tích từ AI (sức khỏe tinh thần, chế độ ăn, triệu chứng) chỉ mang tính chất tham khảo cá nhân hóa.</li>
                <li>Chúng tôi cam kết không chia sẻ dữ liệu nhạy cảm của bạn cho bên thứ ba khi chưa được sự đồng ý rõ ràng.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-theme-ink sm:text-xl">3. Dữ liệu thu thập</h2>
              <div className="space-y-2 text-theme-ink/90">
                <p><strong>Thông tin tài khoản:</strong> Họ tên, email, mật khẩu (được mã hóa), số điện thoại nếu bạn cung cấp.</p>
                <p><strong>Dữ liệu sức khỏe:</strong> Tuần thai, ngày dự sinh, cân nặng mẹ và bé, nhật ký triệu chứng, chỉ số EPDS, cữ bú, lượng sắt/dinh dưỡng bổ sung của bé, các bữa ăn mẹ ghi lại.</p>
                <p><strong>Ảnh:</strong> Ảnh triệu chứng bạn chủ động chụp bằng camera hoặc chọn từ thư viện để trợ lý AI phân tích. Ứng dụng chỉ truy cập camera/ảnh khi bạn bấm chọn.</p>
                <p><strong>Không thu thập:</strong> Thông tin CCCD/Hộ chiếu, tài khoản ngân hàng không liên quan thanh toán trực tiếp, danh bạ điện thoại của bạn.</p>
              </div>
            </section>

            <section className="rounded-2xl border border-status-danger-line bg-status-danger-bg p-5">
              <div className="mb-2 flex items-center gap-2.5 text-status-danger-text">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <h2 className="text-lg font-bold sm:text-xl">4. Cảnh báo y tế thai kỳ khẩn cấp</h2>
              </div>
              <p className="mb-2 font-semibold text-status-danger-text">
                Khi có bất kỳ dấu hiệu nguy hiểm nào dưới đây, hãy gọi ngay 115 hoặc di chuyển đến bệnh viện sản/nhi gần nhất:
              </p>
              <ul className="list-disc space-y-1 pl-6 text-status-danger-text">
                <li>Chảy máu âm đạo bất thường (dù ít hay nhiều)</li>
                <li>Đau bụng dưới dữ dội hoặc co thắt tử cung liên tục</li>
                <li>Nhức đầu dữ dội, hoa mắt, mờ mắt hoặc sưng phù đột ngột mặt/tay/chân (tiền sản giật)</li>
                <li>Bé trong bụng giảm cử động hẳn (thai máy yếu hoặc không thấy máy)</li>
                <li>Vỡ ối sớm trước tuần thai dự sinh</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-theme-ink sm:text-xl">5. Trách nhiệm của Mẹ bầu</h2>
              <p className="text-theme-ink/90">
                Mọi gợi ý dinh dưỡng, bài tập hay phản hồi AI chỉ là công cụ hỗ trợ thông tin. Mẹ bầu chịu trách nhiệm tham vấn bác sĩ trước khi áp dụng chế độ ăn uống, tập luyện mới hoặc thay đổi liều lượng thuốc/bổ sung vi chất.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-theme-ink sm:text-xl">6. Đơn vị xử lý dữ liệu</h2>
              <ul className="list-disc space-y-1.5 pl-6 text-theme-ink/90">
                <li>
                  <strong>Phân tích bằng AI:</strong> mô tả triệu chứng, ảnh triệu chứng, yêu cầu gợi ý món ăn và món
                  bạn ghi lại được gửi tới dịch vụ AI Gemini của Google để phân tích, chỉ nhằm trả kết quả cho bạn.
                </li>
                <li>
                  <strong>Lưu trữ:</strong> dữ liệu được lưu trên máy chủ đám mây của nhà cung cấp hạ tầng mà
                  {" "}{MARKET.appName} thuê để vận hành dịch vụ.
                </li>
                <li>Chúng tôi không bán dữ liệu của bạn và không dùng dữ liệu sức khỏe cho quảng cáo.</li>
                <li>Dữ liệu được truyền qua kết nối mã hóa (HTTPS).</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-theme-ink sm:text-xl">7. Lưu trữ và xóa dữ liệu</h2>
              <p className="mb-2 text-theme-ink/90">
                Dữ liệu được lưu trong suốt thời gian bạn sử dụng tài khoản. Bạn có thể xóa vĩnh viễn tài khoản và toàn
                bộ dữ liệu sức khỏe của mình bất cứ lúc nào:
              </p>
              <ul className="list-disc space-y-1.5 pl-6 text-theme-ink/90">
                <li>Trong ứng dụng: <strong>Hồ sơ của mẹ → Xóa tài khoản</strong>.</li>
                <li>
                  Trên web, không cần cài ứng dụng:{" "}
                  <Link to="/delete-account" className="font-semibold text-theme-brand underline">
                    trang xóa tài khoản
                  </Link>
                  .
                </li>
              </ul>
              <p className="mt-2 text-theme-ink/90">
                Lịch sử giao dịch thanh toán (nếu có) được giữ lại ở dạng không gắn với tài khoản để phục vụ nghĩa vụ kế toán.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-theme-ink sm:text-xl">8. Liên hệ</h2>
              <p className="text-theme-ink/90">
                Mọi câu hỏi về quyền riêng tư và dữ liệu cá nhân, bạn gửi qua mục <strong>Góp ý</strong> trong ứng dụng
                {MARKET.supportEmail ? (
                  <>
                    {" "}hoặc email{" "}
                    <a href={`mailto:${MARKET.supportEmail}`} className="font-semibold text-theme-brand underline">
                      {MARKET.supportEmail}
                    </a>
                  </>
                ) : null}
                .
              </p>
            </section>
          </div>

          {registrationData ? (
            <div className="mt-8 border-t border-theme-line pt-6">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-theme-line bg-theme-page/60 p-4">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded border-theme-line accent-theme-brand focus-visible:ring-2 focus-visible:ring-theme-brand"
                />
                <span className="text-sm font-medium leading-relaxed text-theme-ink">
                  Tôi đã đọc và đồng ý với điều khoản trên. Tôi hiểu app không thay thế tư vấn y tế chuyên môn.
                </span>
              </label>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!isChecked}
                  className="flex min-h-[48px] w-full items-center justify-center rounded-full bg-theme-brand px-6 py-3 text-base font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-theme-line disabled:text-theme-muted"
                >
                  Đồng ý &amp; Tiếp tục đăng ký
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-8 border-t border-theme-line pt-6 text-center">
              <Link
                to="/"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-theme-line bg-theme-page px-6 py-2.5 text-sm font-bold text-theme-ink transition-colors hover:border-theme-brand/40 hover:bg-theme-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
              >
                Về trang chủ {MARKET.appName}
              </Link>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
