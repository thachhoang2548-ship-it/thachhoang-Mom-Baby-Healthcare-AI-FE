import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MARKET } from "../../config/market.vn";

export default function ConsentDocument() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecked, setIsChecked] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);

  useEffect(() => {
    if (location.state?.registrationData) {
      setRegistrationData(location.state.registrationData);
    } else {
      navigate("/register");
    }
  }, [location, navigate]);

  const handleContinue = () => {
    if (isChecked && registrationData) {
      navigate("/register", {
        state: { registrationData, consentAccepted: true },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4">
      <div className="max-w-4xl w-full bg-white p-10 rounded-2xl shadow-xl border border-gray-200">
        <h1 className="text-4xl font-bold text-center mb-2 tracking-tight text-gray-900">
          Điều khoản & Quyền riêng tư
        </h1>
        <p className="text-center text-gray-600 mb-8">{MARKET.tagline}</p>

        <div className="space-y-6 text-gray-800 leading-relaxed max-h-[65vh] overflow-y-auto pr-4">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Giới thiệu</h2>
            <p>
              {MARKET.appName} là ứng dụng <strong>hỗ trợ chăm sóc sức khỏe thai kỳ và sau sinh</strong> dành cho{" "}
              <strong>các bà mẹ trẻ Việt Nam</strong>. Ứng dụng giúp bạn theo dõi thụ thai, tính toán chu kỳ phát triển thai nhi, gợi ý chế độ dinh dưỡng, tầm soát trầm cảm sau sinh (EPDS) và trò chuyện với trợ lý AI — <strong>không thay thế bác sĩ sản khoa hay nhi khoa chuyên môn</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Tuân thủ Quyền riêng tư (Nghị định 13/2023/NĐ-CP)</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Chúng tôi tuân thủ nghiêm ngặt <strong>Luật bảo vệ dữ liệu cá nhân Việt Nam (Nghị định 13/2023/NĐ-CP)</strong>.</li>
              <li>Thông tin định danh cá nhân (PII) như Họ tên, Số điện thoại, Email đăng ký được <strong>lưu trữ tách biệt vật lý và logic</strong> với dữ liệu đo lường sức khỏe nhạy cảm (như kết quả EPDS tầm soát trầm cảm, lịch sử triệu chứng thai kỳ, dữ liệu tăng trưởng của bé).</li>
              <li>Kết quả phân tích từ AI (sức khỏe tinh thần, chế độ ăn, triệu chứng) chỉ mang tính chất tham khảo cá nhân hóa.</li>
              <li>Chúng tôi cam kết không chia sẻ dữ liệu nhạy cảm của bạn cho bên thứ ba khi chưa được sự đồng ý rõ ràng.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Dữ liệu thu thập</h2>
            <p className="mb-2"><strong>Dữ liệu sức khỏe:</strong> Tuần thai, ngày dự sinh, cân nặng mẹ và bé, nhật ký triệu chứng, chỉ số EPDS, cữ bú, lượng sắt/dinh dưỡng bổ sung của bé.</p>
            <p><strong>Không thu thập:</strong> Thông tin CCCD/Hộ chiếu, tài khoản ngân hàng không liên quan thanh toán trực tiếp, danh bạ điện thoại của bạn.</p>
          </section>

          <section className="border-l-4 border-red-500 bg-red-50 p-5 rounded-lg">
            <h2 className="text-xl font-bold text-red-700 mb-2">4. Cảnh báo y tế thai kỳ khẩn cấp</h2>
            <p className="text-red-800 font-medium mb-2">
              Khi có bất kỳ dấu hiệu nguy hiểm nào dưới đây, hãy gọi ngay 115 hoặc di chuyển đến bệnh viện sản/nhi gần nhất:
            </p>
            <ul className="list-disc pl-6 text-red-800 space-y-1">
              <li>Chảy máu âm đạo bất thường (dù ít hay nhiều)</li>
              <li>Đau bụng dưới dữ dội hoặc co thắt tử cung liên tục</li>
              <li>Nhức đầu dữ dội, hoa mắt, mờ mắt hoặc sưng phù đột ngột mặt/tay/chân (tiền sản giật)</li>
              <li>Bé trong bụng giảm cử động hẳn (thai máy yếu hoặc không thấy máy)</li>
              <li>Vỡ ối sớm trước tuần thai dự sinh</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Trách nhiệm của Mẹ bầu</h2>
            <p>
              Mọi gợi ý dinh dưỡng, bài tập hay phản hồi AI chỉ là công cụ hỗ trợ thông tin. Mẹ bầu chịu trách nhiệm tham vấn bác sĩ trước khi áp dụng chế độ ăn uống, tập luyện mới hoặc thay đổi liều lượng thuốc/bổ sung vi chất.
            </p>
          </section>
        </div>

        <div className="mt-8 border-t pt-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="h-5 w-5 rounded border-gray-400 mt-0.5"
            />
            <span className="text-sm text-gray-700 leading-relaxed">
              Tôi đã đọc và đồng ý với điều khoản trên. Tôi hiểu app không thay thế tư vấn y tế
              chuyên môn.
            </span>
          </label>
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!isChecked}
            className={
              isChecked
                ? "flex w-full justify-center rounded-lg bg-[var(--saffron)] px-3 py-3 text-lg font-semibold text-white shadow-lg hover:bg-[var(--saffron-light)] hover:text-gray-900 transition"
                : "flex w-full justify-center rounded-lg bg-gray-300 px-3 py-3 text-lg font-semibold text-gray-500 cursor-not-allowed"
            }
          >
            Đồng ý & Tiếp tục đăng ký
          </button>
        </div>
      </div>
    </div>
  );
}
