import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale/vi";
import { Activity, Clock, PlayCircle, Plus } from "lucide-react";

import { getSessions } from "@/features/session/actions/get-sessions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SessionStatus } from "@/features/session/types/session.types";
import { Empty, EmptyContent, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";

export const metadata = {
  title: "Lịch sử Luyện nói",
};

export default async function SessionsPage() {
  const sessions = await getSessions();

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Phiên Luyện nói</h1>
          <p className="text-muted-foreground">Lịch sử và kết quả hội thoại với AI của bạn.</p>
        </div>
        <Button asChild>
          <Link href="/session/new">
            <Plus data-icon="inline-start" />
            Tạo phiên mới
          </Link>
        </Button>
      </div>

      {sessions.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Activity /></EmptyMedia>
            <EmptyTitle>Chưa có phiên học nào</EmptyTitle>
            <EmptyDescription>Bạn chưa tham gia bất kỳ phiên luyện nói nào với AI. Bắt đầu ngay hôm nay để cải thiện kỹ năng giao tiếp.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/session/new">Bắt đầu ngay</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => {
            const isCompleted = !!session.scoring;
            
            return (
              <Card key={session.session_id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge
                      variant={
                        isCompleted ? "secondary" : "default"
                      }
                      className="mb-2"
                    >
                      {isCompleted ? "Hoàn thành" : "Đang học"}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-1">{session.scenario_id === "free" ? "Luyện nói tự do" : session.scenario_id}</CardTitle>
                  <CardDescription>
                    {session.created_at && format(new Date(session.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Level:</span>
                      <span className="font-medium text-right line-clamp-1">{session.level}</span>
                    </div>
                    {isCompleted && session.scoring && (
                      <div className="flex justify-between items-center bg-muted/50 p-2 rounded-md mt-4">
                        <span className="text-muted-foreground text-xs font-medium">ĐIỂM TỔNG</span>
                        <span className="font-bold text-primary">{session.scoring.overall.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  {!isCompleted ? (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/session/${session.session_id}`}>
                        <PlayCircle data-icon="inline-start" />
                        Học tiếp
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="secondary" className="w-full" asChild>
                      <Link href={`/session/${session.session_id}/results`}>
                        <Clock data-icon="inline-start" />
                        Xem kết quả
                      </Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
