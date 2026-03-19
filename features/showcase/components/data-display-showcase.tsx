"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const CARDS = [
  { term: "Serendipity", desc: "Finding something good without looking for it." },
  { term: "Ephemeral", desc: "Lasting for a very short time." },
  { term: "Luminous", desc: "Emitting or reflecting light; shining." },
  { term: "Mellifluous", desc: "Sweet or musical; pleasant to hear." }
];

export function DataDisplayShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Display</CardTitle>
        <CardDescription>Tabs, Tables, and Carousels.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-8 overflow-hidden">
        
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Tabs</p>
          <Tabs defaultValue="word" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="word">Word List</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
            <TabsContent value="word" className="text-sm text-muted-foreground p-4 bg-muted/20 rounded-xl mt-2 border">
              Your saved flashcard words appear here.
            </TabsContent>
            <TabsContent value="stats" className="text-sm text-muted-foreground p-4 bg-muted/20 rounded-xl mt-2 border">
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

        <div className="flex flex-col gap-2 relative">
          <p className="text-sm font-medium">Carousel (Flashcard effect)</p>
          <div className="px-12">
            <Carousel className="w-full max-w-xs mx-auto">
              <CarouselContent>
                {CARDS.map((card, index) => (
                  <CarouselItem key={index}>
                    <div className="p-1">
                      <Card className="aspect-[4/3] flex items-center justify-center border-2 border-primary/20 bg-card shadow-sm">
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-2">
                          <span className="text-xl font-bold">{card.term}</span>
                          <span className="text-sm text-muted-foreground">{card.desc}</span>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
