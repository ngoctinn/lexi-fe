"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, PlusCircle, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flashcard } from "../types";

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

  const diffDays = Math.round(
    (nextReviewDate.getTime() - now) / 86400000,
  );
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
    void audio.play().catch(() => { });
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
    <div className="flex items-start gap-3 border-b border-border/60 px-4 py-3 last:border-b-0">
      <button
        type="button"
        onClick={() => playPronunciation(card)}
        className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary transition hover:bg-primary-100"
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
          {card.definition_vi || "Chưa có định nghĩa"}
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
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <span className="text-xs text-muted-foreground">{cards.length} từ</span>
      </div>

      {cards.length > 0 ? (
        <div className="max-h-112 overflow-y-auto rounded-2xl border border-border/60 bg-muted/15 pr-1">
          {cards.map((card) => (
            <QueueRow key={card.flashcard_id} card={card} now={now} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 p-4 text-sm text-muted-foreground">
          {emptyText}
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
    <Card size="sm" className="self-start border-border/70 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="truncate text-2xl font-bold tracking-tight text-primary-900">
          Tiến độ học
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="space-y-4">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-primary-50">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressValue}%` }}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Từ mới
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl leading-none md:text-3xl" aria-hidden>
                  🎯
                </span>
                <span className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  {newCards.length}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Từ sắp học
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl leading-none md:text-3xl" aria-hidden>
                  ⏰
                </span>
                <span className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  {studiedCards.length}
                </span>
              </div>
            </div>

            {hasCards ? (
              <Button asChild size="lg" variant="soft" className="self-center px-12">
                <Link href="/flashcards/review">
                  Vào học
                  <ArrowRight className="size-5" aria-hidden />
                </Link>
              </Button>
            ) : (
              <Button
                className="self-center px-6"
                size="lg"
                variant="secondary"
                disabled
              >
                Chưa có thẻ để học
              </Button>
            )}
          </div>
        </div>
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
    <Card size="sm" className="self-start border-border/70 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="truncate text-2xl font-bold tracking-tight text-primary-900">
          Từ vựng
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs defaultValue="studied" className="w-full">
          <TabsList>
            <TabsTrigger value="studied">
              Đã học ({studiedCards.length})
            </TabsTrigger>
            <TabsTrigger value="new">Chưa học ({newCards.length})</TabsTrigger>
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
  const [now, setNow] = React.useState<number | null>(null);

  React.useEffect(() => {
    setNow(Date.now());
  }, []);

  return (
    <div className="grid w-full max-w-6xl items-start gap-4 lg:grid-cols-[4fr_6fr]">
      <ProgressCard queue={queue} />
      <QueueCard queue={queue} now={now} />
    </div>
  );
}
