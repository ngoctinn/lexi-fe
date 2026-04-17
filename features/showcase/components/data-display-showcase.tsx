"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const CARDS = [
  {
    term: "Serendipity",
    desc: "Finding something good without looking for it.",
  },
  { term: "Ephemeral", desc: "Lasting for a very short time." },
  { term: "Luminous", desc: "Emitting or reflecting light; shining." },
  { term: "Mellifluous", desc: "Sweet or musical; pleasant to hear." },
];

export function DataDisplayShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Display & Indicators</CardTitle>
        <CardDescription>
          Advanced components with layering and consistent sizing.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-10 overflow-hidden">
        <div className="flex flex-col gap-8">
          <p className="text-sm font-bold text-primary flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            Tabbed Content & Tables
          </p>
          <p className="text-sm font-medium">Tabs</p>
          <Tabs defaultValue="word" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="word">Word List</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
            <TabsContent
              value="word"
              className="text-sm text-muted-foreground p-4 bg-muted/20 rounded-xl mt-2 border"
            >
              Your saved flashcard words appear here.
            </TabsContent>
            <TabsContent
              value="stats"
              className="text-sm text-muted-foreground p-4 bg-muted/20 rounded-xl mt-2 border"
            >
              Learning progress and review stats appear here.
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Table</p>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[100px]">Word</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="text-right">Reviews</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Accommodate</TableCell>
                  <TableCell>B2</TableCell>
                  <TableCell className="text-right">14</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Serendipity</TableCell>
                  <TableCell>C1</TableCell>
                  <TableCell className="text-right">4</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Essential</TableCell>
                  <TableCell>A2</TableCell>
                  <TableCell className="text-right">42</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex flex-col gap-4 relative">
          <p className="text-sm font-medium">
            Flashcard Carousel (Advanced Layering)
          </p>
          <div className="relative isolate">
            <Carousel className="w-full max-w-[280px] mx-auto group">
              <CarouselContent>
                {CARDS.map((card, index) => (
                  <CarouselItem key={index}>
                    <Card className="aspect-[4/5] flex flex-col p-8 border-none bg-card shadow-flashcard rounded-3xl relative overflow-hidden transition-all group-active:translate-y-0.5">
                      <div className="flex-1 flex flex-col justify-center items-center text-center gap-4">
                        <div className="size-12 rounded-2xl bg-primary-100 flex items-center justify-center mb-2">
                          <span className="text-primary font-bold">
                            # {index + 1}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight text-primary leading-tight">
                          {card.term}
                        </h3>
                        <p className="text-sm leading-relaxed text-muted-foreground antialiased">
                          {card.desc}
                        </p>
                      </div>

                      <div className="flex items-baseline justify-between mt-auto pt-4 border-t border-primary-50">
                        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/40">
                          Vocabulary
                        </span>
                        <span className="text-sm font-bold text-primary italic">
                          Lexi...
                        </span>
                      </div>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="shadow-flashcard-solid border-none bg-white hover:bg-white" />
              <CarouselNext className="shadow-flashcard-solid border-none bg-white hover:bg-white" />
            </Carousel>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
