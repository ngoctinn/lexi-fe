"use client";

import * as React from "react";
import { Lightbulb, Square, History, X, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Alert, 
  AlertTitle, 
  AlertDescription 
} from "@/components/ui/alert";
import { 
  Empty, 
  EmptyHeader, 
  EmptyTitle, 
  EmptyDescription, 
  EmptyMedia 
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConversationSidebarProps {
  currentHint: string | null;
  onEnd?: () => void;
  onGetHint?: () => void;
  onSelectHint?: (hint: string) => void;
  isAiStreaming?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ConversationSidebar({
  currentHint,
  onEnd,
  onGetHint,
  onSelectHint,
  isAiStreaming,
  disabled,
  className,
}: ConversationSidebarProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (currentHint) {
      navigator.clipboard.writeText(currentHint);
      setCopied(true);
      toast.success("Đã sao chép gợi ý");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <aside className={cn("flex flex-col gap-4 w-[320px] max-w-full border-l bg-muted/20 px-6 py-8", className)}>
      
      {/* Hint Section */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-bold text-sm tracking-tight">
            <div className="p-1 rounded-md bg-amber-100 dark:bg-amber-900/30">
              <Lightbulb className="size-4" />
            </div>
            <span>Gợi ý phản hồi</span>
          </div>
          <Button 
            variant="soft-warning" 
            size="sm" 
            onClick={onGetHint} 
            disabled={disabled || isAiStreaming || !!currentHint}
            className="text-[10px] uppercase font-heavy tracking-widest h-7 px-4"
          >
            Lấy gợi ý
          </Button>
        </div>

        <ScrollArea className="flex-1 -mx-2 px-2">
          {currentHint ? (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="relative p-5 rounded-2xl bg-background border shadow-sm group overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-5 overflow-hidden">
                    <Lightbulb className="size-24 -rotate-12" />
                  </div>
                  
                  <div className="relative z-10">
                    <Badge variant="soft" className="mb-3 font-bold text-[10px] uppercase tracking-wider">
                      Mẫu câu gợi ý
                    </Badge>
                    
                    <p className="text-[15px]/relaxed font-semibold italic text-foreground tracking-tight">
                      "{currentHint}"
                    </p>
                    
                    <div className="mt-6 flex items-center gap-2">
                       <Button 
                         variant="secondary" 
                         size="sm" 
                         className="h-8 text-xs font-bold px-3 rounded-lg"
                         onClick={handleCopy}
                       >
                         {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                         {copied ? "Đã chép" : "Sao chép"}
                       </Button>
                       <Button 
                         variant="default" 
                         size="sm" 
                         className="h-8 text-xs font-bold px-3 rounded-lg"
                         onClick={() => onSelectHint?.(currentHint)}
                       >
                         Sử dụng
                       </Button>
                    </div>
                  </div>
               </div>
               
               <p className="text-[11px] text-muted-foreground px-2 font-medium italic">
                 Mẹo: Bạn có thể thay đổi từ ngữ trong mẫu câu để phù hợp với ý của mình.
               </p>
            </div>
          ) : (
            <Empty className="py-12 border-dashed border-2 rounded-2xl bg-background/50">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="bg-amber-50 dark:bg-amber-950 text-amber-500">
                  <Lightbulb />
                </EmptyMedia>
                <EmptyTitle className="text-sm font-bold">Hãy thử tự trả lời</EmptyTitle>
                <EmptyDescription className="text-xs">
                  Bấm "Lấy gợi ý" nếu bạn cần ý tưởng để tiếp tục cuộc hội thoại.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </ScrollArea>
      </div>


      {/* Help Note */}
      <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
         <div className="flex items-start gap-3">
            <History className="text-primary mt-0.5" />
            <p className="text-[11px]/relaxed text-muted-foreground font-medium">
              Sử dụng tổ hợp phím <kbd className="font-mono text-primary/80">Enter</kbd> để gửi tin nhắn văn bản.
            </p>
         </div>
      </div>
    </aside>
  );
}
