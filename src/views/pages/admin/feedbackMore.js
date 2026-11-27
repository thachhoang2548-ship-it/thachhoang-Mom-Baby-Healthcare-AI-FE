const names = [
  'Bảo Anh', 'Minh Anh', 'Khánh An', 'Ngọc Anh', 'Thùy Anh',
  'Hải Yến', 'Hoài An', 'Phúc An', 'Tú Anh', 'Thanh An',
  'Kim Ngân', 'Thùy Dương', 'Ngọc Hà', 'Thanh Huyền', 'Phương Linh',
  'Mai Phương', 'Bích Ngọc', 'Hồng Nhung', 'Quỳnh Anh', 'Thảo Vy',
  'Mỹ Linh', 'Ngọc Trâm', 'Thu Hằng', 'Diệu Linh', 'Thanh Trúc',
  'Hà My', 'Hồng Ánh', 'Ngọc Diệp', 'Thảo Nguyên', 'Trúc Linh',
  'Tường Vy', 'Gia Hân', 'Bảo Ngọc', 'Khánh Linh', 'Mỹ Duyên',
  'Minh Châu', 'Ái Vân', 'Thục Anh', 'Nhã Uyên', 'Phương Thảo',
  'Kiều Oanh', 'Diệu Anh', 'Tuyết Mai', 'Hoàng Yến', 'Trà My',
  'Hồng Hạnh', 'Lệ Thu', 'Kim Chi', 'Ngọc Quỳnh', 'Cẩm Tú',
  'Thanh Mai', 'Bảo Trân', 'Hương Giang', 'Thu Trang', 'Huyền My',
  'Ngọc Lan', 'Xuân Nhi', 'Thiên Kim', 'Diệu Hương', 'Hạnh Nguyên',
  'Thùy Linh', 'Khánh Vy', 'Minh Ngọc', 'Yến Nhi', 'Hoài Thương',
  'Mỹ Anh', 'Phương Nhi', 'Thanh Thảo', 'Bảo Hân', 'Ngọc Nhi',
];

