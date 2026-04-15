"use client";

import * as React from "react";
import { Volume2, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { saveFlashcardAction } from "../../actions/flashcards";
import { SaveFlashcardInput } from "../../types";

export function InstantLookup() {
  const [open, setOpen] = React.useState(false);
  const [virtualRef, setVirtualRef] = React.useState<DOMRect | null>(null);
  const [word, setWord] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  // Lắng nghe sự kiện bôi đen văn bản
  React.useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      
      if (text && text.length > 0 && text.split(' ').length <= 4) {
        // Chỉ hiện tooltip nếu bôi đen không quá 4 từ
        const range = selection?.getRangeAt(0);
        setVirtualRef(range?.getBoundingClientRect() || null);
        setWord(text);
        setOpen(true);
      } else if (!open) {
        // Delay bỏ open để cho phép click vào panel
        // Do not auto-close unless handled outside or selecting empty
      }
    };

    // Chuẩn là bắt mouseup cho desktop và touchend cho mobile
    document.addEventListener("mouseup", handleSelection);
    return () => document.removeEventListener("mouseup", handleSelection);
  }, [open]);

    const handleSave = async () => {
      if (isSaving) return;
      setIsSaving(true);

      const data: SaveFlashcardInput = {
        word,
        meaning: "(Bản dịch giả lập cho từ này)",
        type: "noun", 
      };

    try {
      const result = await saveFlashcardAction(data);
      if (result.success) {
        toast.success(result.message);
        setOpen(false); // Đóng popover sau khi lưu
      }
    } catch {
       toast.error("Có lỗi xảy ra khi lưu từ vựng");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlayAudio = () => {
    // Phát âm mockup
    if ("speechSynthesis" in window) {
      const msg = new SpeechSynthesisUtterance(word);
      msg.lang = "en-US";
      window.speechSynthesis.speak(msg);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor virtualRef={{ current: { getBoundingClientRect: () => virtualRef || new DOMRect() } }} />
      
      <PopoverContent 
        className="w-80 p-0 shadow-2xl border-primary/10 overflow-hidden" 
        side="top" 
        align="center"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Card className="border-0 shadow-none bg-background/95 backdrop-blur-sm">
          <CardHeader className="pb-3 px-4 pt-4 border-b bg-muted/30">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold text-primary break-all">{word}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="px-1.5 py-0 rounded-sm text-[10px] uppercase font-semibold">Noun</Badge>
                  <span className="text-xs text-muted-foreground mr-1">/məˈk/</span>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0" onClick={handlePlayAudio}>
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-4">
             <div className="text-sm">
               <span className="font-semibold text-foreground/80 block mb-1">Nghĩa tiếng Việt</span>
                    <p className="text-muted-foreground leading-relaxed">
                 (Bản dịch cho {`"${word}"`} sẽ hiển thị ở đây sau khi kết nối module Dictionary).
               </p>
             </div>

            <Button 
              className="w-full gap-2 transition-all" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                 <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
              ) : (
                 <Bookmark className="h-4 w-4" />
              )}
              {isSaving ? "Đang lưu..." : "Lưu Flashcard"}
            </Button>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
