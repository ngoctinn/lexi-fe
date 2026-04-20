"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Field, FieldDescription } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Logo } from "@/components/shared/logo";
import { saveOnboardingAction } from "../api/onboarding.actions";

const TOTAL_STEPS = 3;

export function OnboardingForm() {
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState({
    display_name: "",
    current_level: "A1",
    learning_goal: "B1",
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleComplete = () => {
    const formData = new FormData();
    formData.append("display_name", data.display_name);
    formData.append("current_level", data.current_level);
    formData.append("learning_goal", data.learning_goal);

    startTransition(async () => {
      const result = await saveOnboardingAction(
        { success: false, message: "" },
        formData,
      );
      if (!result.success) {
        return;
      }
    });
  };

  const LEVELS = [
    { id: "A1", label: "A1 - Mới bắt đầu" },
    { id: "A2", label: "A2 - Căn bản" },
    { id: "B1", label: "B1 - Trung cấp" },
    { id: "B2", label: "B2 - Trung cấp khá" },
    { id: "C1", label: "C1 - Cao cấp" },
    { id: "C2", label: "C2 - Thành thạo" },
  ];

  return (
    <Card
      size="lg"
      className="overflow-visible shadow-lg animate-in fade-in zoom-in-95 duration-500 max-w-md mx-auto w-full"
    >
      <CardHeader className="text-center pb-2 pt-8">
        <div className="flex flex-col items-center gap-4">
          <Logo size="md" loading="eager" />

          <div className="space-y-1 mt-4">
            <CardTitle className="text-xl font-bold tracking-tight">
              {step === 0 && "Chào bạn, chúng mình nên gọi bạn là gì nhỉ?"}
              {step === 1 && "Trình độ tiếng Anh hiện tại của bạn?"}
              {step === 2 && "Bạn mong muốn đạt đến trình độ nào?"}
            </CardTitle>
            <CardDescription className="text-sm px-4">
              {step === 0 &&
                "Hãy cho Lexi biết tên hiển thị mà bạn yêu thích nhé."}
              {step === 1 &&
                "Lexi sẽ gợi ý nội dung phù hợp nhất với khả năng của bạn."}
              {step === 2 &&
                "Xác định mục tiêu giúp Lexi xây dựng lộ trình cá nhân hóa."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-6 px-10 flex flex-col justify-center overflow-hidden">
        <div
          key={step}
          className="animate-in fade-in slide-in-from-right-4 duration-400"
        >
          {step === 0 && (
            <Field className="gap-3 w-full">
              <InputGroup size="xl">
                <InputGroupInput
                  id="display_name"
                  name="display_name"
                  value={data.display_name}
                  onChange={(e) =>
                    setData({ ...data, display_name: e.target.value })
                  }
                  placeholder="Họ và tên..."
                  className="text-center"
                  autoFocus
                  required
                />
              </InputGroup>
              <FieldDescription className="text-center text-xs-plus">
                Tên này sẽ xuất hiện trên trang cá nhân của bạn.
              </FieldDescription>
            </Field>
          )}

          {step === 1 && (
            <RadioGroup
              value={data.current_level}
              onValueChange={(val) => setData({ ...data, current_level: val })}
              className="flex flex-col gap-2 w-full"
            >
              {LEVELS.map((lvl) => (
                <label
                  key={lvl.id}
                  htmlFor={lvl.id}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-xl border transition-all cursor-pointer ring-offset-background",
                    "hover:bg-accent/50",
                    data.current_level === lvl.id
                      ? "border-primary bg-primary-50 ring-1 ring-primary-100 shadow-sm"
                      : "bg-card/50",
                  )}
                >
                  <RadioGroupItem value={lvl.id} id={lvl.id} className="mr-3" />
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      data.current_level === lvl.id
                        ? "text-primary"
                        : "text-foreground",
                    )}
                  >
                    {lvl.label}
                  </span>
                </label>
              ))}
            </RadioGroup>
          )}

          {step === 2 && (
            <RadioGroup
              value={data.learning_goal}
              onValueChange={(val) => setData({ ...data, learning_goal: val })}
              className="flex flex-col gap-2 w-full"
            >
              {LEVELS.map((lvl) => (
                <label
                  key={`goal-${lvl.id}`}
                  htmlFor={`goal-${lvl.id}`}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-xl border transition-all cursor-pointer ring-offset-background",
                    "hover:bg-accent/50",
                    data.learning_goal === lvl.id
                      ? "border-primary bg-primary-50 ring-1 ring-primary-100 shadow-sm"
                      : "bg-card/50",
                  )}
                >
                  <RadioGroupItem
                    value={lvl.id}
                    id={`goal-${lvl.id}`}
                    className="mr-3"
                  />
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      data.learning_goal === lvl.id
                        ? "text-primary"
                        : "text-foreground",
                    )}
                  >
                    {lvl.label}
                  </span>
                </label>
              ))}
            </RadioGroup>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 border-t bg-muted/5 py-6 px-10">
        {step > 0 && (
          <Button
            variant="outline"
            size="xl"
            onClick={prevStep}
            disabled={isPending}
            className="px-5"
          >
            <ChevronLeft size={20} />
          </Button>
        )}

        {step < TOTAL_STEPS - 1 ? (
          <Button
            size="xl"
            className="flex-1"
            onClick={nextStep}
            disabled={!data.display_name.trim() && step === 0}
          >
            Tiếp theo
          </Button>
        ) : (
          <Button
            size="xl"
            className="flex-1"
            onClick={handleComplete}
            disabled={isPending}
          >
            {isPending ? "Đang lưu..." : "Bắt đầu hành trình"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