const groups = [
  { category: 'Idea', page: '/pregnancy', messages: [
    'Mong có lịch nhắc xét nghiệm theo từng giai đoạn thai kỳ.',
    'Sẽ tiện hơn nếu ghi chú được cảm nhận của mình theo từng tuần thai.',
    'Mình muốn so sánh các mốc khám thai trên cùng một màn hình.',
    'Mong có danh sách những việc cần chuẩn bị trước ngày dự sinh.',
    'Có thể thêm mục lưu câu hỏi để mang theo khi đi khám thai không?',
  ] },
  { category: 'Content', page: '/pregnancy', messages: [
    'Thông tin về sự phát triển của bé theo tuần rất dễ đọc.',
    'Mình thích cách giải thích các thay đổi trong thai kỳ ngắn gọn.',
    'Các gợi ý vận động nhẹ giúp mình lên kế hoạch mỗi ngày.',
    'Phần lưu ý về dinh dưỡng thai kỳ trình bày khá rõ.',
    'Mình thường mở lại các bài viết theo tuần để theo dõi.',
  ] },
  { category: 'Idea', page: '/baby', messages: [
    'Mong có chỗ ghi lại những từ đầu tiên bé biết nói.',
    'Mình muốn thêm ảnh vào các mốc phát triển của bé.',
    'Có thể thêm nhắc lịch cân đo bé mỗi tháng không?',
    'Sẽ tiện nếu hai người trong gia đình cùng cập nhật hồ sơ bé.',
    'Mong có bảng tóm tắt chiều cao và cân nặng theo năm.',
  ] },
  { category: 'Content', page: '/baby', messages: [
    'Mục theo dõi tăng trưởng giúp mình xem lại các mốc của bé.',
    'Bài viết về giấc ngủ của trẻ nhỏ có nhiều mẹo dễ áp dụng.',
    'Hướng dẫn chăm sóc bé theo từng tháng khá trực quan.',
    'Mình thích phần giải thích các cột mốc phát triển.',
    'Nội dung về lịch tiêm giúp mình chuẩn bị trước mỗi lần khám.',
  ] },
  { category: 'Idea', page: '/nutrition', messages: [
    'Mong có danh sách mua sắm từ thực đơn đã chọn.',
    'Mình muốn lọc công thức theo thời gian chuẩn bị bữa ăn.',
    'Có thể đánh dấu những món bé đã thử chưa?',
    'Sẽ hay nếu lưu được khẩu phần phù hợp cho từng bé.',
    'Mong có gợi ý thay thế nguyên liệu khi bé bị dị ứng.',
  ] },
  { category: 'Content', page: '/nutrition', messages: [
    'Các món ăn dặm được chia theo tháng tuổi rất tiện tra cứu.',
    'Mình thích những công thức có nguyên liệu dễ tìm.',
    'Phần hướng dẫn chuẩn bị bữa ăn khá dễ làm theo.',
    'Gợi ý thực đơn giúp mình đỡ mất thời gian nghĩ món.',
    'Thông tin về nhóm thực phẩm được trình bày rõ ràng.',
  ] },
  { category: 'Idea', page: '/postpartum', messages: [
    'Mong có thêm nhắc nghỉ ngơi trong giai đoạn sau sinh.',
    'Mình muốn ghi lại tâm trạng hằng ngày trong một biểu đồ.',
    'Có thể thêm danh sách việc cần hỏi trong lần tái khám không?',
    'Sẽ hữu ích nếu có mục theo dõi thời gian ngủ của mẹ.',
    'Mong có bài tập thư giãn ngắn cho những lúc rảnh.',
  ] },
  { category: 'Content', page: '/postpartum', messages: [
    'Bài viết chăm sóc sau sinh có giọng văn gần gũi.',
    'Mình thấy mục theo dõi sức khỏe sau sinh dễ sử dụng.',
    'Các gợi ý nghỉ ngơi ngắn khá phù hợp khi chăm bé.',
    'Thông tin về hồi phục sau sinh được sắp xếp dễ tìm.',
    'Mình thích những lời nhắc chăm sóc bản thân trong ứng dụng.',
  ] },
  { category: 'Bug', page: '/profile', messages: [
    'Nút lưu hồ sơ đôi khi cần chờ vài giây mới báo thành công.',
    'Ảnh đại diện có lúc chưa đổi ngay sau khi mình tải lên.',
    'Trang thông tin cá nhân hơi chậm khi mở bằng mạng di động.',
    'Sau khi sửa tên mình phải tải lại trang mới thấy cập nhật.',
    'Bàn phím che mất nút lưu trên một số màn hình nhỏ.',
  ] },
  { category: 'Idea', page: '/profile', messages: [
    'Mong có tùy chọn thay đổi cỡ chữ trong phần cài đặt.',
    'Mình muốn tự chọn những mục thường dùng trên trang chủ.',
    'Có thể thêm chế độ nền tối theo giờ trong ngày không?',
    'Sẽ tiện nếu có một trang tổng hợp các ghi chú cá nhân.',
    'Mong có cách tải bản sao dữ liệu của mình.',
  ] },
  { category: 'Bug', page: '/feedback', messages: [
    'Ô nhập góp ý hơi nhỏ khi mình viết nội dung dài.',
    'Mình chưa thấy xác nhận rõ sau khi gửi góp ý trên điện thoại.',
    'Danh mục góp ý đôi khi về mục đầu khi quay lại trang.',
    'Nút gửi góp ý có lúc phải bấm hai lần mới phản hồi.',
    'Trang góp ý cuộn hơi nhanh trên màn hình nhỏ.',
  ] },
  { category: 'Idea', page: '/feedback', messages: [
    'Mong xem lại được những góp ý mình đã gửi.',
    'Có thể thêm mục đính kèm ảnh khi báo lỗi không?',
    'Sẽ tiện hơn nếu biết góp ý đã được nhóm phát triển đọc.',
    'Mình muốn chọn nhiều chủ đề cho cùng một góp ý.',
    'Mong có hướng dẫn ngắn về cách mô tả lỗi rõ hơn.',
  ] },
  { category: 'Content', page: '/feedback', messages: [
    'Giao diện nhìn dịu mắt và các mục khá dễ tìm.',
    'Mình thấy ứng dụng hữu ích khi cần tra cứu nhanh.',
    'Các trang có bố cục nhất quán nên dễ làm quen.',
    'Nội dung được viết ngắn gọn, phù hợp để đọc trên điện thoại.',
    'Mình thích cách ứng dụng gom thông tin mẹ và bé một chỗ.',
  ] },
  { category: 'Idea', page: '/baby', messages: [
    'Mong có nhắc chuẩn bị đồ dùng trước lịch tiêm của bé.',
    'Có thể thêm bộ lọc theo độ tuổi ở mục bài viết cho bé không?',
    'Mình muốn xem lại các lần bé ốm theo dòng thời gian.',
    'Sẽ tốt nếu có chỗ lưu lời dặn của bác sĩ sau buổi khám.',
    'Mong có một bản tổng kết các mốc phát triển mỗi năm.',
  ] },
];

export default groups.flatMap((group, groupIndex) =>
  group.messages.map((body, messageIndex) => {
    const index = groupIndex * 5 + messageIndex;
    return {
      n: index + 31,
      name: names[index],
      category: group.category,
      page: group.page,
      body,
    };
  })
);
