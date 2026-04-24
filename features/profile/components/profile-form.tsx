"use client";

import * as React from "react";
import Image from "next/image";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { updateProfile } from "../api/profile.actions";
import { signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  initialData: {
    display_name?: string;
    email?: string;
    current_level?: string;
    target_level?: string;
    learning_goal_text?: string;
    learning_goal?: string;
    avatar_url?: string;
  };
}

const DEFAULT_AVATAR = `https://api.dicebear.com/9.x/lorelei/svg?seed=Aria`;

const AVATAR_PRESETS = [
  "Aria",
  "Sasha",
  "Jack",
  "Oliver",
  "Jasper",
  "Willow",
  "Aidan",
  "Zoe",
  "Felix",
  "Ruby",
].map((seed) => `https://api.dicebear.com/9.x/lorelei/svg?seed=${seed}`);

function isValidAvatarUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "https:" && urlObj.hostname === "api.dicebear.com";
  } catch {
    return false;
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);
  const levelValues = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
  const legacyGoal = (initialData.learning_goal || "").trim();
  const isLegacyGoalLevel = levelValues.includes(
    legacyGoal as (typeof levelValues)[number],
  );

  const [formData, setFormData] = React.useState({
    display_name: initialData.display_name || "",
    current_level: initialData.current_level || "A1",
    target_level:
      initialData.target_level || (isLegacyGoalLevel ? legacyGoal : "B1"),
    learning_goal_text:
      initialData.learning_goal_text || (isLegacyGoalLevel ? "" : legacyGoal),
    avatar_url: isValidAvatarUrl(initialData.avatar_url || "") 
      ? initialData.avatar_url 
      : DEFAULT_AVATAR,
  });

  const selectAvatar = (url: string) => {
    if (isValidAvatarUrl(url)) {
      setFormData((prev) => ({ ...prev, avatar_url: url }));
    }
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatar_url: DEFAULT_AVATAR }));
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        toast.success("Đã cập nhật hồ sơ thành công!");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setIsSaving(false);
    }
  };

  const levels = [
    { value: "A1", label: "A1 - Mới bắt đầu" },
    { value: "A2", label: "A2 - Căn bản" },
    { value: "B1", label: "B1 - Trung cấp" },
    { value: "B2", label: "B2 - Trung cấp khá" },
    { value: "C1", label: "C1 - Cao cấp" },
    { value: "C2", label: "C2 - Thành thạo" },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-10">
      <div className="flex items-center gap-x-8">
        <Avatar size="2xl" className="border shadow-sm">
          <AvatarImage src={formData.avatar_url} alt={formData.display_name} />
          <AvatarFallback className="text-3xl bg-primary text-primary-foreground font-semibold">
            {formData.display_name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {AVATAR_PRESETS.map((url, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectAvatar(url)}
                className={cn(
                  "relative size-10 rounded-full border transition-colors overflow-hidden",
                  formData.avatar_url === url
                    ? "border-primary-500 ring-2 ring-primary-200"
                    : "border-transparent",
                )}
              >
                <Image
                  src={url}
                  alt={`Preset ${index}`}
                  fill
                  sizes="40px"
                  unoptimized
                  className="object-cover"
                />
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveAvatar}
            >
              Đặt về mặc định
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-base font-semibold leading-7 text-foreground">
            Thông tin cơ bản
          </h2>
          <p className="text-sm leading-6 text-muted-foreground mt-1">
            Các thông tin dùng để nhận diện và hiển thị trong cộng đồng Lexi.
          </p>
        </div>

        <div className="md:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
            <Field>
              <FieldLabel htmlFor="display_name">Tên hiển thị</FieldLabel>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) =>
                  setFormData({ ...formData, display_name: e.target.value })
                }
                size="xl"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email tài khoản</FieldLabel>
              <Input id="email" value={initialData.email} size="xl" disabled />
              <FieldDescription>
                Email của bạn không thể thay đổi tại đây.
              </FieldDescription>
            </Field>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-base font-semibold leading-7 text-foreground">
            Lộ trình học tập
          </h2>
          <p className="text-sm leading-6 text-muted-foreground mt-1">
            Xác định trình độ và mục tiêu giúp Lexi cá nhân hóa bài học hiệu quả
            hơn.
          </p>
        </div>

        <div className="md:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            <Field>
              <FieldLabel htmlFor="current_level">Trình độ hiện tại</FieldLabel>
              <Select
                value={formData.current_level}
                onValueChange={(val) =>
                  setFormData({ ...formData, current_level: val })
                }
              >
                <SelectTrigger id="current_level" size="xl">
                  <SelectValue placeholder="Chọn trình độ" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((lvl) => (
                    <SelectItem key={lvl.value} value={lvl.value}>
                      {lvl.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="target_level">Trình độ mục tiêu</FieldLabel>
              <Select
                value={formData.target_level}
                onValueChange={(val) =>
                  setFormData({ ...formData, target_level: val })
                }
              >
                <SelectTrigger id="target_level" size="xl">
                  <SelectValue placeholder="Chọn mục tiêu" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((lvl) => (
                    <SelectItem key={`goal-${lvl.value}`} value={lvl.value}>
                      {lvl.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field className="sm:col-span-2 lg:col-span-1">
              <FieldLabel htmlFor="learning_goal_text">
                Mục tiêu học tập cụ thể
              </FieldLabel>
              <Input
                id="learning_goal_text"
                value={formData.learning_goal_text}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    learning_goal_text: event.target.value,
                  })
                }
                size="xl"
                placeholder="Ví dụ: Tự tin phỏng vấn tiếng Anh"
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
        <div className="text-center sm:text-left">
          <p className="text-sm font-medium text-foreground">
            Đăng xuất tài khoản
          </p>
          <p className="text-xs text-muted-foreground">
            Kết thúc phiên làm việc hiện tại của bạn.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground"
            onClick={handleLogout}
          >
            Đăng xuất
          </Button>
          <Button type="submit" size="xl" disabled={isSaving}>
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>
    </form>
  );
}
