"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function BadgeShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Indicators</CardTitle>
        <CardDescription>Badges and progress indicators.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-bold text-primary flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            Badges
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-bold text-primary flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            Progress
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground">Vocabulary Mastery</span>
                <span className="text-primary">75%</span>
              </div>
              <Progress value={75} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground">Daily Goal</span>
                <span className="text-primary">45%</span>
              </div>
              <Progress value={45} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
