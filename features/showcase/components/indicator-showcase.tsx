import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage, AvatarGroup, AvatarGroupCount, AvatarBadge } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, AlertTriangle, XCircle, MoreHorizontal } from "lucide-react";

export function BadgeShowcase() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Indicators</CardTitle>
        <CardDescription>Badges & Avatars with optimized contrast.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Avatar Groups</p>
          <div className="flex flex-wrap gap-8 items-center">
            <AvatarGroup size="lg">
              <Avatar size="lg">
                <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=128&h=128&auto=format&fit=crop" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Avatar size="lg">
                <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=128&h=128&auto=format&fit=crop" />
                <AvatarFallback>AS</AvatarFallback>
              </Avatar>
              <Avatar size="lg">
                <AvatarFallback>MK</AvatarFallback>
              </Avatar>
              <AvatarGroupCount>+24</AvatarGroupCount>
            </AvatarGroup>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar size="lg" className="cursor-pointer hover:ring-primary/40 transition-all">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                    <AvatarBadge variant="online" />
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>VIP Teacher Online</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Sizing System</p>
          <div className="flex items-end gap-3 px-1 py-2 overflow-x-auto no-scrollbar">
             {["xs", "sm", "default", "lg", "xl", "2xl"].map((s) => (
                <Avatar key={s} size={s as any}>
                   <AvatarFallback>{s[0].toUpperCase()}</AvatarFallback>
                </Avatar>
             ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Status Badges</p>
          <div className="flex flex-wrap gap-3">
            <Badge variant="success">
              <CheckCircle2 data-icon="inline-start" />
              Progress
            </Badge>
            <Badge variant="warning">
              <AlertTriangle data-icon="inline-start" />
              Review
            </Badge>
            <Badge variant="destructive">
              <XCircle data-icon="inline-start" />
              Failed
            </Badge>
            <Badge>New Word</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
