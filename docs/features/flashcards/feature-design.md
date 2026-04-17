# Flashcard Feature Design

## 1. Mục tiêu feature

Flashcard của Lexi phải tối ưu cho học và ghi nhớ, không phải cho CRUD.

Mục tiêu chính:

- Giúp người học nhớ từ / cụm từ nhanh hơn qua active recall.
- Tối ưu vòng lặp học ngắn, lặp lại đều, dễ quay lại mỗi ngày.
- Ưu tiên review flow trước, sau đó mới mở rộng sang quản lý thẻ.

Không ưu tiên cho MVP:

- Dashboard analytics nặng.
- Gamification riêng.
- Social / leaderboard.
- Import / export phức tạp.
- Nhiều chế độ học khác nhau ngay từ đầu.

## 2. Learning flow chuẩn

Flow phải luôn theo cùng một nhịp:

1. Recall
   - Hiển thị mặt trước của thẻ.
   - Ẩn đáp án.
   - Người dùng tự nhớ trước khi nhìn.

2. Reveal
   - Người dùng bấm để xem đáp án.
   - Sau khi reveal, vẫn giữ card rõ ràng, không đổi màn hình ngay.

3. Feedback
   - Người dùng đánh giá mức độ nhớ.
   - Mức đánh giá phải đủ đơn giản để chọn nhanh, nhưng đủ rõ để hệ thống biết nên lặp lại khi nào.

4. Repeat
   - Hệ thống cập nhật queue và sang thẻ tiếp theo.
   - Thẻ quên nên được đưa quay lại cùng session hoặc vào queue relearn.

Nguyên tắc:

- Một màn hình, một việc chính.
- Không cho user chuyển màn liên tục trong lúc đang học.
- Không làm feedback thành một form dài.

## 3. Màn hình cần có

### 3.1 Review

Mục tiêu:

- Là màn hình học chính.
- Giữ user trong learning loop từ đầu đến cuối.

UI chính:

- Progress / số thẻ đã học.
- Flashcard trung tâm.
- Feedback buttons phía dưới.
- Các hint rất nhẹ như keyboard shortcut.

State:

- `loading`: đang lấy queue / deck data.
- `empty`: không có thẻ đến hạn.
- `active`: đang học một thẻ.
- `finished`: hoàn thành session, dẫn sang summary hoặc deck overview.

Action user có thể làm:

- Xem thẻ.
- Reveal đáp án.
- Chọn feedback.
- Nghe audio nếu có.
- Quay lại deck overview sau khi học xong.

### 3.2 Deck overview

Mục tiêu:

- Là màn deck overview thật sự, không phải màn quản trị nặng.
- Cho người dùng biết hôm nay cần học gì trước khi vào review.
- Với MVP chỉ có một queue, overview vẫn phải tồn tại nhưng có thể gọn thành một summary card + CTA.

UI chính:

- Header ngắn gọn với tên deck, mô tả rất ngắn, và CTA chính Study Now.
- Bộ count theo trạng thái: New, Learning, Review, và tổng due hôm nay.
- Một danh sách deck hoặc tree nếu có nhiều deck.
- Menu gear / options cho từng deck nếu cần sửa settings.
- Trạng thái hoàn thành hoặc empty state nếu không có deck nào đến hạn.

State:

- `loading`: đang tải overview.
- `empty`: chưa có deck hoặc chưa có thẻ đến hạn.
- `active`: có deck sẵn để vào review.

Action user có thể làm:

- Mở deck.
- Bắt đầu review.
- Mở deck options.
- Đi tới tạo deck / tạo thẻ nếu chưa có dữ liệu.

### 3.3 Create / Edit

Mục tiêu:

- Tạo hoặc sửa thẻ với ma sát thấp.
- Chỉ cần đủ nhanh để thêm nội dung, không cần nhiều logic quản trị.

UI chính:

- Form front / back.
- Optional fields: example sentence, audio, tag, note type.
- Save / cancel rõ ràng.

State:

- `loading`: đang load dữ liệu thẻ cũ.
- `empty`: form mới, chưa nhập gì.
- `active`: đang nhập hoặc đang sửa.
- `saving`: đang lưu.

Action user có thể làm:

- Thêm thẻ.
- Sửa thẻ.
- Xoá thẻ.
- Lưu / huỷ.

### 3.4 Empty state

Mục tiêu:

- Hướng người dùng sang bước tiếp theo khi chưa có dữ liệu hoặc chưa có thẻ đến hạn.
- Không để màn hình trống mà không có hướng đi.

UI chính:

- Empty illustration hoặc icon đơn giản.
- Message rõ ràng.
- CTA chính: tạo thẻ, import deck, hoặc quay lại deck overview.

