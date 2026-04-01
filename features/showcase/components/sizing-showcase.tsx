import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function SizingShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sizing System</CardTitle>
        <CardDescription>Consistent sizing across all components.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-bold text-primary flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            Button Sizes
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="xs">XS</Button>
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
            <Button size="2xl">2X Large</Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-sm font-bold text-primary flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            Input Sizes
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Input size="xs" placeholder="XS" className="w-32" />
            <Input size="sm" placeholder="Small" className="w-40" />
            <Input size="default" placeholder="Default" className="w-48" />
            <Input size="lg" placeholder="Large" className="w-56" />
            <Input size="xl" placeholder="Extra Large" className="w-64" />
            <Input size="2xl" placeholder="2X Large" className="w-72" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-sm font-bold text-primary flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            Avatar Sizes
          </p>
          <div className="flex items-center gap-4">
            <Avatar size="xs">
              <AvatarImage src="/avatars/user.jpg" alt="User" />
              <AvatarFallback>XS</AvatarFallback>
            </Avatar>
            <Avatar size="sm">
              <AvatarImage src="/avatars/user.jpg" alt="User" />
              <AvatarFallback>SM</AvatarFallback>
            </Avatar>
            <Avatar size="default">
              <AvatarImage src="/avatars/user.jpg" alt="User" />
              <AvatarFallback>DF</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarImage src="/avatars/user.jpg" alt="User" />
              <AvatarFallback>LG</AvatarFallback>
            </Avatar>
            <Avatar size="xl">
              <AvatarImage src="/avatars/user.jpg" alt="User" />
              <AvatarFallback>XL</AvatarFallback>
            </Avatar>
            <Avatar size="2xl">
              <AvatarImage src="/avatars/user.jpg" alt="User" />
              <AvatarFallback>2XL</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-sm font-bold text-primary flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            Badge Sizes
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">XS</Badge>
            <Badge variant="secondary" className="text-[11px] h-5 px-2">Small</Badge>
            <Badge variant="secondary" className="text-[12px] h-6 px-2.5">Default</Badge>
            <Badge variant="secondary" className="text-[13px] h-7 px-3">Large</Badge>
            <Badge variant="secondary" className="text-[14px] h-8 px-3.5">Extra Large</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
