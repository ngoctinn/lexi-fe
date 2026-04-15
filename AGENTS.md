# AGENTS.md - Lexi

## Goal
Build MVP web app luyện nói tiếng Anh với AI + flashcard.
Code đơn giản, đúng chuẩn, dễ hiểu cho beginner.

---

## 1. Suy nghĩ trước khi code

Đừng giả định. Đừng che giấu sự mơ hồ. Làm rõ các đánh đổi.

Trước khi implement:
- Nêu rõ các giả định. Nếu không chắc, hãy hỏi.
- Nếu có nhiều cách hiểu, trình bày tất cả. Không tự ý chọn.
- Nếu có cách đơn giản hơn, nói ra. Sẵn sàng phản biện khi cần.
- Nếu có điều gì chưa rõ, dừng lại. Nêu rõ và hỏi.

---

## 2. Ưu tiên sự đơn giản

Viết lượng code tối thiểu để giải quyết vấn đề.

- Không thêm tính năng ngoài yêu cầu.
- Không abstraction cho code dùng một lần.
- Không thêm tính linh hoạt hoặc config không được yêu cầu.
- Không xử lý lỗi cho trường hợp không thể xảy ra.
- Nếu viết 200 dòng mà có thể làm trong 50 dòng, viết lại.

Tự hỏi: một senior có thấy code này quá phức tạp không. Nếu có, đơn giản hóa.

---

## 3. Thay đổi có kiểm soát

Chỉ sửa những gì cần thiết. Chỉ dọn dẹp những gì bạn tạo ra.

Khi sửa code:
- Không cải thiện code, comment, format xung quanh.
- Không refactor những thứ không bị lỗi.
- Giữ nguyên style hiện tại.
- Nếu thấy dead code không liên quan, chỉ mention, không xóa.

Khi thay đổi tạo ra code thừa:
- Xóa import, biến, function do bạn làm không còn dùng.
- Không xóa dead code có sẵn nếu không được yêu cầu.

Mỗi dòng thay đổi phải phục vụ trực tiếp yêu cầu.

---

## 4. Thực thi theo mục tiêu

Xác định tiêu chí thành công và verify được.

Chuyển task thành mục tiêu:
- Fix bug: tái hiện bug rồi sửa để pass.
- Add feature: UI và logic hoạt động.
- Refactor: đảm bảo không thay đổi behavior.

Plan:
1. Step → verify
2. Step → verify
3. Step → verify

Tiêu chí rõ giúp tự kiểm chứng. Tiêu chí mơ hồ sẽ phải hỏi lại.

---

## Next.js Rules

- Docs first (nextjs_docs + nextjs_index)
- Server Components mặc định
- Chỉ dùng "use client" khi cần
- Fetch ở server
- Ưu tiên cache

Không:
- Fetch ở client khi không cần
- Lạm dụng "use client"
- Dùng API route khi có Server Actions

---

## Code Rules

- Component nhỏ, rõ ràng
- TypeScript rõ type
- Không nested sâu

State:
- Global → Zustand
- Server → React Query

---

## UI Rules

- UI rõ ràng, dễ dùng
- Ưu tiên ShadcnUI
- Không dùng placeholder kém chất lượng

---

## Comment

- Viết bằng tiếng Việt
- Giải thích lý do, không chỉ mô tả

---

## Workflow

1. view_file trước khi sửa
2. Hiểu code hiện tại
3. Xác định scope thay đổi
4. Code đúng scope
5. Kiểm tra build và UI

---

## Definition of Done

- Logic đúng
- Không lỗi build hoặc lint
- UI hoạt động tốt trên mobile và desktop
- Code đơn giản, dễ hiểu

---

## Avoid

- Over-engineering
- Tự suy đoán
- Refactor không cần thiết
- Thêm tính năng ngoài yêu cầu