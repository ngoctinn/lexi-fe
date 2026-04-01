"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const RECENT_WORDS = [
  { term: "Serendipity", meaning: "Sự tình cờ may mắn", level: "C1", status: "mastered", nextReview: "in 14 days" },
  { term: "Ephemeral", meaning: "Phù du, chóng vánh", level: "C2", status: "learning", nextReview: "tomorrow" },
  { term: "Luminous", meaning: "Tỏa sáng", level: "B2", status: "needs_review", nextReview: "today" },
  { term: "Mellifluous", meaning: "Ngọt ngào, êm tai", level: "C1", status: "learning", nextReview: "in 2 days" },
  { term: "Pragmatic", meaning: "Thực dụng", level: "B2", status: "mastered", nextReview: "in 30 days" },
];

export function RecentActivity() {
  return (
    <Card className="col-span-1 lg:col-span-2 shadow-sm">
      <CardHeader>
        <CardTitle>Hoạt động gần đây</CardTitle>
        <CardDescription>Các từ vựng bạn vừa học hoặc cần ôn tập sớm.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[180px]">Từ vựng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="hidden md:table-cell text-right">Ôn tập tiếp theo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RECENT_WORDS.map((word) => (
                <TableRow key={word.term} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{word.term}</span>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1">{word.level}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{word.meaning}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {word.status === "mastered" ? (
                      <Badge variant="success" className="border-none">
                        <CheckCircle2 data-icon="inline-start" />
                        Đã thuộc
                      </Badge>
                    ) : word.status === "needs_review" ? (
                      <Badge variant="warning" className="border-none">
                        <AlertTriangle data-icon="inline-start" />
                        Cần ôn tập
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="border-none">
                        <Clock data-icon="inline-start" />
                        Đang học
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right text-sm text-muted-foreground font-medium">
                    {word.nextReview}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
