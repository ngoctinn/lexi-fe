# Tài liệu Yêu cầu Sản phẩm (PRD) - Lexi MVP

## 1. Tổng quan Sản phẩm
- **Tên sản phẩm:** Lexi
- **Tagline:** Luyện nói tiếng Anh thông minh cùng AI kết hợp Flashcard.
- **Mục tiêu ra mắt:** Hoàn thiện bản MVP chạy ổn định, không lỗi UI/UX trong vòng 2 tuần.
- **Giá trị cốt lõi:** Giúp sinh viên và người đi làm vượt qua rào cản giao tiếp bằng cách thực hành nói với AI và ghi nhớ từ vựng tức thì qua Flashcard.

## 2. Đối tượng mục tiêu & Nhu cầu
- **Đối tượng:** Sinh viên và người đi làm bận rộn.
- **Nhu cầu chính:** 
    - Cần môi trường thực hành nói tiếng Anh không áp lực.
    - Cần công cụ lưu trữ từ vựng mới phát sinh trong lúc hội thoại để ôn tập (Flashcard).
    - Cần giao diện dễ sử dụng, tập trung tối đa vào việc học.

## 3. Luồng người dùng (User Journey)
1. **Khám phá & Nhập cuộc:** Người dùng truy cập Trang chủ -> Đăng nhập hệ thống.
2. **Thiết lập phiên học:** Chọn chủ đề giao tiếp mong muốn (ví dụ: Công sở, Du lịch, Đời sống).
3. **Thực hành:** Bắt đầu hội thoại với AI (hỗ trợ cả giọng nói và văn bản).
4. **Hỗ trợ tức thì:** Tra cứu từ vựng mới ngay trong khung chat khi gặp khó khăn.
5. **Củng cố:** Kết thúc hoặc trong lúc nói, lưu các từ đã tra/từ mới vào hệ thống Flashcard cá nhân.

## 4. Danh sách Tính năng MVP (Phạm vi 2 tuần)
### Tính năng Bắt buộc (Must-Have)
- **Hệ thống xác thực (Auth):** Đăng nhập để lưu trữ dữ liệu cá nhân.
- **Quản lý chủ đề:** Danh sách các chủ đề hội thoại đa dạng cho người dùng lựa chọn.
- **Giao diện Hội thoại AI:** 
    - Chatbot hỗ trợ Voice-to-Text và Text-to-Speech.
    - Hiển thị transcript thời gian thực.
- **Từ điển tích hợp:** Tính năng tra từ nhanh ngay tại giao diện hội thoại.
- **Hệ thống Flashcard:** 
    - Lưu từ vựng từ cuộc hội thoại vào bộ bài (deck).
    - Giao diện học Flashcard cơ bản (SRS).

### Tính năng sẽ phát triển sau (Backlog / v2)
- Phân tích chi tiết lỗi phát âm sâu (Pronunciation Assessment).
- Bảng xếp hạng, thi đấu (Gamification).
- Nhắc nhở học tập qua thông báo/email.

## 5. Định hướng Thiết kế & UX
- **Phong cách:** Tuân thủ chặt chẽ các Component Template và Style hiện có của dự án.
- **Nguyên tắc:** 
    - Tối giản, tránh gây xao nhãng.
    - Tốc độ phản hồi nhanh (đặc biệt là phần xử lý âm thanh).
    - Thân thiện với cả thiết bị Web Desktop và tối ưu hiển thị trên Mobile.

## 6. Cấu trúc Kỹ thuật (Technical Considerations)
- **Frontend:** Next.js, Tailwind CSS, ShadcnUI.
- **Backend:** Kiến trúc Serverless sử dụng AWS SAM (đã có thiết kế riêng).
- **API:** Kết nối với các dịch vụ AI (LLM) và Speech-to-Text qua API backend.

## 7. Thước đo thành công
- Ứng dụng hoạt động mượt mà, không gặp lỗi logic trong luồng chính từ Đăng nhập đến lưu Flashcard.
- Giao diện nhất quán với thiết kế mẫu.
- Thời gian phản hồi của AI phù hợp cho một cuộc hội thoại tự nhiên.

## 8. Định nghĩa Hoàn thành (Definition of Done)
- Code đã được kiểm tra trên môi trường dev (`pnpm dev`).
- Toàn bộ luồng User Journey hoạt động không lỗi.
- File Spec và Tài liệu hướng dẫn được cập nhật.
