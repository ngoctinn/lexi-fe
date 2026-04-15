"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LevelPicker } from "./level-picker";
import { Loader2 } from "lucide-react";
import { ScenarioPicker } from "./scenario-picker";
import { createSession } from "@/features/session/actions/create-session";
import type {
  Scenario,
  CreateSessionDto,
} from "@/features/session/types/session.types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface SessionSetupFormProps extends React.ComponentProps<"form"> {
  scenarios: Scenario[];
}

export function SessionSetupForm({
  scenarios,
  className,
  ...props
}: SessionSetupFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [customScenarioInput, setCustomScenarioInput] = React.useState("");
  const [activeCustomScenario, setActiveCustomScenario] = React.useState("");

  const [formData, setFormData] = React.useState<CreateSessionDto>({
    scenario_id: "free",
    ai_gender: "female",
    level: "B1",
  });

  const set = <K extends keyof CreateSessionDto>(
    key: K,
    value: CreateSessionDto[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCustomScenarioSave = () => {
    if (!customScenarioInput.trim()) {
      toast.error("Vui lòng nhập bối cảnh hội thoại");
      return;
    }
    setActiveCustomScenario(customScenarioInput);
    set("scenario_id", "custom");
    setIsDialogOpen(false);
    toast.success("Đã thiết lập kịch bản riêng");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.scenario_id === "custom" && !activeCustomScenario.trim()) {
      toast.error("Vui lòng thiết lập kịch bản của bạn.");
      setIsDialogOpen(true);
      return;
    }

    setIsPending(true);

    const finalDto: CreateSessionDto = {
      ...formData,
      scenario_id:
        formData.scenario_id === "custom"
          ? `custom:${activeCustomScenario}`
          : formData.scenario_id,
    };

    const result = await createSession(finalDto);

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
        {/* Left Column: Scenarios */}
        <div className="lg:col-span-7 flex flex-col gap-10 h-full overflow-y-auto pr-4 custom-scrollbar pb-10">
          <Field className="gap-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <FieldLabel className="text-xl font-bold tracking-tight">
                  Kịch bản hội thoại
                </FieldLabel>
                <FieldDescription>
                  Chọn kịch bản có sẵn hoặc tự định nghĩa bối cảnh.
                </FieldDescription>
              </div>

              <Button
                type="button"
                variant={
                  formData.scenario_id === "custom" ? "default" : "outline"
                }
                size="sm"
                className="h-9 rounded-lg text-xs font-bold px-5"
                onClick={() => setIsDialogOpen(true)}
              >
                {formData.scenario_id === "custom"
                  ? "Đã thiết lập"
                  : "Tự thiết lập"}
              </Button>
            </div>

            <ScenarioPicker
              scenarios={scenarios}
              value={formData.scenario_id}
              onChange={(v) => set("scenario_id", v)}
            />

            {formData.scenario_id === "custom" && activeCustomScenario && (
              <div className="p-6 rounded-xl border-2 border-dotted border-border bg-transparent flex flex-col gap-2 animate-in fade-in duration-300">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  Bối cảnh tùy chỉnh đã lưu:
                </span>
                <p className="text-sm text-foreground leading-relaxed">
                  {activeCustomScenario}
                </p>
              </div>
            )}
          </Field>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 flex flex-col gap-10">
          <div className="flex flex-col gap-8">
            <h2 className="text-xl font-bold tracking-tight">
              Nhân vật & Trình độ
            </h2>

            <FieldGroup className="gap-8">
              <Field>
                <FieldLabel htmlFor="ai-gender">Giọng AI</FieldLabel>
                <Select
                  value={formData.ai_gender}
                  onValueChange={(v) =>
                    set("ai_gender", v as "male" | "female")
                  }
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

              <Field className="gap-4">
                <FieldLabel className="font-semibold">
                  Trình độ luyện tập
                </FieldLabel>
                <LevelPicker
                  value={formData.level}
                  onChange={(v) => set("level", v as CreateSessionDto["level"])}
                />
              </Field>

              <Button
                type="submit"
                size="2xl"
                className="w-full text-base h-16 mt-2"
                disabled={isPending}
              >
                {isPending && (
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                )}
                {isPending ? "Đang khởi tạo..." : "Bắt đầu hội thoại ngay"}
              </Button>
            </FieldGroup>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Thiết lập kịch bản riêng</DialogTitle>
            <DialogDescription>
              Hãy mô tả chi tiết bối cảnh cuộc hội thoại bạn đang muốn thực
              hành.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="VD: Tôi muốn hội thoại tại ga tàu London. Tôi đang tìm quầy vé bị mất..."
              className="min-h-37.5 text-base leading-relaxed font-medium"
              value={customScenarioInput}
              onChange={(e) => setCustomScenarioInput(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleCustomScenarioSave}
              className="px-6 font-bold"
            >
              Lưu thiết lập
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
