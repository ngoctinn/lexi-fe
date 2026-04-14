# Tài liệu Thiết kế Kỹ thuật (Technical Design) - Lexi MVP

## 1. Kiến trúc Hệ thống
- **Frontend:** Next.js 15+ (App Router), Tailwind CSS, ShadcnUI.
- **Backend:** Serverless AWS (Lambda, API Gateway, DynamoDB) triển khai qua AWS SAM.
- **AI Integration:** OpenAI GPT-4o / Gemini 1.5 Flash cho xử lý hội thoại.
- **Hosting:** Frontend trên Vercel, Backend trên AWS.

## 2. Giải pháp Kỹ thuật cho MVP 2 tuần
### a. Xử lý Voice (Luyện nói)
- **Speech-to-Text (STT):** Sử dụng `Web Speech API` (Browser native) để nhận diện giọng nói nhanh, miễn phí và không cần cấu hình backend phức tạp cho MVP.
- **Text-to-Speech (TTS):** Sử dụng `Web Speech API` hoặc `OpenAI TTS` tùy theo chất lượng giọng nói mong muốn.
- **Visualization:** Sử dụng thư viện `framer-motion` hoặc Canvas để vẽ sóng âm (Waveform) đơn giản.

### b. Quản lý Trạng thái (State Management)
- Sử dụng **Zustand** cho các trạng thái nhẹ (Session hội thoại, UI state).
- Sử dụng **React Query (TanStack Query)** để quản lý dữ liệu từ Backend (Danh sách chủ đề, Flashcards).

### c. Database & Storage
- **DynamoDB:** Lưu thông tin người dùng, lịch sử hội thoại và Flashcards.
- **Schema Flashcards:** `userId` (PK), `wordId` (SK), `word`, `definition`, `example`, `status` (new/learning/mastered).

### d. Tích hợp Từ điển
- Sử dụng Free Dictionary API hoặc API từ backend để tra cứu và lưu trực tiếp vào Flashcard deck.

## 3. Lộ trình Triển khai 14 ngày
- **Ngày 1-3:** Thiết lập Project, Auth (Cognito/NextAuth), Giao diện khung (Layout, Sidebar).
- **Ngày 4-7:** Xử lý logic Hội thoại AI (Streaming chat, STT/TTS).
- **Ngày 8-10:** Xây dựng tính năng Tra từ và Quản lý Flashcard (Lưu/Học).
- **Ngày 11-13:** Kiểm thử (Testing), sửa lỗi UI/UX, tối ưu hóa Mobile.
- **Ngày 14:** Triển khai (Production Deployment).

## 4. Bảo mật & Hiệu năng
- Authen qua JWT/Cognito.
- Tối ưu hóa API calls bằng cách sử dụng Server Actions trong Next.js cho các tác vụ backend nhẹ.
