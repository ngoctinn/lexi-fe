"use client";

import { useActionState, useState } from "react";
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
import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Logo } from "@/components/shared/logo";
import { saveOnboardingAction } from "../api/onboarding.actions";
import type { OnboardingActionState, OnboardingLevel } from "../types/schema";

const TOTAL_STEPS = 3;

const INITIAL_ACTION_STATE: OnboardingActionState = {
  success: false,
  message: "",
};

const LEVELS: Array<{ id: OnboardingLevel; label: string }> = [
  { id: "A1", label: "A1 - Mới bắt đầu" },
  { id: "A2", label: "A2 - Căn bản" },
  { id: "B1", label: "B1 - Trung cấp" },
  { id: "B2", label: "B2 - Trung cấp khá" },
  { id: "C1", label: "C1 - Cao cấp" },
  { id: "C2", label: "C2 - Thành thạo" },
];

export function OnboardingForm() {
  const [step, setStep] = useState(0);
  const [formState, formAction, isPending] = useActionState(
    saveOnboardingAction,
    INITIAL_ACTION_STATE,
  );
  const [data, setData] = useState({
    display_name: "",
    current_level: "A1",
    target_level: "B1",
    learning_goal_text: "",
  });

  const nextStep = () =>
    setStep((current) => Math.min(current + 1, TOTAL_STEPS - 1));
  const prevStep = () => setStep((current) => Math.max(current - 1, 0));

  const displayNameErrors = formState.errors?.display_name?.map((message) => ({
    message,
  }));
  const currentLevelErrors = formState.errors?.current_level?.map(
    (message) => ({
      message,
    }),
  );
  const learningGoalErrors = formState.errors?.target_level?.map((message) => ({
    message,
  }));

  return (
    <Card
      size="lg"
      className="mx-auto w-full max-w-md overflow-visible animate-in fade-in zoom-in-95 duration-500"
    >
      <CardHeader className="pb-2 pt-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <Logo size="md" loading="eager" />

          <div className="mt-4 space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight">
              {step === 0 && "Chào bạn, chúng mình nên gọi bạn là gì nhỉ?"}
              {step === 1 && "Trình độ tiếng Anh hiện tại của bạn?"}
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

      <form action={formAction}>
        <CardContent className="flex flex-col justify-center overflow-hidden">
          <input
            type="hidden"
            name="current_level"
            value={data.current_level}
          />
          <input type="hidden" name="target_level" value={data.target_level} />
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
                <RadioGroup
                  value={data.current_level}
                  onValueChange={(value) =>
                    setData({ ...data, current_level: value })
                  }
                  className="flex w-full flex-col gap-2"
                >
                  {LEVELS.map((level) => (
                    <label
                      key={level.id}
                      htmlFor={level.id}
                      className={cn(
                        "flex cursor-pointer items-center rounded-xl border px-4 py-3 ring-offset-background transition-all",
                        "hover:bg-accent/50",
                        data.current_level === level.id
                          ? "border-primary bg-primary-50 ring-1 ring-primary-100 shadow-sm"
                          : "bg-card/50",
                      )}
                    >
                      <RadioGroupItem
                        value={level.id}
                        id={level.id}
                        className="mr-3"
                      />
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          data.current_level === level.id
                            ? "text-primary"
                            : "text-foreground",
                        )}
                      >
                        {level.label}
                      </span>
                    </label>
                  ))}
                </RadioGroup>
                <FieldError
                  className="text-center"
                  errors={currentLevelErrors}
                />
              </Field>
            )}

            {step === 2 && (
              <Field className="w-full gap-3">
                <RadioGroup
                  value={data.target_level}
                  onValueChange={(value) =>
                    setData({ ...data, target_level: value })
                  }
                  className="flex w-full flex-col gap-2"
                >
                  {LEVELS.map((level) => (
                    <label
                      key={`goal-${level.id}`}
                      htmlFor={`goal-${level.id}`}
                      className={cn(
                        "flex cursor-pointer items-center rounded-xl border px-4 py-3 ring-offset-background transition-all",
                        "hover:bg-accent/50",
                        data.target_level === level.id
                          ? "border-primary bg-primary-50 ring-1 ring-primary-100 shadow-sm"
                          : "bg-card/50",
                      )}
                    >
                      <RadioGroupItem
                        value={level.id}
                        id={`goal-${level.id}`}
                        className="mr-3"
                      />
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          data.target_level === level.id
                            ? "text-primary"
                            : "text-foreground",
                        )}
                      >
                        {level.label}
                      </span>
                    </label>
                  ))}
                </RadioGroup>
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
                disabled={!data.display_name.trim() && step === 0}
              >
                Tiếp theo
              </Button>
            ) : (
              <Button
                type="submit"
                size="xl"
                className="flex-1"
                disabled={isPending}
              >
                {isPending ? "Đang lưu..." : "Bắt đầu hành trình"}
              </Button>
            )}
          </div>

          <FieldError
            className="text-center"
            errors={
              formState.message ? [{ message: formState.message }] : undefined
            }
          />
        </CardFooter>
      </form>
    </Card>
  );
}
