"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { type VariantProps } from "class-variance-authority";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { selectTriggerVariants } from "@/components/ui/select";

const ComboboxContext = React.createContext<{
  size?: VariantProps<typeof selectTriggerVariants>["size"];
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

function Combobox({
  children,
  size = "default",
  open: openProp,
  onOpenChange,
}: {
  children: React.ReactNode;
  size?: VariantProps<typeof selectTriggerVariants>["size"];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  return (
    <ComboboxContext.Provider value={{ size, open, setOpen }}>
      <Popover open={open} onOpenChange={setOpen}>
        {children}
      </Popover>
    </ComboboxContext.Provider>
  );
}

const ComboboxTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverTrigger>,
  React.ComponentPropsWithoutRef<typeof PopoverTrigger> & {
    placeholder?: string;
    value?: string;
  }
>(
  (
    { className, children, placeholder = "Select...", value, ...props },
    ref,
  ) => {
    const { size } = React.useContext(ComboboxContext);

    return (
      <PopoverTrigger asChild ref={ref} {...props}>
        <button
          type="button"
          data-slot="combobox-trigger"
          data-size={size}
          className={cn(selectTriggerVariants({ size, className }), "w-full")}
        >
          <span className="flex-1 text-left truncate">
            {value || children || (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
    );
  },
);
ComboboxTrigger.displayName = "ComboboxTrigger";

const ComboboxContent = React.forwardRef<
  React.ElementRef<typeof PopoverContent>,
  React.ComponentPropsWithoutRef<typeof PopoverContent>
>(({ className, children, align = "start", sideOffset = 4, ...props }, ref) => {
  return (
    <PopoverContent
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      data-slot="combobox-content"
      style={{ width: "var(--radix-popover-trigger-width)" }}
      className={cn("p-0 overflow-hidden", className)}
      {...props}
    >
      <Command className="rounded-none! border-none shadow-none">
        {children}
      </Command>
    </PopoverContent>
  );
});
ComboboxContent.displayName = "ComboboxContent";

const ComboboxInput = React.forwardRef<
  React.ElementRef<typeof CommandInput>,
  React.ComponentPropsWithoutRef<typeof CommandInput>
>(({ className, ...props }, ref) => {
  const { size } = React.useContext(ComboboxContext);

  return (
    <CommandInput
      ref={ref}
      className={cn(
        size === "lg" || size === "xl" ? "h-10!" : "h-8!",
        className,
      )}
      {...props}
    />
  );
});
ComboboxInput.displayName = "ComboboxInput";

const ComboboxItem = React.forwardRef<
  React.ElementRef<typeof CommandItem>,
  React.ComponentPropsWithoutRef<typeof CommandItem> & {
    selected?: boolean;
  }
>(({ className, children, selected, onSelect, ...props }, ref) => {
  const { setOpen, size } = React.useContext(ComboboxContext);

  return (
    <CommandItem
      ref={ref}
      onSelect={(value) => {
        onSelect?.(value);
        setOpen(false);
      }}
      className={cn(
        "flex items-center gap-2 px-2 py-1.5",
        size === "lg" || size === "xl" ? "px-3 py-2 text-[15px]" : "text-sm",
        className,
      )}
      {...props}
    >
      {children}
      <CheckIcon
        className={cn(
          "ml-auto size-4 shrink-0",
          selected ? "opacity-100" : "opacity-0",
        )}
      />
    </CommandItem>
  );
});
ComboboxItem.displayName = "ComboboxItem";

export {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  CommandList as ComboboxList,
  CommandEmpty as ComboboxEmpty,
  CommandGroup as ComboboxGroup,
};
