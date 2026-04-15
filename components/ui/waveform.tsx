// components/ui/waveform.tsx
// Hiệu ứng sóng âm đơn giản, dùng SVG + CSS animation
// Chỉ dùng cho trạng thái ghi âm, nhỏ gọn, không che input

import * as React from "react";

export function Waveform({ className }: { className?: string }) {
  // Đơn giản hóa: 5 cột sóng, animate lên/xuống
  return (
    <div
      aria-label="Đang ghi âm, hiệu ứng sóng âm"
      className={"flex items-end gap-1 h-6 " + (className || "")}
      role="status"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`block w-1.5 rounded bg-primary animate-waveform`}
          style={{
            animationDelay: `${i * 0.12}s`,
            height: "100%",
            minHeight: "8px",
            maxHeight: "24px",
          }}
        />
      ))}
      <style jsx>{`
        @keyframes waveform {
          0%,
          100% {
            height: 30%;
          }
          50% {
            height: 100%;
          }
        }
        .animate-waveform {
          animation: waveform 1s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
