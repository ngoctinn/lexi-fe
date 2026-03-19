import { STATS } from "../data";

export function LandingStats() {
  return (
    <div className="border-y bg-muted/30">
      <div className="container mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {STATS.map(({ value, label }) => (
          <div key={label} className="flex flex-col gap-1">
            <span className="text-3xl font-bold tracking-tight">{value}</span>
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
