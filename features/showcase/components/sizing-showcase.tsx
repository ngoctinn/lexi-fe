"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SizingShowcase() {
  const SIZES = ["xs", "sm", "default", "lg", "xl"] as const

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Unified Sizing System (Nova Style)</CardTitle>
        <CardDescription>
          Consistent height scale across all interactive components:
          xs (24px), sm (28px), default (32px), lg (36px), xl (40px).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-sm font-bold text-muted-foreground uppercase tracking-wider">
                <th className="py-4 pr-4">Size</th>
                <th className="py-4 px-4">Button</th>
                <th className="py-4 px-4">Input</th>
                <th className="py-4 px-4">Select</th>
                <th className="py-4 px-4">Avatar</th>
                <th className="py-4 pl-4">Badge</th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map((size) => (
                <tr key={size} className="border-b last:border-0 hover:bg-muted/5 transition-colors">
                  <td className="py-6 pr-4 align-middle">
                    <span className="text-xs font-black uppercase bg-muted px-2 py-1 rounded-md">
                      {size === "default" ? "default (32px)" : size}
                    </span>
                  </td>
                  <td className="py-6 px-4 align-middle">
                    <Button size={size}>Action</Button>
                  </td>
                  <td className="py-6 px-4 align-middle">
                    <Input size={size} placeholder="Input field..." className="max-w-[150px]" />
                  </td>
                  <td className="py-6 px-4 align-middle">
                    <Select defaultValue="option-1">
                      <SelectTrigger size={size} className="w-[120px]">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option-1">Option 1</SelectItem>
                        <SelectItem value="option-2">Option 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-6 px-4 align-middle">
                    <Avatar size={size}>
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </td>
                  <td className="py-6 pl-4 align-middle">
                    <Badge size={size === "xl" ? "lg" : (size as any)}>Status</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-bold text-primary">Mixed Content Alignment (sm - 28px)</p>
            <div className="flex items-center gap-2 p-4 bg-muted/20 rounded-2xl border">
              <Avatar size="sm" />
              <Input size="sm" placeholder="Search..." className="w-40" />
              <Button size="sm">Go</Button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-sm font-bold text-primary">Large Actions (xl - 40px)</p>
            <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-2xl border">
              <Avatar size="default" /> {/* Avatar default is 40px */}
              <Input size="xl" placeholder="Your email..." className="flex-1" />
              <Button size="xl">Get Started</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
