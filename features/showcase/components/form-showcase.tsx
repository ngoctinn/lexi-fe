"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FormShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Forms & Inputs</CardTitle>
        <CardDescription>Input fields and toggles.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Username</label>
          <Input placeholder="@johndoe" />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Difficulty Level</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Feedback</label>
          <Textarea placeholder="Share your thoughts..." className="min-h-[80px]" />
        </div>

        <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/20">
          <div className="flex flex-col gap-0.5">
            <label className="text-sm font-medium cursor-pointer" htmlFor="airplane-mode">Dark Mode</label>
            <span className="text-xs text-muted-foreground">Toggle theme variation.</span>
          </div>
          <Switch id="airplane-mode" />
        </div>
      </CardContent>
    </Card>
  );
}
