# Hướng Dẫn Luồng Hoạt Động & Giải Thích Thư Viện (Packages) 📚🌸

Tài liệu này giải thích chi tiết về **kiến trúc**, **luồng vận hành nghiệp vụ chính (Operational Flows)** và **ý nghĩa của các thư viện (packages)** được sử dụng trong dự án Frontend **Mom Ơi!**.

---

## 🏗️ 1. Mô Hình Kiến Trúc Hệ Thống (MVC)

Dự án Frontend được xây dựng theo mô hình **MVC (Model-View-Controller)** mở rộng nhằm phân tách rõ ràng trách nhiệm giữa giao diện và logic:

* **Model (Service Layer - `src/models/services/`)**:
  * Chịu trách nhiệm trực tiếp gọi API tới Backend C# ASP.NET Core qua Axios.
  * Định cấu hình đóng gói dữ liệu đầu vào và chuyển tiếp dữ liệu đầu ra cho Controller.
* **Controller (State Management - `src/controllers/`)**:
  * Sử dụng thư viện **Zustand** để tạo các Global Stores.
  * Quản lý trạng thái toàn cục (ví dụ: thông tin đăng nhập, hồ sơ sức khỏe mẹ bầu, danh sách thực đơn).
  * Điều phối các hành động (Actions) tương tác với Service Layer và cập nhật giao diện.
* **View (UI Layer - `src/views/`)**:
  * Các trang (`pages`) và thành phần giao diện (`components`).
  * Chỉ tập trung vào việc render giao diện người dùng mượt mà và đón nhận các tương tác cơ bản của người dùng (clicks, form submits).

---

## 🔄 2. Chi Tiết Các Luồng Hoạt Động Chính (Operational Flows)

### 🔑 Luồng 2.1: Xác Thực & Phân Quyền Vai Trò (Authentication & Role Portal)
1. **Đăng nhập**: Người dùng nhập tài khoản/mật khẩu và gửi yêu cầu đăng nhập.
2. **Nhận Token & Vai Trò**: Backend trả về mã token JWT cùng danh sách vai trò của người dùng (`user.roles` ví dụ: `["Admin"]`, `["Expert"]`, `["Staff"]`, `["Mom"]`).
3. **Phân quyền giao diện (AppShell.jsx)**: 
   * Trình điều hướng Sidebar tự động quét danh sách vai trò này để quyết định bố cục hiển thị.
   * **Admin (`admin@momoi.com`)**: Menu hiển thị duy nhất **Quản Trị Admin ⚙️**.
   * **Expert (`expert@momoi.com`)**: Menu hiển thị duy nhất **Duyệt AI & Tư Vấn 🩺**.
   * **Staff (`staff@momoi.com`)**: Menu hiển thị duy nhất **Cổng Care Staff 🏥**.
   * **Mom (Tài khoản thường)**: Hiển thị đầy đủ chức năng thai sản (Theo dõi chu kỳ, thai kỳ, hậu sản, sự phát triển của bé, chẩn đoán AI).
4. **Auto-Redirect**: Nếu tài khoản đặc trị truy cập vào trang Dashboard chung `/dashboard`, hệ thống sẽ tự động chuyển hướng họ đến đúng cổng làm việc của họ.

### 🩺 Luồng 2.2: Quy Trình Kiểm Duyệt Thực Đơn AI (AI Recipe Approval Workflow)
Để đảm bảo an toàn dinh dưỡng cho Mẹ bầu, công thức do AI tạo ra phải trải qua quy trình duyệt chặt chẽ từ Chuyên gia trước khi hiển thị:
1. **Yêu cầu tạo thực đơn**: Mẹ bầu nhập sở thích/dị ứng để tạo thực đơn.
2. **AI sinh bản nháp**: Hệ thống Backend kết nối với Gemini AI để tạo ra thực đơn nháp và lưu vào Database dưới trạng thái **`PendingReview` (Chờ duyệt)**. Lúc này, Mẹ bầu **chưa thể nhìn thấy** thực đơn này.
3. **Chuyên gia kiểm duyệt**:
   * Tài khoản Chuyên gia (`Medical Expert`) truy cập cổng `/expert`.
   * Giao diện tải danh sách công thức đang chờ duyệt (`GET /api/expert/recipes/pending`).
   * Chuyên gia kiểm tra thành phần, nếu đạt chuẩn thì bấm **"Chấp Thuận & Phát Hành"** (`isApproved = true`). Nếu không đạt, bấm **"Từ Chối"** và nhập lý do y khoa.
4. **Phát hành cho Mẹ**: Chỉ sau khi được Chuyên gia duyệt, thực đơn mới đổi trạng thái thành `Approved` và chính thức xuất hiện trên Dashboard/Thực đơn của Mẹ bầu.

