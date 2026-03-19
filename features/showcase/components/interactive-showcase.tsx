"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm font-medium">
            <span>Course Sync Progress</span>
            <span>66%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex flex-col gap-2 w-full mt-4">
          <p className="text-sm font-medium">Loading State (Skeleton)</p>
          <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-4 w-[60%]" />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Accordion (FAQ)</p>
          <Accordion type="single" collapsible className="w-full border rounded-lg px-4">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is Spaced Repetition?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                It's a study technique where you review material at increasing intervals to improve long-term retention.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-b-0">
              <AccordionTrigger>How many words per day?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We recommend starting with 20 new words along with your daily reviews.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