State:

- `empty`: không có deck, không có thẻ, hoặc không có thẻ đến hạn.
- `active`: hiển thị CTA hành động.

Action user có thể làm:

- Tạo deck / tạo thẻ.
- Import deck.
- Về deck overview.

## 4. Component structure

### FlashcardContainer

Vai trò:

- Root của review flow.
- Giữ queue, progress, loading, finished, và các action chính.
- Điều phối vòng Recall -> Reveal -> Feedback -> Repeat.

Không nên làm:

- Không chứa UI card chi tiết.
- Không chứa logic form create/edit.
- Không xử lý analytics phức tạp.

### Flashcard

Vai trò:

- Render nội dung mặt trước và mặt sau của thẻ.
- Xử lý reveal qua click / keyboard.
- Hiển thị nội dung học, không điều phối queue.

Nên giữ:

- Front: prompt ngắn, rõ.
- Back: answer + 1-2 chi tiết hỗ trợ.

### DeckOverview

Vai trò:

- Root của entry screen trước review.
- Điều phối deck summary, due counts, tree/list, và CTA Study Now.
- Không biến thành dashboard analytics.

Nên giữ:

- Tên deck hoặc tên nhóm deck.
- Due count tách rõ New / Learning / Review.
- CTA chính để vào review.
- Gear / options cho deck.
- Empty state gọn nếu chưa có deck hoặc chưa có thẻ.

### DeckRow

Vai trò:

- Hiển thị một deck trong tree/list.
- Cho thấy counts, trạng thái, và điểm vào hành động.

Nên giữ:

- Tên deck.
- New / Learning / Review counts.
- Indent cho subdeck.
- Gear menu hoặc chevron vào deck.

### FeedbackButtons

Vai trò:

- Chỉ nhận rating từ user.
- Không tự quyết định scheduling.

Gợi ý:

- Dùng 4 mức rating như Anki: Again / Hard / Good / Easy.
- Có thể map sang 1-4 button trên UI.
- Hỗ trợ keyboard shortcut.

### Progress

Vai trò:

- Cho người dùng biết đang ở đâu trong session.
- Có thể hiển thị số thẻ đã học / tổng số thẻ / due count.

Không nên làm:

- Không biến thành dashboard analytics.
- Không hiển thị quá nhiều metric cùng lúc.

## 5. Data flow

### Input

Data đầu vào tối thiểu:

- Deck data.
- Queue card data.
- Card fields: front, back, example, audio, tag, due info.

### Output

Output của người dùng:

- Rating cho từng thẻ.
- Các hành động phụ nếu cần: nghe audio, skip, back.

### State cần quản lý

State local cho review flow:

- `queue`
- `currentIndex`
- `isRevealed`
- `isSubmitting`
- `finished`
- `loading`
- `error`
- `activeRating`

State server / persisted:

- Due cards theo deck.
- Review result.
- Next schedule / spacing.

Nguyên tắc data flow:

- Input từ server vào queue.
- User rating đi ra server để cập nhật SRS.
- Sau khi save, local queue cập nhật để sang card tiếp theo.
- Thẻ sai có thể được reinsert vào queue hoặc chuyển sang relearn queue.

## 6. Ưu tiên triển khai

### P0 - Review flow trước

- Xây review screen hoàn chỉnh.
- Có Recall -> Reveal -> Feedback -> Repeat.
- Có queue và progress.
- Có finish state rõ ràng.

### P1 - Deck overview

- Bắt buộc có deck overview.
- Nếu chỉ có một queue, vẫn phải hiển thị summary card + Study Now.
- Nếu có nhiều deck, hiển thị tree/list với counts và gear menu.

### P2 - Empty state

- Hiển thị rõ ràng khi không có deck hoặc không có thẻ đến hạn.
- Dẫn người dùng sang create/import.

### P3 - Create / Edit

- Chỉ làm sau khi review flow ổn.
- Form đơn giản, ít field, save nhanh.

## 7. Mapping từ code hiện tại

Nếu code bám sát hiện tại, mapping hợp lý là:

- `FlashcardContainer` -> `FlashcardSession`
- `Flashcard` -> `FlashcardCard`
- `DeckOverview` -> màn entry screen mới cho flashcard
- `FeedbackButtons` -> `SRSControls`
- `Progress` -> `FlashcardProgress`
- `SessionSummary` -> finished state của review flow

## 8. Nguyên tắc build

- Giữ flow học ngắn và lặp được.
- Không thêm màn hình phụ trước khi review flow hoàn chỉnh.
- Nếu thiếu thời gian, chỉ làm Review + Deck overview + Empty state.
- Create / Edit có thể là bước sau cùng.
