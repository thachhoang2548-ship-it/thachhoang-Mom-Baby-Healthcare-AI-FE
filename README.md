# Mom Ơi! - Mom & Baby Healthcare AI (Frontend) 👶💖

Chào mừng bạn đến với **Mom Ơi!** – Nền tảng hỗ trợ chăm sóc sức khỏe toàn diện cho Mẹ và Bé ứng dụng Trí tuệ nhân tạo (AI). Đây là mã nguồn ứng dụng phía Frontend, được tối ưu hóa cho giao diện mượt mà, phản hồi nhanh và tích hợp sâu với hệ thống AI thông minh.

---

## 📖 Mục Lục
1. [Tổng Quan Dự Án](#-tổng-quan-dự-án)
2. [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
3. [Kiến Trúc Thư Mục (MVC)](#-kiến-trúc-thư-mục-mvc)
4. [Các Tính Năng Chính](#-các-tính-năng-chính)
5. [Hướng Dẫn Cài Đặt & Chạy Cục Bộ](#-hướng-dẫn-cài-đặt--chạy-cục-bộ)
6. [Cấu Hình Kết Nối API Backend](#-cấu-hình-kết-nối-api-backend)
7. [Đóng Góp Ý Kiến](#-đóng-góp-ý-kiến)

---

## 🌟 Tổng Quan Dự Án

**Mom Ơi!** đồng hành cùng người mẹ qua 3 giai đoạn quan trọng của hành trình làm mẹ:
1. **Chuẩn bị mang thai (Pre-Pregnancy)**: Theo dõi chu kỳ kinh nguyệt, dự đoán ngày rụng trứng nhằm tối ưu hóa cơ hội thụ thai.
2. **Theo dõi thai kỳ (Pregnant)**: Cung cấp cột mốc phát triển của thai nhi theo từng tuần, gợi ý thực đơn, bài tập thể dục và theo dõi cân nặng của mẹ.
3. **Chăm sóc hậu sản & Nuôi con (Postpartum & Baby)**: Đánh giá trầm cảm sau sinh (EPDS), nhật ký cho bé bú, theo dõi biểu đồ tăng trưởng của bé theo chuẩn WHO.

Ngoài ra, hệ thống tích hợp **AI chẩn đoán triệu chứng** đa phương tiện (phân tích mô tả văn bản kết hợp hình ảnh triệu chứng thực tế) hỗ trợ mẹ đưa ra các chẩn đoán sơ bộ nhanh chóng.

---

## 🛠 Công Nghệ Sử Dụng

* **Core**: [React](https://react.dev/) + [Vite](https://vite.dev/) (Tốc độ khởi động và build siêu nhanh)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Hệ thống thiết kế responsive, mượt mà)
* **Quản lý trạng thái (State Management)**: [Zustand](https://zustand-demo.pmnd.rs/) (Nhẹ, tối giản, hiệu năng cao)
* **Kết nối Real-time**: [SignalR Client](https://learn.microsoft.com/en-us/aspnet/core/signalr/) (Nhận thông báo cảnh báo sức khỏe thời gian thực)
* **Icons**: [Lucide React](https://lucide.dev/)

---

## 📂 Kiến Trúc Thư Mục (MVC)

Dự án được cấu trúc theo mô hình **MVC** mở rộng để phân tách rõ ràng giữa giao diện, logic nghiệp vụ và dữ liệu:

```
Mom-Baby-Healthcare-AI-FE/
├── public/                 # Tài nguyên tĩnh (ảnh, favicon,...)
├── src/
│   ├── controllers/        # [CONTROLLER] Quản lý state logic (Zustand Stores)
│   │   ├── authController.js       # Quản lý đăng nhập, đăng ký, phiên làm việc
│   │   ├── profileController.js    # Quản lý hồ sơ sức khỏe sinh lý của mẹ
│   │   ├── symptomController.js    # Điều phối luồng phân tích triệu chứng AI
│   │   └── babyController.js       # Quản lý hồ sơ và tăng trưởng của bé
│   │
│   ├── models/             # [MODEL] Dịch vụ & Kết nối API
│   │   ├── api/
│   │   │   └── axiosClient.js      # Axios Client cấu hình token tự động
│   │   └── services/
│   │       ├── authService.js      # Gọi API xác thực tài khoản
│   │       ├── symptomService.js   # Gọi API chẩn đoán triệu chứng của C#
│   │       └── babyService.js      # Gọi API quản lý bé
│   │
│   ├── views/              # [VIEW] Giao diện người dùng
│   │   ├── components/     # Các thành phần giao diện dùng chung (layout, cards,...)
│   │   │   ├── layout/
│   │   │   │   └── AppShell.jsx    # Khung layout chính (Sidebar, Header, Ambient Lights)
│   │   │   └── symptom/
│   │   │       └── AnalysisResult.jsx # Thành phần hiển thị chẩn đoán AI
│   │   └── pages/          # Các trang chính của hệ thống
│   │       ├── auth/               # LoginPage, RegisterPage
│   │       ├── baby/               # Theo dõi chiều cao cân nặng bé sơ sinh
│   │       ├── fertility/          # Lịch rụng trứng, chu kỳ
│   │       ├── pregnancy/          # Dashboard thai kỳ, dinh dưỡng, bài tập
│   │       ├── DashboardOverviewPage.jsx # Trang tổng quan sau khi đăng nhập
│   │       ├── LandingPage.jsx     # Trang giới thiệu (chưa đăng nhập)
│   │       └── ProfilePage.jsx     # Trang cập nhật hồ sơ chỉ số của mẹ
│   │
│   ├── hooks/              # Custom Hooks (SignalR alerts listener)
│   ├── utils/              # Các hàm bổ trợ
│   ├── App.jsx             # Cấu hình Routing chính
│   └── main.jsx            # Điểm khởi chạy của React
├── .env                    # File cấu hình môi trường cục bộ (được bỏ qua bởi Git)
├── .env.example            # Bản mẫu cấu hình môi trường đưa lên Git
└── package.json            # Danh sách thư viện phụ thuộc
```

---

## ✨ Các Tính Năng Chính

* **Định vị lộ trình thông minh**: Tự động tùy biến giao diện Sidebar, Dashboard tùy theo giai đoạn thai kỳ của người mẹ.
* **Giao diện Ambient Light & Glassmorphism cao cấp**: Tạo cảm giác thư giãn, hiện đại và sang trọng cho người mẹ khi trải nghiệm.
* **Tính toán BMI tự động**: Chỉ cần nhập Chiều cao & Cân nặng, hệ thống tự động tính toán chỉ số BMI hiển thị tức thì.
* **Chẩn đoán AI nâng cao**: Hỗ trợ đính kèm hình ảnh triệu chứng. Dữ liệu ảnh được chuyển đổi dưới dạng base64 gửi an toàn lên Backend .NET kết nối trực tiếp với mô hình Gemini AI.
* **Nhận thông báo Real-time**: Kết nối WebSocket thông qua SignalR để cảnh báo các chỉ số sức khỏe nguy cấp ngay lập tức.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### 1. Chuẩn Bị Môi Trường
Đảm bảo máy tính của bạn đã cài đặt **Node.js** (Phiên bản gợi ý: >= 18.0.0).

### 2. Tải Mã Nguồn & Cài Đặt Thư Viện
Mở terminal và chạy chuỗi lệnh sau:
```bash
# Clone dự án từ GitHub
git clone https://github.com/thachhoang2548-ship-it/thachhoang-Mom-Baby-Healthcare-AI-FE.git

# Di chuyển vào thư mục dự án
cd thachhoang-Mom-Baby-Healthcare-AI-FE

# Cài đặt các thư viện phụ thuộc
npm install
```

### 3. Tạo Cấu Hình Môi Trường (.env)
Tạo một file `.env` ở thư mục gốc của dự án (hoặc nhân bản từ file `.env.example`) và định cấu hình cổng kết nối tới API Backend:
```env
VITE_API_URL=http://localhost:5265
VITE_NODE_API_URL=http://localhost:5265
```

### 4. Khởi Chạy Dự Án Chế Độ Phát Triển (Development)
```bash
npm run dev
```
Sau khi chạy thành công, truy cập trình duyệt theo địa chỉ: `http://localhost:5173` (hoặc cổng hiển thị trong Terminal của bạn).

### 5. Build Sản Phẩm (Production)
```bash
npm run build
```
Kết quả build tối ưu hóa sẽ nằm trong thư mục `/dist` sẵn sàng để triển khai lên Vercel, Netlify hoặc Docker.

---

## 🔌 Cấu Hình Kết Nối API Backend

* Ứng dụng Frontend này kết nối trực tiếp với dự án **MomOi.API (C# Web API)** chạy tại cổng mặc định `5265` (HTTP) hoặc `7228` (HTTPS).
* Đảm bảo rằng dự án backend đã được khởi động và cơ sở dữ liệu PostgreSQL đã được cài đặt & chạy trước khi thao tác trên ứng dụng Frontend để các tính năng đăng nhập, cập nhật hồ sơ mẹ, chẩn đoán AI hoạt động trơn tru.

---

## 🤝 Đóng Góp Ý Kiến
Mọi đóng góp, báo cáo lỗi hoặc đề xuất tính năng mới xin vui lòng tạo **Issue** hoặc gửi **Pull Request** trực tiếp tại kho chứa này.

*Chúc các mami và bé luôn khỏe mạnh cùng **Mom Ơi!** ❤️*