### 🧠 Luồng 2.3: Chẩn Đoán Triệu Chứng AI (Image & Text Symptom Analyzer)
1. **Tải dữ liệu**: Mẹ bầu nhập mô tả triệu chứng sức khỏe bằng chữ, kết hợp tải lên hình ảnh triệu chứng thực tế (ví dụ: phát ban da, sưng phù).
2. **Chuyển đổi ảnh**: Frontend mã hóa tệp hình ảnh thành dạng chuỗi văn bản **Base64** và đính kèm vào yêu cầu.
3. **AI Phân tích**: Backend .NET tiếp nhận dữ liệu văn bản và ảnh Base64, gửi trực tiếp đến mô hình **Gemini AI** để phân tích.
4. **Hiển thị kết quả**: Trình bày báo cáo chi tiết về mức độ nghiêm trọng (Thường/Cảnh báo), khuyến nghị dinh dưỡng/nghỉ ngơi phù hợp và hướng dẫn khám chữa bệnh.

### ⚡ Luồng 2.4: Nhận Cảnh Báo Sức Khỏe Thời Gian Thực (SignalR WebSockets)
1. Khi Mẹ bầu ghi nhận các chỉ số sinh lý hàng ngày (Đường huyết, Huyết áp) bất thường vượt ngưỡng an toàn.
2. Backend phân tích và ngay lập tức gửi một tín hiệu cảnh báo khẩn cấp thông qua cổng kết nối **SignalR Hub**.
3. **SignalR Client** tại Frontend (chạy qua Custom Hooks kết nối ngầm) nhận tín hiệu ngay tức thì và kích hoạt tiếng chuông cảnh báo cũng như hiển thị thông báo đỏ trên màn hình của Mẹ bầu và màn hình của **Care Staff** để kịp thời hỗ trợ.

---

## 🛠️ 3. Giải Thích Chi Tiết Các Thư Viện Sử Dụng (Packages)

Các thư viện chính được liệt kê trong `package.json` và vai trò của chúng trong dự án:

### 🌐 3.1. Nhóm Core & Điều Hướng (Routing)
* **`react` & `react-dom`**: Thư viện lõi để xây dựng giao diện ứng dụng dưới dạng các Component độc lập, tái sử dụng cao.
* **`react-router-dom`**: Bộ thư viện quản lý định tuyến (Routing). Giúp tạo cấu trúc Single Page Application (SPA), chuyển trang không bị giật, tải lại trang web, duy trì trạng thái ứng dụng ổn định.

### 📦 3.2. Nhóm Kết Nối API & Trạng Thái (State & Data Flow)
* **`zustand`**: Công cụ quản lý trạng thái toàn cục cực kỳ nhẹ (chỉ vài KB), hiệu năng cao. Nó giúp lưu trữ trạng thái đăng nhập của người dùng (`authController`), thông tin hồ sơ của Mẹ (`profileController`), và trạng thái triệu chứng để phân phối cho các trang mà không gặp hiện tượng "prop drilling".
* **`axios`**: Trình khách HTTP Client mạnh mẽ. Được cấu hình interceptors để tự động chèn JWT Token vào tiêu đề (Header) của mỗi request gửi lên server C#, xử lý tự động khi token hết hạn.
* **`@microsoft/signalr`**: Thư viện kết nối WebSocket thời gian thực của Microsoft. Được dùng để duy trì kết nối liên tục giữa Client và C# Hub, truyền phát các thông báo y tế khẩn cấp ngay tức thì.

### 📊 3.3. Nhóm Thiết Kế & Biểu Đồ (UI & Charts)
* **`lucide-react`**: Bộ icon dạng vector hiện đại, mượt mà và nhẹ, phù hợp hoàn hảo với phong cách thiết kế kính mờ (Glassmorphism) của Mom Ơi!.
* **`recharts` & `chart.js`**: Thư viện vẽ biểu đồ đáp ứng (responsive). Dùng để vẽ các biểu đồ theo dõi cân nặng của mẹ bầu theo từng tuần thai và biểu đồ chiều cao, cân nặng của bé theo quy chuẩn WHO.
* **`react-hot-toast`**: Hộp thoại thông báo nổi (toast notifications) đẹp mắt, có hiệu ứng chuyển động mượt mà để báo cáo kết quả đăng ký, cập nhật hồ sơ thành công hoặc lỗi.
* **`react-markdown` & `remark-gfm`**: Dùng để biên dịch (render) các đoạn văn bản có định dạng Markdown do Gemini AI trả về từ Backend để hiển thị đẹp mắt, ngăn nắp trên giao diện.

### 📝 3.4. Nhóm Quản Lý Biểu Mẫu (Form & Validation)
* **`react-hook-form` & `zod`**: Giúp quản lý trạng thái nhập liệu của các ô Input trong Form (Đăng ký, Khảo sát sức khỏe). Hỗ trợ kiểm duyệt định dạng dữ liệu đầu vào cực kỳ bảo mật và tối ưu hiệu năng render của React.
