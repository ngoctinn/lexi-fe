# AGENTS.md - Lexi

## Goal

Build MVP web app luyện nói tiếng Anh với AI + flashcard.

Yêu cầu:

- Code đơn giản, dễ hiểu cho beginner
- Không over-engineering
- Ưu tiên tốc độ build hơn hoàn hảo

---

# 1. Thinking Rules (Bắt buộc trước khi code)

Không được giả định khi chưa rõ.

Trước khi implement:

- Liệt kê **assumptions**
- Nếu có ambiguity → đưa ra các cách hiểu
- Nếu thiếu thông tin → hỏi lại trước khi code
- Nếu có cách đơn giản hơn → đề xuất rõ ràng

Nếu không chắc:
→ dừng lại và hỏi

---

# 2. Simplicity First

Luôn chọn cách đơn giản nhất có thể.

Không:

- thêm feature ngoài yêu cầu
- abstraction cho code dùng 1 lần
- config hoặc flexibility không cần thiết
- xử lý edge case không tồn tại

Rule:

> Nếu có thể làm trong 50 dòng, không viết 200 dòng

Checklist:

- Code có thể ngắn hơn không?
- Có thể bỏ abstraction không?
- Có đang "future-proof" không cần thiết?

---

# 3. Controlled Changes

Chỉ thay đổi những gì cần thiết.

Khi sửa:

- Không refactor ngoài scope
- Không đổi format/style có sẵn
- Không "clean code" toàn file

Được phép:

- Xóa code do mình tạo ra nhưng không dùng

Không được:

- Xóa code cũ không liên quan (chỉ mention)

---

# 4. Execution Flow

Mỗi task phải có tiêu chí rõ ràng.

## Plan

1. Step nhỏ → verify
2. Step nhỏ → verify
3. Step nhỏ → verify

## Mapping task

- Bug → reproduce → fix → verify
- Feature → UI + logic chạy được
- Refactor → behavior không đổi

Nếu không define được success criteria → hỏi lại

---

# 5. MCP Workflow (Quan trọng)

## Vai trò từng MCP

- nextjs MCP → docs + debug
- filesystem MCP → đọc/ghi code
- shadcn MCP → UI component

## Flow chuẩn

```text
1. nextjs_docs (nếu liên quan Next.js)
2. shadcn MCP (nếu cần UI)
3. filesystem MCP (code)
4. nextjs_call (debug)
```

## Rules

- Next.js → luôn docs first
- Không đoán API
- Không debug bằng suy luận

---

# 6. Next.js Rules

- Server Components mặc định
- Chỉ dùng "use client" khi cần
- Fetch ở server
- Ưu tiên cache

Không:

- fetch client nếu không cần
- lạm dụng "use client"
- dùng API route khi Server Actions đủ

---

# 7. Code Rules

- Component nhỏ, rõ ràng
- Không nested sâu
- TypeScript phải rõ type

State:

- Global → Zustand
- Server → React Query

---

# 8. UI Rules

- UI rõ ràng, dễ dùng
- Ưu tiên shadcn/ui
- Không dùng UI placeholder kém

---

# 9. Comment Rules

- Viết tiếng Việt
- Giải thích **tại sao**, không chỉ **làm gì**

---

# 10. File Editing Rules (Filesystem MCP)

Trước khi sửa:

```text
view_file → hiểu code
```

Khi sửa:

```text
edit_file (dryRun=true) → check → apply
```

Không:

- sửa khi chưa đọc file
- sửa nhiều file cùng lúc nếu không cần

---

# 11. Definition of Done

- Logic đúng
- Không lỗi build / lint
- UI chạy trên mobile + desktop
- Code đơn giản, dễ hiểu

---

# 12. Anti-patterns

Không được:

- over-engineering
- tự suy đoán requirement
- refactor ngoài scope
- thêm feature không yêu cầu
- viết abstraction sớm

---

# 13. Mental Model

```text
Simplicity > Clean code
Working > Perfect
Explicit > Magic
```

---

# 14. Preferred Style

- Trực tiếp, không vòng vo
- Nếu code chưa tối ưu → nói rõ
- Nếu approach sai → phản biện
- Không "chiều user" khi user sai

---

# 15. When to Ask

Phải hỏi khi:

- requirement không rõ
- nhiều cách implement khác nhau
- có trade-off đáng kể
- thiếu context

---

# 16. Example Good Behavior

```text
User: "build login"

Agent:
- assumption: dùng email/password?
- hỏi lại nếu chưa rõ
- đề xuất dùng shadcn form
- implement minimal version
```

---

# Summary

```text
Think → Simplify → Scope → Implement → Verify
```

---
