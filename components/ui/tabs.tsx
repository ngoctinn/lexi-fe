"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const TabsContext = React.createContext<{ variant?: "default" | "soft" }>({});

function Tabs({
  className,
  orientation = "horizontal",
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root> & {
  variant?: "default" | "soft";
}) {
  return (
    <TabsContext.Provider value={{ variant }}>
      <TabsPrimitive.Root
        data-slot="tabs"
        data-orientation={orientation}
        className={cn(
          "group/tabs flex gap-2 data-horizontal:flex-col",
          className,
        )}
        {...props}
      />
    </TabsContext.Provider>
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const { variant } = React.useContext(TabsContext);
  
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "group/tabs-list inline-flex w-fit items-center justify-center gap-1 rounded-xl border border-control-border-subtle bg-control-bg-subtle p-1 text-muted-foreground shadow-inset-input group-data-vertical/tabs:flex-col group-data-vertical/tabs:items-stretch",
        variant === "soft" && "border-0 bg-transparent p-0 shadow-none gap-2",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { variant } = React.useContext(TabsContext);
  
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-9 flex-none items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-4 text-sm font-medium text-muted-foreground transition-all outline-none hover:bg-control-hover hover:text-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-control-border-subtle data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:shadow-xs data-[state=active]:ring-1 data-[state=active]:ring-control-border-subtle group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start",
        variant === "soft" && "data-[state=active]:bg-primary-50 data-[state=active]:text-primary data-[state=active]:border-primary-200 data-[state=active]:shadow-none data-[state=active]:ring-0",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
