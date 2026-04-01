"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
      className={cn("flex flex-col gap-8", className)}
      {...props}
    >
      <FieldGroup className="gap-8">
        {/* Scenario */}
        <Field>
          <FieldLabel>Chọn kịch bản hội thoại</FieldLabel>
          <FieldDescription>Chọn chủ đề hoặc để tự do không theo kịch bản.</FieldDescription>
          <ScenarioPicker
            scenarios={scenarios}
            value={formData.scenario}
            onChange={(v) => set("scenario", v)}
          />
        </Field>

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
            placeholder="VD: Nhà tuyển dụng từ công ty công nghệ"
            value={formData.ai_character}
            onChange={(e) => set("ai_character", e.target.value)}
          />
        </Field>

        {/* AI Gender */}
        <Field>
          <FieldLabel>Giọng AI</FieldLabel>
          <Select
            value={formData.ai_gender}
            onValueChange={(v) => set("ai_gender", v as "male" | "female")}
          >
            <SelectTrigger size="2xl" id="ai-gender">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Nữ (Female)</SelectItem>
              <SelectItem value="male">Nam (Male)</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        {/* Level */}
        <Field>
          <FieldLabel>Trình độ của bạn</FieldLabel>
          <ToggleGroup
            type="single"
            value={formData.level}
            onValueChange={(v) => { if (v) set("level", v as CreateSessionDto["level"]); }}
            className="flex flex-wrap gap-2 justify-start"
          >
            {LEVELS.map((lvl) => (
              <ToggleGroupItem key={lvl} value={lvl} className="min-w-14 h-10 text-sm font-semibold">
                {lvl}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>

        <Button type="submit" size="2xl" className="w-full text-base" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" data-icon="inline-start" />}
          {isPending ? "Đang khởi tạo..." : "Bắt đầu luyện nói"}
        </Button>
      </FieldGroup>
    </form>
  );
}
