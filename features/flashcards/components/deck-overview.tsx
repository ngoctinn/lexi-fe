"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, PlusCircle, Volume2, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Flashcard } from "../schemas/flashcard.schema";
import { FlashcardStatisticsCard } from "./flashcard-statistics-card";

interface FlashcardDeckOverviewProps {
  queue: Flashcard[];
}

function isNewCard(card: Flashcard) {
  return card.review_count === 0;
}

function formatNextReview(card: Flashcard, now: number | null) {
  if (isNewCard(card)) {
    return "Chưa học";
  }

  if (!now) {
    return "...";
  }

  const nextReviewDate = new Date(card.next_review_at);
  if (Number.isNaN(nextReviewDate.getTime())) {
    return `${card.interval_days} ngày`;
  }

  const diffDays = Math.round((nextReviewDate.getTime() - now) / 86400000);
  if (diffDays <= 0) {
    return "Ôn hôm nay";
  }

  if (diffDays === 1) {
    return "Ôn ngày mai";
  }

  return `Ôn sau ${diffDays} ngày`;
}

function playPronunciation(card: Flashcard) {
  if (card.audio_url) {
    const audio = new Audio(card.audio_url);
    void audio.play().catch(() => {});
    return;
  }

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(card.word);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }
}

function QueueRow({ card, now }: { card: Flashcard; now: number | null }) {
  const newCard = isNewCard(card);

  return (
    <div className="group flex items-start gap-3 border-b border-border/60 px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/30">
      <button
        type="button"
        onClick={() => playPronunciation(card)}
        className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary transition-all hover:bg-primary-100 hover:scale-105 active:scale-95"
        aria-label={`Nghe phát âm ${card.word}`}
      >
        <Volume2 className="size-4" aria-hidden />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {card.word}
          </span>
          <Badge
            variant={newCard ? "warning" : "success"}
            data-icon="inline-start"
          >
            {newCard ? (
              <PlusCircle className="size-3" aria-hidden />
            ) : (
              <CheckCircle2 className="size-3" aria-hidden />
            )}
            {newCard ? "Chưa học" : "Đã học"}
          </Badge>
        </div>

        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
          {card.translation_vi || "Chưa có bản dịch"}
        </p>

        <p className="mt-2 text-xs text-muted-foreground">
          {newCard
            ? "Bắt đầu với thẻ mới"
            : `Lần ôn gần nhất: ${card.interval_days} ngày`}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-xs font-medium text-muted-foreground">
          {formatNextReview(card, now)}
        </p>
        <p className="text-xs text-muted-foreground">
          {newCard ? "Mới" : `SRS ${card.review_count}`}
        </p>
      </div>
    </div>
  );
}

function QueueSection({
  title,
  cards,
  emptyText,
  now,
}: {
  title: string;
  cards: Flashcard[];
  emptyText: string;
  now: number | null;
}) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredCards = React.useMemo(() => {
    if (!searchQuery.trim()) return cards;
    
    const query = searchQuery.toLowerCase();
    return cards.filter(
      (card) =>
        card.word.toLowerCase().includes(query) ||
        card.translation_vi?.toLowerCase().includes(query)
    );
  }, [cards, searchQuery]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <span className="text-xs text-muted-foreground">
          {filteredCards.length} / {cards.length} từ
        </span>
      </div>

      {cards.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm từ vựng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {filteredCards.length > 0 ? (
        <div className="max-h-112 overflow-y-auto rounded-2xl border border-border/60 bg-muted/15 pr-1">
          {filteredCards.map((card) => (
            <QueueRow key={card.flashcard_id} card={card} now={now} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 p-4 text-center text-sm text-muted-foreground">
          {searchQuery ? "Không tìm thấy từ vựng phù hợp" : emptyText}
        </div>
      )}
    </div>
  );
}

function ProgressCard({ queue }: { queue: Flashcard[] }) {
  const newCards = queue.filter(isNewCard);
  const studiedCards = queue.filter((card) => !isNewCard(card));
  const hasCards = queue.length > 0;
  const progressValue = hasCards
    ? Math.round((studiedCards.length / queue.length) * 100)
    : 0;

  return (
    <Card size="sm" className="border-border/70 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold tracking-tight text-primary-900">
          Tiến độ học
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 p-4 pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">
              Hoàn thành {progressValue}%
            </span>
            <span className="font-bold text-foreground">
              {studiedCards.length}/{queue.length}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-primary-50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1 rounded-lg border bg-card p-3">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Từ mới
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl leading-none" aria-hidden>
                🎯
              </span>
              <span className="text-3xl font-bold tracking-tight text-foreground">
                {newCards.length}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 rounded-lg border bg-card p-3">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Từ sắp học
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl leading-none" aria-hidden>
                ⏰
              </span>
              <span className="text-3xl font-bold tracking-tight text-foreground">
                {studiedCards.length}
              </span>
            </div>
          </div>
        </div>

        {hasCards ? (
          <Button
            asChild
            size="lg"
            className="w-full"
          >
            <Link href="/flashcards/review">
              Bắt đầu học
              <ArrowRight className="size-5" aria-hidden />
            </Link>
          </Button>
        ) : (
          <Button
            className="w-full"
            size="lg"
            variant="secondary"
            disabled
          >
            Chưa có thẻ để học
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function QueueCard({ queue, now }: { queue: Flashcard[]; now: number | null }) {
  const studiedCards = [...queue]
    .filter((card) => !isNewCard(card))
    .sort(
      (left, right) =>
        new Date(left.next_review_at).getTime() -
        new Date(right.next_review_at).getTime(),
    );
  const newCards = queue.filter(isNewCard);

  return (
    <Card size="sm" className="border-border/70 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold tracking-tight text-primary-900">
          Từ vựng
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs defaultValue="studied" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="studied" className="flex-1">
              Đã học{" "}
              <span className="ml-1 font-bold text-foreground tabular-nums">
                {studiedCards.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="new" className="flex-1">
              Chưa học{" "}
              <span className="ml-1 font-bold text-foreground tabular-nums">
                {newCards.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="studied">
            <div className="mt-4">
              <QueueSection
                title="Thẻ đã học"
                cards={studiedCards}
                emptyText="Chưa có thẻ đã học."
                now={now}
              />
            </div>
          </TabsContent>

          <TabsContent value="new">
            <div className="mt-4">
              <QueueSection
                title="Thẻ chưa học"
                cards={newCards}
                emptyText="Chưa có thẻ mới nào."
                now={now}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export function FlashcardDeckOverview({ queue }: FlashcardDeckOverviewProps) {
  // Use lazy initialization to get timestamp once
  const [now] = React.useState<number | null>(() => Date.now());

  return (
    <main className="flex-1 px-4 py-4 md:px-6 md:py-8">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        {/* Statistics Row */}
        <div className="grid gap-4 lg:grid-cols-2">
          <ProgressCard queue={queue} />
          <FlashcardStatisticsCard />
        </div>

        {/* Queue Card */}
        <QueueCard queue={queue} now={now} />
      </div>
    </main>
  );
}

