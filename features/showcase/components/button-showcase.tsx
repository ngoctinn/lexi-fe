import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Settings">
            <Settings data-icon="inline-start" />
          </Button>
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
