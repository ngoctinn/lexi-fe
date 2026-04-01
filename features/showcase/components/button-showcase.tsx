import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Settings } from "lucide-react";

export function ButtonShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Buttons</CardTitle>
        <CardDescription>Tactile physical styling with depth.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-4 items-center">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="xs">XS</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
          <Button size="2xl">2X Large</Button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="icon-xs" aria-label="Settings"><Settings /></Button>
          <Button size="icon-sm" aria-label="Settings"><Settings /></Button>
          <Button size="icon" aria-label="Settings"><Settings /></Button>
          <Button size="icon-lg" aria-label="Settings"><Settings /></Button>
          <Button size="icon-xl" aria-label="Settings"><Settings /></Button>
          <Button size="icon-2xl" aria-label="Settings"><Settings /></Button>
          <Button>
            <Mic data-icon="inline-start" /> Speak
          </Button>
        </div>
        <div className="flex flex-col gap-4 mt-2">
          <p className="text-sm font-medium">Full Width Button</p>
          <Button className="w-full">Continue Full Width</Button>
        </div>
      </CardContent>
    </Card>
  );
}
