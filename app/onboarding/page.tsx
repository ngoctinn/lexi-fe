import { Metadata } from "next";
import { OnboardingForm } from "@/features/onboarding";

export const metadata: Metadata = {
  title: "Thiết lập profile | Lexi",
  description: "Thiết lập lộ trình học tập tối ưu cho bạn.",
};

export default function OnboardingPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
      {/* Background Pattern từ Auth Layout */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="relative z-10 w-full max-w-lg">
        <OnboardingForm />
      </div>
    </div>
  );
}
