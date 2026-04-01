"use client";

import * as React from "react";
import { Camera, Save } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function ProfileForm() {
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    // Mock save delay
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Đã cập nhật hồ sơ thành công!");
    }, 1000);
  };

  return (
    <form onSubmit={handleSave}>
      <Card className="max-w-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Thông tin cá nhân</CardTitle>
          <CardDescription>Cập nhật thông tin của bạn để AI có thể hiểu và hỗ trợ bạn tốt nhất.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative group">
              <Avatar size="2xl" className="ring-4 ring-background shadow-md">
                <AvatarImage src="/avatars/user.jpg" alt="Ngọc Tín" />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">NT</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                 <Camera className="size-6 mb-1" />
                 <span className="text-[10px] font-bold uppercase tracking-wider">Đổi ảnh</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-foreground">Ảnh đại diện</h3>
              <p className="text-sm text-muted-foreground">Khuyến nghị ảnh vuông, tối thiểu 256x256px.</p>
              <div className="flex gap-2 mt-1">
                <Button type="button" variant="outline" size="sm">Tải ảnh lên</Button>
                <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">Xóa ảnh</Button>
              </div>
            </div>
          </div>

          <div className="h-px bg-border w-full" />

          {/* Form Fields Section */}
          <FieldGroup className="gap-6">
            <Field>
              <FieldLabel htmlFor="displayName">Tên hiển thị</FieldLabel>
              <Input id="displayName" defaultValue="Ngọc Tín" size="xl" required />
              <FieldDescription>Tên này sẽ được hiển thị trên bảng xếp hạng và giao diện ứng dụng.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="proficiency">Trình độ tiếng Anh (CEFR)</FieldLabel>
              <Select defaultValue="a2">
                <SelectTrigger id="proficiency" size="xl" className="font-medium">
                  <SelectValue placeholder="Chọn trình độ của bạn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Giao tiếp cơ bản</SelectLabel>
                    <SelectItem value="a1">Mới bắt đầu (A1)</SelectItem>
                    <SelectItem value="a2">Cơ bản (A2)</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Giao tiếp độc lập</SelectLabel>
                    <SelectItem value="b1">Trung cấp sơ (B1)</SelectItem>
                    <SelectItem value="b2">Trung cấp cao (B2)</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Thành thạo</SelectLabel>
                    <SelectItem value="c1">Cao cấp (C1)</SelectItem>
                    <SelectItem value="c2">Bản xứ (C2)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldDescription>AI sẽ tự động điều chỉnh độ khó của từ vựng và đoạn hội thoại dựa trên mức này.</FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-end">
          <Button type="submit" size="xl" disabled={isSaving} className="min-w-[140px]">
            {isSaving ? "Đang lưu..." : (
              <>
                <Save data-icon="inline-start" /> Lưu thay đổi
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
