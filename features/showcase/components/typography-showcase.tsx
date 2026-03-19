import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function TypographyShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Typography & Colors</CardTitle>
        <CardDescription>Primary palette settings.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-4">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-lg bg-primary ring-2 ring-background border shadow" />
          <div>
            <p className="font-semibold text-foreground">Primary Accent</p>
            <p className="text-xs text-muted-foreground">Used for main interactive elements</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-lg bg-secondary ring-2 ring-background border shadow" />
          <div>
            <p className="font-semibold text-foreground">Secondary Fill</p>
            <p className="text-xs text-muted-foreground">Soft backgrounds for inactive tools</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
