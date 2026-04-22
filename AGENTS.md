AGENTS.md - Lexi

Goal: Build MVP web app luyện nói tiếng Anh với AI + flashcard

* Code đơn giản, dễ hiểu cho beginner
* Không over-engineering
* Ưu tiên tốc độ build hơn hoàn hảo

---

1. Thinking Rules
   Không giả định khi chưa rõ. Trước khi code:

* Liệt kê assumptions
* Ambiguity → đưa ra cách hiểu
* Thiếu info → hỏi lại
* Có cách đơn giản hơn → đề xuất
* Không chắc → dừng và hỏi

---

2. Simplicity First
   Luôn chọn cách đơn giản nhất. Không:

* thêm feature ngoài yêu cầu
* abstraction cho code dùng 1 lần
* config/flexibility không cần
* xử lý edge case không tồn tại
  Rule: làm được trong 50 dòng → không viết 200 dòng

---

3. Controlled Changes
   Chỉ thay đổi đúng scope:

* Không refactor ngoài scope
* Không đổi format/style có sẵn
* Không clean toàn file
* Được xóa code do mình tạo nhưng không dùng

---

4. Execution Flow
   Plan: step nhỏ → verify → tiếp

Mapping:

* Bug → reproduce → fix → verify
* Feature → UI + logic chạy được
* Refactor → không đổi behavior

Không define được success → hỏi

---

5. MCP Workflow

Tools:
Filesystem MCP (mcp_filesystem_*) → đọc/ghi lexi-be + lexi-fe

* read_text_file, read_multiple_files
* write_file, edit_file
* list_directory, directory_tree, search_files
* get_file_info, create_directory, move_file

AWS Docs MCP (mcp_AWS_Documentation_MCP_Server_*)

* search_documentation, read_documentation
* read_sections, recommend

Upstash Context7 (mcp_iogithubupstashcontext7_*)

* resolve_library_id, get_library_docs

Next.js MCP (mcp_next_devtools_*)

* init, nextjs_docs, nextjs_index
* nextjs_call, browser_eval
* upgrade_nextjs_16, enable_cache_components

shadcn MCP (mcp_shadcn_*)

* get_project_registries, list/search/view items
* get_item_examples, get_add_command, audit_checklist

shadcn-ui MCP (mcp_shadcn_ui_*)

* list/get component, demo, metadata
* list/get block
* list/get/apply theme

Suggested Flow:
Next.js → docs nếu cần
UI → shadcn
Code → filesystem
Debug → nextjs

Rules:

* Không đoán API
* Không kết luận khi chưa verify bằng code/log

---

6. Next.js Rules

* Server Components mặc định, chỉ "use client" khi cần
* Fetch ở server, ưu tiên cache
* Ưu tiên Server Actions
* API route khi: public endpoint / webhook / external integration

---

7. Code Rules

* Component nhỏ, rõ ràng, không nested sâu
* TypeScript rõ type

Naming:

* Component → PascalCase
* Function → camelCase
* Tên rõ nghĩa

State:

* Mặc định: React state + server fetch
* Phức tạp: Global → Zustand, Server cache → React Query

---

8. UI Rules

* UI rõ ràng, dễ dùng
* Ưu tiên shadcn/ui
* Không dùng placeholder kém

---

9. Comment Rules

* Viết tiếng Việt
* Giải thích tại sao, không giải thích làm gì

---

10. File Editing
    Trước khi sửa: view_file → hiểu code
    Khi sửa: edit_file (dryRun) → check → apply

Được sửa nhiều file khi:

* feature liên quan nhiều module
* hoặc bắt buộc để code chạy

---

11. Definition of Done

* Logic đúng
* Không build/lint error
* Không runtime error
* UI chạy mobile + desktop
* Code đơn giản, dễ hiểu

---

12. Anti-patterns
    Không:

* over-engineering
* đoán requirement
* refactor ngoài scope
* thêm feature không yêu cầu
* abstraction sớm

---

13. Mental Model
    Simplicity > Clean code
    Working > Perfect
    Explicit > Magic

---

14. Preferred Style

* Trực tiếp, không vòng vo
* Code chưa tối ưu → nói rõ
* Approach sai → phản biện

---

15. When to Ask

* requirement không rõ
* nhiều cách implement
* có trade-off
* thiếu context

→ không chắc thì hỏi

---

16. Example
    User: build login
    Agent:

* assumption (email/password?)
* hỏi nếu chưa rõ
* đề xuất đơn giản
* implement minimal

---

Summary
Think → Simplify → Scope → Implement → Verify
