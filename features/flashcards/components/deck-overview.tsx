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
    <div className="group flex items-center gap-3 border-b border-border/60 px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/30">
      <button
        type="button"
        onClick={() => playPronunciation(card)}
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary transition-all hover:bg-primary-100 hover:scale-105 active:scale-95"
        aria-label={`Nghe phát âm ${card.word}`}
      >
        <Volume2 className="size-4" aria-hidden />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-foreground">
            {card.word}
          </span>
          {card.phonetic && (
            <span className="text-xs text-muted-foreground">
              /{card.phonetic}/
            </span>
          )}
          <Badge
            variant={newCard ? "warning" : "success"}
            size="sm"
          >
            {newCard ? "Mới" : `Lần ${card.review_count}`}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground">
          {card.translation_vi || "Chưa có bản dịch"}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-xs font-medium text-foreground mb-1">
          {formatNextReview(card, now)}
        </p>
        <p className="text-xs text-muted-foreground">
          {newCard ? "Chưa học" : `${card.interval_days} ngày`}
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
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold text-foreground">{title}</h3>
        <Badge variant="secondary" size="sm">
          {filteredCards.length} / {cards.length}
        </Badge>
      </div>

      {cards.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm h-9"
          />
        </div>
      )}

      {filteredCards.length > 0 ? (
        <div className="max-h-[300px] overflow-y-auto rounded-lg border border-border/60 bg-background">
          {filteredCards.map((card) => (
            <QueueRow key={card.flashcard_id} card={card} now={now} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            {searchQuery ? "Không tìm thấy" : emptyText}
          </p>
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
    <Card size="sm" className="border-border/60">
      <CardHeader className="border-b border-border/60 pb-3">
        <CardTitle className="text-base font-bold tracking-tight">
          Tiến độ học
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        {/* Progress bar section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">
              Hoàn thành {progressValue}%
            </span>
            <span className="font-bold text-foreground">
              {studiedCards.length}/{queue.length}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-primary-50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>

        {/* Two cards below progress bar */}
        <div className="grid gap-3 grid-cols-2">
          <div className="flex flex-col gap-1 rounded-lg border bg-card p-3">
            <div className="flex items-center gap-1.5">
              <span className="text-lg" aria-hidden>
                🎯
              </span>
              <p className="text-xs font-medium text-muted-foreground">
                Từ mới
              </p>
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {newCards.length}
            </p>
          </div>

          <div className="flex flex-col gap-1 rounded-lg border bg-card p-3">
            <div className="flex items-center gap-1.5">
              <span className="text-lg" aria-hidden>
                ⏰
              </span>
              <p className="text-xs font-medium text-muted-foreground">
                Từ sắp học
              </p>
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {studiedCards.length}
            </p>
          </div>
        </div>

        {/* Button */}
        {hasCards ? (
          <Button
            asChild
            size="md"
            className="w-full"
          >
            <Link href="/flashcards/review">
              Bắt đầu học
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        ) : (
          <Button
            className="w-full"
            size="md"
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
    <Card size="sm" className="border-border/60">
      <CardHeader className="border-b border-border/60 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold tracking-tight">
            Danh sách từ vựng
          </CardTitle>
          <Badge variant="secondary" size="sm">
            {queue.length} từ
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="studied" className="w-full" variant="soft">
          <div className="border-b border-border/60 px-4 pt-3">
            <TabsList className="w-full">
              <TabsTrigger value="studied" className="flex-1 text-sm">
                Đã học{" "}
                <span className="ml-1 font-bold text-primary-700 tabular-nums text-base">
                  {studiedCards.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="new" className="flex-1 text-sm">
                Chưa học{" "}
                <span className="ml-1 font-bold text-primary-700 tabular-nums text-base">
                  {newCards.length}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="studied" className="mt-0">
            <div className="p-4">
              <QueueSection
                title="Thẻ đã học"
                cards={studiedCards}
                emptyText="Chưa có thẻ đã học."
                now={now}
              />
            </div>
          </TabsContent>

          <TabsContent value="new" className="mt-0">
            <div className="p-4">
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
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 animate-in fade-in duration-700">
      <div className="space-y-4">
        <FlashcardStatisticsCard />
        <ProgressCard queue={queue} />
      </div>

      <div>
        <QueueCard queue={queue} now={now} />
      </div>
    </div>
  );
}

