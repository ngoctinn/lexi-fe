# Tài liệu Đặc tả Dự án: Lexi AI English Learning Platform

## 🌟 Tổng Quan
Lexi là một nền tảng học tiếng Anh cao cấp được hỗ trợ bởi AI, giúp người dùng cải thiện kỹ năng nghe, nói và từ vựng thông qua các cuộc hội thoại tự nhiên với AI và hệ thống Flashcards thông minh (SRS).

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)
- **Framework**: [Next.js 16.2.0](https://nextjs.org) (App Router)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com) (Preset: `radix-nova`)
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Quản lý Trạng thái & Dữ liệu**: React 19, Recharts (Thống kê), Sonner (Thông báo)
- **Trình quản lý gói**: `pnpm`
- **Kiến trúc**: Feature-based Architecture (Kiến trúc dựa trên tính năng)

---

## 🎯 Danh sách User Stories

### 1. Tài khoản & Thông tin cá nhân
- **Đăng ký**: Đăng ký qua email hoặc mạng xã hội (Google, Facebook).
- **Đăng nhập**: Truy cập an toàn vào tiến trình học tập.
- **Quên mật khẩu**: Khôi phục quyền truy cập qua email.
- **Quản lý hồ sơ**: Chỉnh sửa tên hiển thị, ảnh đại diện và trình độ tiếng Anh.
- **Đăng xuất**: Thoát tài khoản an toàn trên mọi thiết bị.

### 2. Học tập & Hội thoại AI
- **Chọn chủ đề**: Hội thoại theo các tình huống thực tế (du lịch, công việc, mua sắm).
- **Đóng vai (Roleplay)**: AI đóng vai nhân vật cụ thể (nhân viên khách sạn, người phỏng vấn...).
- **Giao tiếp giọng nói**: Trò chuyện trực tiếp bằng giọng nói để luyện phản xạ.
- **Gợi ý câu trả lời**: AI đưa ra gợi ý khi người dùng bị bí ý tưởng.
- **Hệ thống sửa lỗi**: Nhận xét ngữ pháp và phát âm ngay sau mỗi câu nói.
- **Điều chỉnh tốc độ**: Tùy chỉnh tốc độ nói của AI nhanh hoặc chậm.
- **Bản dịch**: Xem nghĩa tiếng Việt của các câu thoại phức tạp.
- **Đánh giá**: Nhận điểm số độ lưu loát sau mỗi đoạn hội thoại.
- **Nghe lại**: Xem lại bản ghi âm để tự nhận xét phát âm.

### 3. Hệ thống Flashcards thông minh (SRS)
- **Tự động xử lý**: Hiển thị nghĩa, phiên âm và ví dụ khi nhập từ mới.
- **Lưu nhanh**: Thêm từ vựng mới từ hội thoại AI vào bộ thẻ học ngay lập tức.
- **Lặp lại ngắt quãng (SRS)**: Tự động nhắc nhở ôn tập tối ưu trí nhớ dài hạn.
- **Phân loại**: Sắp xếp flashcard theo bộ (IELTS, TOEIC, Giao tiếp...).
- **Đa phương tiện**: Thêm hình ảnh và âm thanh phát âm vào mỗi thẻ.
- **Luyện tập đa dạng**: Học qua trắc nghiệm, viết lại từ hoặc lật thẻ.
- **Tìm kiếm**: Tra cứu nhanh trong hàng nghìn flashcard đã tạo.

### 4. Động lực & Đồng bộ
- **Hệ thống Streak**: Theo dõi số ngày học liên tiếp trên trang chủ.
- **Thông báo**: Nhắc lịch học trước 15 phút theo khung giờ cài đặt.
- **Đồng bộ**: Dữ liệu nhất quán giữa máy tính và điện thoại.
- **Báo cáo tuần**: Email tổng kết các lỗi sai thường gặp và tiến độ.

### 5. Quản trị viên (Admin)
- **Quản lý người dùng**: Xem, khóa hoặc mở khóa tài khoản.
- **Quản lý nội dung**: Cập nhật và làm mới danh sách chủ đề hội thoại.
- **Theo dõi chỉ số**: Thống kê thời gian sử dụng, số flashcard được tạo.
- **Cấu hình API**: Điều chỉnh giới hạn ký tự, tốc độ phản hồi của AI.
- **Thư viện mẫu**: Quản lý kho hình ảnh và âm thanh mẫu cho flashcard.
- **Báo cáo lỗi**: Nhận và theo dõi các thông báo lỗi từ người dùng.

---

## 🏗️ Cấu trúc thư mục (Project Structure - Best Practice)
Dự án tuân thủ kiến trúc **Feature-based Architecture** giúp dễ dàng mở rộng và bảo trì.

```
/
├── .agents/                # Tài liệu và cấu hình AI Agents hỗ trợ code
├── app/                    # Next.js App Router (Routing, Layouts, Server Components)
│   ├── (marketing)/        # Nhóm route công khai (Landing page, giới thiệu)
│   ├── (app)/              # Nhóm route ứng dụng (Dashboard, Chat, Flashcards)
│   │   ├── layout.tsx      # Bố cục chính sau khi đăng nhập (Sidebar, Header)
│   │   └── ...
│   ├── api/                # Route chuyển tiếp API từ Frontend
│   ├── favicon.ico
│   ├── globals.css         # CSS gốc và cấu hình CSS Variables (Tailwind 4)
│   └── layout.tsx          # Bố cục gốc toàn cục (Providers, Fonts)
├── features/               # Module hóa theo tính năng (Trái tim của ứng dụng)
│   ├── [feature-name]/     # Ví dụ: auth, chat, flashcards, profile
│   │   ├── api/            # Các hàm gọi API/Services riêng của tính năng
│   │   ├── components/     # Các UI Components chỉ dùng cho tính năng này
│   │   ├── hooks/          # React Hooks xử lý logic riêng của tính năng
│   │   ├── types/          # TypeScript definitions cho tính năng
│   │   ├── actions.ts      # Next.js Server Actions cho tính năng
│   │   └── index.ts        # Public API cho các feature khác sử dụng
├── components/             # UI Components dùng chung toàn dự án
│   ├── ui/                 # Atomic components (shadcn/ui primitives)
│   ├── shared/             # Các components phức tạp dùng chung (Header, Footer, Nav)
│   └── icons/              # File quản lý icon (nếu dùng hệ thống icon riêng)
├── hooks/                  # Global React Hooks (use-media-query, use-local-storage)
├── lib/                    # Cấu hình và thư viện hạ tầng dùng chung
│   ├── utils.ts            # Các function tiện ích (cn, formatDate...)
│   ├── configs/            # File cấu hình (env, constants, metadata)
│   └── services/           # Global services (API Client, Auth Service)
├── stores/                 # Quản lý State toàn cục (Zustand, Redux hoặc Context)
├── types/                  # Các TypeScript types/interfaces dùng chung toàn cục
├── public/                 # Tài nguyên tĩnh (Images, Fonts, SVGs)
└── styles/                 # Theme, Animations và các CSS Module dùng chung
```

---

## 🚀 Các lệnh phát triển
- `pnpm dev`: Chạy môi trường phát triển (Localhost:3000).
- `pnpm build`: Đóng gói ứng dụng cho production.
- `pnpm lint`: Kiểm tra lỗi code và chuẩn hóa định dạng.
- `npx shadcn@latest add <component>`: Thêm component mới từ thư viện shadcn/ui.
