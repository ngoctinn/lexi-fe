import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function McpTestPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <section className="w-full max-w-sm space-y-4 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">MCP test</h1>
          <p className="text-sm text-muted-foreground">
            Minimal page for shadcn component verification.
          </p>
        </div>

        <Input placeholder="Type here" />
        <Button className="w-full">Submit</Button>
      </section>
    </main>
  );
}
