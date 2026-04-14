# AGENTS.md - Hướng dẫn Trợ lý AI cho Dự án Lexi

Tài liệu này đóng vai trò là "bộ não" trung tâm cho bất kỳ AI Agent nào (Antigravity, Claude, Cursor) đang hỗ trợ phát triển dự án Lexi.

## 1. Tổng quan Dự án
- **Tên:** Lexi
- **Mục tiêu:** MVP Web App luyện nói tiếng Anh với AI + Flashcard.
- **Thời hạn:** 2 tuần (Hoàn thành trước 28/04/2026).
- **Trình độ User:** Nhóm C (Cần giải thích rõ mã nguồn và lý do chọn giải pháp).

## 2. Tech Stack & Tiêu chuẩn Code
- **Framework:** Next.js 15+ (App Router).
- **Styling:** Tailwind CSS + ShadcnUI (Ưu tiên dùng component mẫu có sẵn của dự án).
- **Backend:** AWS SAM (Serverless).
- **State:** Zustand / React Query.
- **AI:** OpenAI GPT/Gemini API (Voice via Web Speech API).

## 3. Các Giai đoạn Triển khai (Phases)

### Giai đoạn 1: Nền tảng (Ngày 1-3)
- [x] Cấu hình project, setup Auth (Cognito/Amplify).
- [x] Xây dựng Layout Dashboard theo phong cách chuyên nghiệp/tối giản.

### Giai đoạn 2: Lõi tính năng - Hội thoại AI (Ngày 4-7)
- [x] Cấu hình State Management (Zustand + React Query) & Optimistic UI.
- [x] Giao diện chat trực quan với Transcript thời gian thực.
- [ ] Hoàn thiện Speech-to-Text và Text-to-Speech (S3-based pipeline).
- [ ] Animation sóng âm (Visualizer).

### Giai đoạn 3: Flashcard & Từ điển (Ngày 8-10)
- [ ] Tích hợp tính năng tra từ nhanh trong hội thoại.
- [ ] Logic lưu từ vựng vào DynamoDB (Backend integrated).
- [ ] Giao diện học Flashcard (Flip card, SRS simple).

### Giai đoạn 4: Hoàn thiện & UI/UX (Ngày 11-14)
- [ ] Rà soát toàn bộ lỗi (Bug hunting).
- [ ] Tối ưu hóa trải nghiệm di động.
- [ ] Deploy bản Production.

## 4. Nguyên tắc cho AI Agent
- **Giao diện là trên hết:** Luôn tạo ra UI đẹp, hiện đại, mượt mà (premium feel). Không dùng placeholder.
- **Clean Code Frontend:** Tuân thủ các nguyên tắc Clean Code (SOLID, DRY), chia nhỏ component, sử dụng TypeScript đúng cách và tối ưu Server/Client Components.
- **Quy tắc "Docs First":** TRƯỚC KHI refactor hoặc viết mã mới cho Next.js, AI Agent **BẮT BUỘC** phải:
    1. Sử dụng công cụ `nextjs_docs` để đọc tài liệu chính thức từ `nextjs-docs://llms-index`.
    2. Sử dụng `nextjs_index` để kiểm tra runtime hiện tại của ứng dụng.
    3. Luôn nghiên cứu giải pháp đúng chuẩn (Optimal) thay vì giải pháp tạm thời.
- **ShadcnUI:** Luôn ưu tiên dùng `npx shadcn@latest add` cho các component mới.
- **Ghi chú:** Viết comment code và giải thích rõ ràng bằng tiếng Việt để người dùng dễ theo dõi và học hỏi.
- **Quy trình:** Kiểm tra trạng thái hiện tại của file qua `view_file` trước khi sửa đổi. Luôn chạy `pnpm dev` và kiểm tra lỗi qua trình duyệt nếu cần.

## 5. Định nghĩa Hoàn thành (Definition of Done)
- Tính năng hoạt động đúng logic đã mô tả trong PRD.
- Không có lỗi linter/compiler.
- UI đáp ứng tốt trên mobile và desktop.
