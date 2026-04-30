"use client";

import * as React from "react";
import { Activity, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SessionMetricsPanelProps {
  session: {
    assigned_model?: string;
    avg_ttft_ms?: number;
    avg_latency_ms?: number;
    avg_output_tokens?: number;
    total_cost_usd?: number;
    total_turns?: number;
    user_turns?: number;
  } | null;
  className?: string;
}

export function SessionMetricsPanel({ session, className }: SessionMetricsPanelProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  // Only render after client mount to avoid hydration mismatch
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only show if we have session-level metrics
  const hasMetrics =
    session?.assigned_model ||
    (session?.avg_ttft_ms !== undefined && session.avg_ttft_ms > 0) ||
    (session?.avg_latency_ms !== undefined && session.avg_latency_ms > 0) ||
    (session?.avg_output_tokens !== undefined && session.avg_output_tokens > 0) ||
    (session?.total_cost_usd !== undefined && session.total_cost_usd > 0);

  // Don't render until mounted (avoid hydration mismatch)
  if (!isMounted || !hasMetrics) return null;

  return (
    <div className={cn("flex flex-col gap-2 border-t border-border pt-3", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground justify-start"
      >
        <Activity className="size-3 mr-2" />
        Session Metrics
        <ChevronDown
          className={cn("size-3 ml-auto transition-transform", {
            "rotate-180": isExpanded,
          })}
        />
      </Button>

      {isExpanded && (
        <div className="bg-muted/50 rounded-md p-3 text-xs space-y-2 border border-border/50">
          {session?.assigned_model && (
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground font-semibold">Model:</span>
              <span className="font-mono text-[10px] break-all">{session.assigned_model}</span>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2">
            {session?.avg_ttft_ms !== undefined && session.avg_ttft_ms > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Avg TTFT:</span>
                <span className="font-mono font-semibold">{session.avg_ttft_ms.toFixed(0)}ms</span>
              </div>
            )}
            {session?.avg_latency_ms !== undefined && session.avg_latency_ms > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Avg Latency:</span>
                <span className="font-mono font-semibold">{session.avg_latency_ms.toFixed(0)}ms</span>
              </div>
            )}
            {session?.avg_output_tokens !== undefined && session.avg_output_tokens > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Avg Tokens:</span>
                <span className="font-mono font-semibold">{session.avg_output_tokens}</span>
              </div>
            )}
            {session?.total_cost_usd !== undefined && session.total_cost_usd > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Total Cost:</span>
                <span className="font-mono font-semibold">${session.total_cost_usd.toFixed(4)}</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-border/50 text-[10px] text-muted-foreground">
            Based on {session?.total_turns || 0} turns ({session?.user_turns || 0} user)
          </div>
        </div>
      )}
    </div>
  );
}
