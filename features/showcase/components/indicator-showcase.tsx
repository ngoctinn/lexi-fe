"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, AlertTriangle, XCircle, MoreHorizontal } from "lucide-react";

export function BadgeShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Indicators</CardTitle>
        <CardDescription>Badges & Avatars with optimized contrast.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold opacity-70 uppercase tracking-wider">Standard Badges</p>
          <div className="flex flex-wrap gap-4 mt-1">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="ghost">Ghost</Badge>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col">
            <p className="text-sm font-semibold opacity-70 uppercase tracking-wider">Status Indicators</p>
            <p className="text-xs text-muted-foreground mt-1 text-balance">
              Using <strong>Flipped Contrast</strong> (light background + dark text) and <strong>Hue Rotation</strong> for better readability.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 mt-2">
            <Badge variant="success">
              <CheckCircle2 data-icon="inline-start" />
              Approved
            </Badge>
            <Badge variant="warning">
              <AlertTriangle data-icon="inline-start" />
              Pending
            </Badge>
            <Badge variant="destructive">
              <XCircle data-icon="inline-start" />
              Declined
            </Badge>
            <Badge variant="secondary" className="bg-muted! text-muted-foreground!">
              <MoreHorizontal data-icon="inline-start" />
              Draft
            </Badge>
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
