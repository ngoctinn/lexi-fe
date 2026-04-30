"use client";

import { useActionState, useState } from "react";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";

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
import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Logo } from "@/components/shared/logo";
import { saveOnboardingAction } from "../api/onboarding.actions";
import type { OnboardingActionState, OnboardingLevel } from "../types/schema";

const TOTAL_STEPS = 3;

const INITIAL_ACTION_STATE: OnboardingActionState = {
  success: false,
  message: "",
};

const LEVELS: Array<{ id: OnboardingLevel; label: string; description: string; image: string }> = [
  { id: "A1", label: "A1", description: "Mới bắt đầu", image: "/images/onboarding/levels/a1-seedling.svg" },
  { id: "A2", label: "A2", description: "Căn bản", image: "/images/onboarding/levels/a2-young.svg" },
  { id: "B1", label: "B1", description: "Trung cấp", image: "/images/onboarding/levels/b1-medium.svg" },
  { id: "B2", label: "B2", description: "Trung cấp khá", image: "/images/onboarding/levels/b2-large.svg" },
  { id: "C1", label: "C1", description: "Cao cấp", image: "/images/onboarding/levels/c1-mature.svg" },
  { id: "C2", label: "C2", description: "Thành thạo", image: "/images/onboarding/levels/c2-flourishing.svg" },
];

interface LevelSelectorProps {
  value: OnboardingLevel | null;
  onChange: (value: OnboardingLevel) => void;
  disabled?: boolean;
}

function LevelSelector({ value, onChange, disabled }: LevelSelectorProps) {
  return (
    <div className="grid w-full gap-3 grid-cols-2 sm:grid-cols-3 pt-4">
      {LEVELS.map((level) => (
        <button
          key={level.id}
          type="button"
          onClick={() => onChange(level.id)}
          disabled={disabled}
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl border-2 p-6 transition-all duration-300",
            "hover:border-primary hover:bg-primary/5",
            value === level.id
              ? "border-primary bg-primary/10 shadow-md scale-105"
              : "border-border/40 bg-muted/30",
          )}
        >
          <div className={cn(
            "relative w-16 h-16 transition-all duration-300",
            value === level.id ? "scale-110" : "scale-100"
          )}>
            <Image
              src={level.image}
              alt={level.description}
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xs font-semibold text-center line-clamp-2">
            {level.description}
          </span>
        </button>
      ))}
    </div>
  );
}

export function OnboardingForm() {
  const [step, setStep] = useState(0);
  const [formState, formAction, isPending] = useActionState(
    saveOnboardingAction,
    INITIAL_ACTION_STATE,
  );
  const [data, setData] = useState({
    display_name: "",
    current_level: null as OnboardingLevel | null,
    target_level: null as OnboardingLevel | null,
    learning_goal_text: "",
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const nextStep = () =>
    setStep((current) => Math.min(current + 1, TOTAL_STEPS - 1));
  const prevStep = () => setStep((current) => Math.max(current - 1, 0));

  const handleSubmit = (e: React.FormEvent) => {
    // Prevent submit if form not complete
    if (!isFormComplete) {
      e.preventDefault();
      setSubmitAttempted(true);
      return;
    }
  };

  const displayNameErrors = formState.errors?.display_name?.map((message) => ({
    message,
  })) || [];
  const currentLevelErrors = formState.errors?.current_level?.map(
    (message) => ({
      message,
    }),
  ) || [];
  const learningGoalErrors = formState.errors?.target_level?.map((message) => ({
    message,
  })) || [];

  const isStep0Valid = data.display_name.trim().length > 0;
  const isStep1Valid = data.current_level !== null;
  const isStep2Valid = data.target_level !== null;
  const canProceed = step === 0 ? isStep0Valid : step === 1 ? isStep1Valid : isStep2Valid;
  const isFormComplete = isStep0Valid && isStep1Valid && isStep2Valid;

  return (
    <Card
      size="lg"
      className="mx-auto w-full max-w-2xl overflow-visible animate-in fade-in zoom-in-95 duration-500"
    >
      <CardHeader className="pb-2 pt-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <Logo size="md" />

          <div className="mt-4 space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight">
              {step === 0 && "Chào bạn, chúng mình nên gọi bạn là gì nhỉ?"}
              {step === 1 && "Bạn tự đánh giá trình độ Tiếng Anh của mình thế nào?"}
              {step === 2 && "Bạn mong muốn đạt đến trình độ nào?"}
            </CardTitle>
            <CardDescription className="px-4 text-sm">
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

      <form action={formAction} onSubmit={handleSubmit}>
        <CardContent className="flex flex-col justify-center overflow-hidden pb-8">
          <input
            type="hidden"
            name="current_level"
            value={data.current_level || ""}
          />
          <input
            type="hidden"
            name="target_level"
            value={data.target_level || ""}
          />
          <input
            type="hidden"
            name="learning_goal_text"
            value={data.learning_goal_text}
          />
          <input
            type="hidden"
            name="display_name"
            value={data.display_name}
          />

          <div
            key={step}
            className="animate-in fade-in slide-in-from-right-4 duration-400"
          >
            {step === 0 && (
              <Field className="w-full gap-3">
                <InputGroup size="xl">
                  <InputGroupInput
                    id="display_name"
                    value={data.display_name}
                    onChange={(event) =>
                      setData({ ...data, display_name: event.target.value })
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        nextStep();
                      }
                    }}
                    placeholder="Họ và tên..."
                    className="text-center"
                    autoFocus
                    required
                  />
                </InputGroup>
                <FieldDescription className="text-center text-sm">
                  Tên này sẽ xuất hiện trên trang cá nhân của bạn.
                </FieldDescription>
                <FieldError
                  className="text-center"
                  errors={displayNameErrors}
                />
              </Field>
            )}

            {step === 1 && (
              <Field className="w-full gap-3">
                <LevelSelector
                  value={data.current_level}
                  onChange={(value) =>
                    setData({ ...data, current_level: value })
                  }
                  disabled={isPending}
                />
                <FieldError
                  className="text-center"
                  errors={currentLevelErrors}
                />
              </Field>
            )}

            {step === 2 && (
              <Field className="w-full gap-3">
                <LevelSelector
                  value={data.target_level}
                  onChange={(value) =>
                    setData({ ...data, target_level: value })
                  }
                  disabled={isPending}
                />
                <FieldError
                  className="text-center"
                  errors={learningGoalErrors}
                />
              </Field>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t bg-muted/5 px-10 py-6">
          <div className="flex w-full gap-2">
            {step > 0 && (
              <Button
                type="button"
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
                type="button"
                size="xl"
                className="flex-1"
                onClick={nextStep}
                disabled={!canProceed}
              >
                Tiếp theo
              </Button>
            ) : (
              <Button
                type="submit"
                size="xl"
                className="flex-1"
                disabled={isPending || !isFormComplete}
              >
                {isPending ? "Đang lưu..." : "Bắt đầu hành trình"}
              </Button>
            )}
          </div>

          <FieldError
            className="text-center"
            errors={
              submitAttempted && !isFormComplete
                ? [{ message: "Vui lòng hoàn thành tất cả các bước trước khi tiếp tục" }]
                : formState.message
                  ? [{ message: formState.message }]
                  : undefined
            }
          />
        </CardFooter>
      </form>
    </Card>
  );
}
