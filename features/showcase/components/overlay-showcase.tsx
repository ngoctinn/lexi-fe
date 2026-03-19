"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Cloud, LogOut, User, Menu, FileText } from "lucide-react";

export function OverlayShowcase() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overlays & Tooltips</CardTitle>
        <CardDescription>Sheets, Menus, and contextual tooltips.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Tooltip</p>
          <div className="flex gap-4 items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <FileText />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View document details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm border-b border-dashed border-primary/50 cursor-pointer">Hover me</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Quick hint text</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Sheet (Side Panel)</p>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-max">
                <Menu data-icon="inline-start" />
                Open Mobile Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Lexi Navigation</SheetTitle>
                <SheetDescription>
                  Access all your learning modules from here.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 py-8">
                <Button variant="ghost" className="justify-start"><User data-icon="inline-start" /> Profile</Button>
                <Button variant="ghost" className="justify-start"><Cloud data-icon="inline-start" /> Sync Data</Button>
                <Button variant="ghost" className="justify-start text-destructive"><LogOut data-icon="inline-start" /> Logout</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Dropdown Menu</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="w-max">
                My Account
                <ChevronDown data-icon="inline-end" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <User />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Cloud />
                  <span>Sync Cloud</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </CardContent>
    </Card>
  );
}
