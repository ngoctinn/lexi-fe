"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export function InteractiveShowcase() {
  const [progress, setProgress] = React.useState(13);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interactive Elements</CardTitle>
        <CardDescription>Progress, skeletons and accordions.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm font-bold text-primary">
            <span className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex size-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-primary"></span>
              </span>
              Syncing Vocabulary...
            </span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
          <p className="text-2xs text-muted-foreground uppercase tracking-widest font-bold">
            Updated 2 minutes ago
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full mt-2">
          <p className="text-sm font-bold mb-1">Status (Skeletons)</p>
          <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-2xl border border-dashed">
            <Skeleton className="size-12 rounded-2xl" />
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-4 w-[60%]" />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-bold mb-3">Learning FAQs</p>
          <Accordion type="single" collapsible className="w-full gap-2">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is Spaced Repetition?</AccordionTrigger>
              <AccordionContent>
                It&apos;s a study technique where you review material at
                increasing intervals to improve long-term retention.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How many words per day?</AccordionTrigger>
              <AccordionContent>
                We recommend starting with 20 new words along with your daily
                reviews.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
