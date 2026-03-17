# GIT WORKFLOW (Team Standard)

## 1. Mục tiêu

- Làm việc nhóm rõ ràng, tránh conflict
- Dễ review code
- Dễ rollback khi có lỗi

---

## 2. Branch Strategy

### Nhánh chính

- `main`: code production (luôn stable)
- `develop` (optional): môi trường dev chung

### Nhánh phụ

- `feature/<name>`: phát triển tính năng
- `bugfix/<name>`: sửa lỗi
- `hotfix/<name>`: fix gấp trên production

Ví dụ:

```
feature/login-api
bugfix/fix-null-user
hotfix/payment-error
```

---

## 3. Quy trình làm việc chuẩn

### Bước 1: cập nhật code mới nhất

```
git checkout main
git pull origin main
```

### Bước 2: tạo branch mới

```
git checkout -b feature/<ten-tinh-nang>
```

### Bước 3: code + commit

```
git add .
git commit -m "feat: mô tả ngắn"
```

### Bước 4: push lên remote

```
git push origin feature/<ten-tinh-nang>
```

### Bước 5: tạo Pull Request (PR)

- Base: `main`
- Compare: `feature/...`
- Assign reviewer

---

## 4. Quy tắc commit

### Format:

```
<type>: <message>
```

### Types:

- `feat`: thêm tính năng
- `fix`: sửa bug
- `refactor`: cải tiến code
- `style`: format (không ảnh hưởng logic)
- `docs`: tài liệu
- `chore`: việc lặt vặt

### Ví dụ:

```
feat: add login api
fix: handle null pointer in user service
refactor: optimize booking query
```

---

## 5. Quy tắc Pull Request

- Không push trực tiếp vào `main`
- Mỗi PR = 1 tính năng / 1 bug
- PR phải:
  - chạy được
  - không lỗi build
  - đã test cơ bản

### Checklist:

- [ ] Code chạy OK
- [ ] Không console.log thừa
- [ ] Không commit file rác (.env, node_modules)
- [ ] Đặt tên rõ ràng

---

## 6. Cập nhật branch khi có thay đổi mới

```
git checkout main
git pull origin main
git checkout feature/<name>
git merge main
```

Hoặc (clean hơn):

```
git rebase main
```

---

## 7. Xử lý conflict

```
git pull origin main
# sửa conflict
git add .
git commit
```

---

## 8. Quy tắc quan trọng

- Luôn `pull` trước khi code
- Không commit code chưa chạy
- Không làm nhiều feature trong 1 branch
- Commit nhỏ, rõ ràng
- Không force push nếu không cần thiết

---

## 9. Flow chuẩn (tóm tắt)

```
git pull origin main
git checkout -b feature/x

# code...

git add .
git commit -m "feat: x"
git push origin feature/x

# tạo PR → review → merge
```

---

## 10. Gợi ý nâng cao (optional)

- Dùng `pre-commit hook` để lint code
- Dùng CI/CD (GitHub Actions)
- Protect branch `main` (bắt buộc PR + review)

---

## 11. Những lỗi thường gặp

| Lỗi             | Nguyên nhân               | Cách xử lý                 |
| --------------- | ------------------------- | -------------------------- |
| Conflict        | nhiều người sửa cùng file | merge/rebase               |
| Push bị từ chối | local chưa cập nhật       | `git pull` trước           |
| Sai branch      | quên checkout             | `git checkout đúng branch` |

---

## 12. Nguyên tắc vàng

> "Mỗi tính năng = 1 branch + 1 PR"

---

Tài liệu này nên đặt ở root project:

```
/GIT_WORKFLOW.md
```
