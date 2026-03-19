"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function BadgeShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Indicators</CardTitle>
        <CardDescription>Badges & Avatars.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Badges</p>
          <div className="flex flex-wrap gap-4 mt-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <p className="text-sm font-medium">Avatars</p>
          <div className="flex flex-wrap gap-4 items-center">
            <Avatar className="size-12">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar className="size-10">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">L</AvatarFallback>
            </Avatar>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="size-8 cursor-pointer hover:ring-2 hover:ring-ring transition-all">
                    <AvatarFallback className="bg-amber-500 text-white font-bold">V</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>VIP User Profile</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
