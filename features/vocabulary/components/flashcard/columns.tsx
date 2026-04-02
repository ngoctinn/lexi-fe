"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash2, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VocabularyItem } from "../../types";
import { deleteFlashcardAction } from "../../actions/flashcards";

export const columns: ColumnDef<VocabularyItem>[] = [
  {
    accessorKey: "word",
    header: "Từ vựng",
    cell: ({ row }) => <div className="font-semibold text-primary/90 text-base">{row.getValue("word")}</div>,
  },
  {
    accessorKey: "meaning",
    header: "Ý nghĩa",
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("meaning")}</div>,
  },
  {
    accessorKey: "type",
    header: "Loại từ",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return <Badge variant="secondary" className="capitalize text-[10px] font-semibold">{type}</Badge>;
    },
  },
  {
    accessorKey: "addedAt",
    header: "Ngày thêm",
    cell: ({ row }) => {
      const dateStr = row.getValue("addedAt") as string;
      const formatted = new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(dateStr));
      return <span className="text-sm text-muted-foreground">{formatted}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;

      const handlePlayAudio = () => {
        if ("speechSynthesis" in window) {
          const msg = new SpeechSynthesisUtterance(item.word);
          msg.lang = "en-US";
          window.speechSynthesis.speak(msg);
        }
      };

      const handleDelete = async () => {
         const result = await deleteFlashcardAction(item.id);
         if (result.success) {
           toast.success(result.message);
         }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuLabel>Tùy chọn</DropdownMenuLabel>
            <DropdownMenuItem onClick={handlePlayAudio} className="cursor-pointer gap-2">
              <Volume2 className="h-4 w-4" /> Phát âm
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
               onClick={handleDelete} 
               className="text-destructive focus:bg-destructive/10 cursor-pointer gap-2"
            >
              <Trash2 className="h-4 w-4" /> Xóa thẻ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
