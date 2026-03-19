import { BookOpen, Mic, BarChart3, Trophy, Zap, Users } from "lucide-react";

export const FEATURES = [
  {
    icon: BookOpen,
    bg: "bg-primary/10",
    color: "text-primary",
    title: "Flashcards Thông Minh",
    description:
      "Hệ thống lặp lại ngắt quãng (SRS) tối ưu hóa thời điểm ôn tập, giúp từ vựng đi vào trí nhớ dài hạn một cách tự nhiên.",
  },
  {
    icon: Mic,
    bg: "bg-primary/10",
    color: "text-primary",
    title: "Luyện Nói Cùng AI",
    description:
      "Mô phỏng hội thoại thực tế với AI bản ngữ. Nhận phản hồi phát âm tức thì và xây dựng phản xạ tiếng Anh tự nhiên.",
  },
  {
    icon: BarChart3,
    bg: "bg-primary/10",
    color: "text-primary",
    title: "Lộ Trình Cá Nhân Hóa",
    description:
      "AI phân tích điểm yếu và tự động điều chỉnh nội dung học phù hợp trình độ và mục tiêu của từng học viên.",
  },
  {
    icon: Trophy,
    bg: "bg-primary/10",
    color: "text-primary",
    title: "Gamification",
    description:
      "Bảng xếp hạng, huy hiệu thành tích và chuỗi ngày học liên tiếp giữ động lực học tập luôn ở mức cao nhất.",
  },
  {
    icon: Zap,
    bg: "bg-primary/10",
    color: "text-primary",
    title: "Học Mọi Lúc Mọi Nơi",
    description:
      "Giao diện tối ưu cho mobile. Học 10 phút mỗi ngày trên xe buýt hay trước khi ngủ — đủ để tạo nên khác biệt.",
  },
  {
    icon: Users,
    bg: "bg-primary/10",
    color: "text-primary",
    title: "Cộng Đồng Học Viên",
    description:
      "Kết nối với hơn 1,000 học viên cùng chí hướng. Thảo luận, chia sẻ kinh nghiệm và cùng nhau tiến bộ mỗi ngày.",
  },
];

export const STEPS = [
  {
    step: "01",
    title: "Làm bài kiểm tra đầu vào",
    description:
      "AI đánh giá trình độ hiện tại và xác định chính xác những điểm cần cải thiện của bạn.",
  },
  {
    step: "02",
    title: "Nhận lộ trình cá nhân",
    description:
      "Hệ thống tạo ra kế hoạch học tập tối ưu, sáp xếp nội dung từ dễ đến khó theo đúng tốc độ của bạn.",
  },
  {
    step: "03",
    title: "Học & luyện tập mỗi ngày",
    description:
      "Chỉ 15–20 phút mỗi ngày với Flashcards, luyện nói AI và các bài tập tương tác để đạt tiến bộ vượt bậc.",
  },
];

export const TESTIMONIALS = [
  {
    name: "Nguyễn Minh Anh",
    role: "Sinh viên đại học",
    content:
      "Sau 30 ngày dùng Lexi, điểm IELTS Speaking của mình lên từ 5.5 lên 6.5. AI coaching thực sự hiệu quả!",
    rating: 5,
  },
  {
    name: "Trần Đức Khoa",
    role: "Kỹ sư phần mềm",
    content:
      "Mình bận công việc nên chỉ học 15 phút/ngày. Lexi tối ưu từng phút học, không lãng phí một giây nào.",
    rating: 5,
  },
  {
    name: "Lê Thu Hà",
    role: "Marketing Executive",
    content:
      "Flashcards 3D và hệ thống repeat thông minh giúp mình nhớ 500 từ vựng business trong 3 tuần.",
    rating: 5,
  },
];

export const STATS = [
  { value: "1,000+", label: "Học viên tích cực" },
  { value: "50,000+", label: "Từ vựng trong kho" },
  { value: "30 ngày", label: "Đến giao tiếp tự tin" },
  { value: "4.9 ★", label: "Đánh giá trung bình" },
];
