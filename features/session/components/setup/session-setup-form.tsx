"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LevelPicker } from "./level-picker";
import { Loader2 } from "lucide-react";
import { ScenarioPicker } from "./scenario-picker";
import { createSession } from "@/features/session/actions/create-session";
import type { Scenario, CreateSessionDto } from "@/features/session/types/session.types";
import { toast } from "sonner";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

interface SessionSetupFormProps extends React.ComponentProps<"form"> {
  scenarios: Scenario[];
}

export function SessionSetupForm({ scenarios, className, ...props }: SessionSetupFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  const [formData, setFormData] = React.useState<CreateSessionDto>({
    scenario: "free",
    my_character: "",
    ai_character: "",
    ai_gender: "female",
    level: "B1",
  });

  const set = <K extends keyof CreateSessionDto>(key: K, value: CreateSessionDto[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    const result = await createSession(formData);

    if (result.success && result.session_id) {
      router.push(`/session/${result.session_id}`);
    } else {
      toast.error(result.error ?? "Không thể tạo phiên học. Vui lòng thử lại.");
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col flex-1 min-h-0", className)}
      {...props}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start h-full min-h-0">
        {/* Left Column: Scenarios (Scrollable) */}
        <div className="lg:col-span-7 flex flex-col gap-8 h-full overflow-y-auto pr-4 custom-scrollbar">
          <Field className="gap-4">
            <div className="flex flex-col gap-1">
              <FieldLabel className="text-xl font-bold tracking-tight">Kịch bản hội thoại</FieldLabel>
              <FieldDescription>Chọn một kịch bản để AI chuẩn bị nhân vật và hướng dẫn bạn.</FieldDescription>
            </div>
            <ScenarioPicker
              scenarios={scenarios}
              value={formData.scenario}
              onChange={(v) => set("scenario", v)}
            />
          </Field>
        </div>

        {/* Right Column: Other fields vertically stacked (Fixed) */}
        <div className="lg:col-span-5 flex flex-col gap-10">
          <div className="flex flex-col gap-8">
            <h2 className="text-xl font-bold tracking-tight">Tùy chỉnh nhân vật</h2>

            <FieldGroup className="gap-8">
              {/* My character */}
              <Field>
                <FieldLabel htmlFor="my-character">Bạn đóng vai</FieldLabel>
                <Input
                  id="my-character"
                  size="2xl"
                  placeholder="VD: Ứng viên xin việc"
                  value={formData.my_character}
                  onChange={(e) => set("my_character", e.target.value)}
                />
              </Field>

              {/* AI character */}
              <Field>
                <FieldLabel htmlFor="ai-character">AI đóng vai</FieldLabel>
                <Input
                  id="ai-character"
                  size="2xl"
                  placeholder="VD: Nhà tuyển dụng"
                  value={formData.ai_character}
                  onChange={(e) => set("ai_character", e.target.value)}
                />
              </Field>

              {/* AI Gender */}
              <Field>
                <FieldLabel htmlFor="ai-gender">Giọng AI</FieldLabel>
                <Select
                  value={formData.ai_gender}
                  onValueChange={(v) => set("ai_gender", v as "male" | "female")}
                >
                  <SelectTrigger size="2xl" id="ai-gender" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Nữ (Female)</SelectItem>
                    <SelectItem value="male">Nam (Male)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {/* Level picker */}
              <Field className="gap-4">
                <FieldLabel className="font-semibold">Trình độ luyện tập</FieldLabel>
                <LevelPicker
                  value={formData.level}
                  onChange={(v) => set("level", v as CreateSessionDto["level"])}
                />
              </Field>

              <Button type="submit" size="2xl" className="w-full text-base h-14 mt-2" disabled={isPending}>
                {isPending && <Loader2 className="animate-spin" data-icon="inline-start" />}
                {isPending ? "Đang khởi tạo..." : "Bắt đầu hội thoại ngay"}
              </Button>
            </FieldGroup>
          </div>
        </div>
      </div>
    </form>
  );
}
