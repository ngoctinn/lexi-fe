import { cva, type VariantProps } from "class-variance-authority";
import { Avatar as AvatarPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "group/avatar relative flex shrink-0 rounded-full select-none outline-none ring-2 ring-background ring-offset-0 bg-background transition-transform hover:scale-105 active:scale-95",
  {
    variants: {
      size: {
        xs: "size-6", // 24px
        sm: "size-8", // 32px
        md: "size-10", // 40px
        default: "size-10", // 40px
        lg: "size-12", // 48px
        xl: "size-16", // 64px
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

function Avatar({
  className,
  size,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(avatarVariants({ size }), className)}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full rounded-full object-cover",
        className,
      )}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-primary-50 text-[0.8em] font-bold text-primary uppercase antialiased",
        className,
      )}
      {...props}
    />
  );
}

function AvatarBadge({
  className,
  variant = "online",
  ...props
}: React.ComponentProps<"span"> & { variant?: "online" | "offline" | "away" }) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex rounded-full ring-2 ring-background",
        variant === "online" && "bg-success",
        variant === "offline" && "bg-muted-foreground",
        variant === "away" && "bg-warning",
        "group-data-[size=xs]/avatar:size-2",
        "group-data-[size=sm]/avatar:size-2.5",
        "group-data-[size=md]/avatar:size-3",
        "group-data-[size=default]/avatar:size-3",
        "group-data-[size=lg]/avatar:size-3.5",
        "group-data-[size=xl]/avatar:size-4",
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroup({
  className,
  size = "md",
  ...props
}: React.ComponentProps<"div"> & {
  size?: VariantProps<typeof avatarVariants>["size"];
}) {
  return (
    <div
      data-slot="avatar-group"
      data-size={size}
      className={cn(
        "group/avatar-group flex items-center",
        // Negative margins scaled by size
        "*:data-[slot=avatar]:not-first:-ml-2.5",
        size === "xs" && "*:data-[slot=avatar]:not-first:-ml-2",
        size === "lg" && "*:data-[slot=avatar]:not-first:-ml-3",
        size === "xl" && "*:data-[slot=avatar]:not-first:-ml-4",
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full bg-muted text-[0.8em] font-bold text-muted-foreground ring-2 ring-background -ml-3 z-10",
        "group-data-[size=xs]/avatar-group:size-6",
        "group-data-[size=sm]/avatar-group:size-8",
        "group-data-[size=md]/avatar-group:size-10",
        "group-data-[size=default]/avatar-group:size-10",
        "group-data-[size=lg]/avatar-group:size-12",
        "group-data-[size=xl]/avatar-group:size-16",
        className,
      )}
      {...props}
    />
  );
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
};
