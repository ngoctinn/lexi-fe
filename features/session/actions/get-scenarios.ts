"use server";

import type { Scenario } from "@/features/session/types/session.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function getScenarios(): Promise<Scenario[]> {
  const idToken = "";

  try {
    const res = await fetch(`${API_BASE}/scenarios`, {
      headers: { Authorization: `Bearer ${idToken}` },
      // Cache for 5 minutes — scenario list rarely changes
      next: { revalidate: 300 },
    });

    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    return (data as Scenario[]).filter((s) => s.is_active);
  } catch {
    // MOCK DATA for local dev
    return [
      {
        scenario_id: "s1",
        name: "Phỏng vấn xin việc",
        description: "Luyện tập trả lời các câu hỏi phỏng vấn vị trí kỹ sư phần mềm.",
        is_active: true,
        usage_count: 124,
      },
      {
        scenario_id: "s2",
        name: "Shopping",
        description: "Hội thoại khi đi mua sắm, trả giá tại cửa hàng quần áo.",
        is_active: true,
        usage_count: 45,
      },
      {
        scenario_id: "s3",
        name: "Sân bay",
        description: "Làm thủ tục hải quan và check-in tại sân bay quốc tế.",
        is_active: true,
        usage_count: 89,
      }
    ];
  }
}
