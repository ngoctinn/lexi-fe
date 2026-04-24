"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LatencyMetricsProps {
  ttftMs?: number | null;
  latencyMs?: number | null;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  qualityScore?: number;
  className?: string;
}

export function LatencyMetrics({
  ttftMs,
  latencyMs,
  inputTokens,
  outputTokens,
  costUsd,
  qualityScore,
  className,
}: LatencyMetricsProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Only show if we have at least one metric
  const hasMetrics =
    ttftMs !== undefined ||
    latencyMs !== undefined ||
    inputTokens !== undefined ||
    outputTokens !== undefined ||
    costUsd !== undefined ||
    qualityScore !== undefined;

  if (!hasMetrics) return null;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <ChevronDown
          className={cn("size-3 mr-1 transition-transform", {
            "rotate-180": isExpanded,
          })}
        />
        Debug Metrics
      </Button>

      {isExpanded && (
        <div className="bg-muted/50 rounded-md p-2 text-xs space-y-1 border border-border/50">
          {ttftMs !== undefined && ttftMs !== null && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">TTFT:</span>
              <span className="font-mono">{ttftMs.toFixed(0)}ms</span>
            </div>
          )}
          {latencyMs !== undefined && latencyMs !== null && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Latency:</span>
              <span className="font-mono">{latencyMs.toFixed(0)}ms</span>
            </div>
          )}
          {inputTokens !== undefined && inputTokens > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Input tokens:</span>
              <span className="font-mono">{inputTokens}</span>
            </div>
          )}
          {outputTokens !== undefined && outputTokens > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Output tokens:</span>
              <span className="font-mono">{outputTokens}</span>
            </div>
          )}
          {costUsd !== undefined && costUsd > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cost:</span>
              <span className="font-mono">${costUsd.toFixed(4)}</span>
            </div>
          )}
          {qualityScore !== undefined && qualityScore > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quality:</span>
              <span className="font-mono">{qualityScore.toFixed(1)}/100</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
