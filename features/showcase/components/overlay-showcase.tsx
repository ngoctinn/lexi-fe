"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ChevronDown, Cloud, LogOut, User, Menu, FileText, Info } from "lucide-react";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function OverlayShowcase() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Overlays & Dialogs</CardTitle>
        <CardDescription>Comprehensive demo of modal surfaces and sheets.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-10">

        {/* 1. Modals Row */}
        <div className="flex flex-wrap gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">Settings Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Profile Settings</DialogTitle>
                <DialogDescription>Manage your learning preferences.</DialogDescription>
              </DialogHeader>
              <FieldGroup className="py-4">
                <Field><FieldLabel>Display Name</FieldLabel><Input defaultValue="Guest User" /></Field>
              </FieldGroup>
              <Button className="w-full">Update Settings</Button>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex-1">Destructive Alert</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>This action will delete all your 542 saved words.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground">Delete Everything</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* 2. Sheet Section */}
        <div className="flex flex-col gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Sheets (Drawers)</p>
          <div className="flex gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary" className="flex-1"><Menu data-icon="inline-start" /> App Navigator</Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Lexi.io</SheetTitle>
                  <SheetDescription>Explore the vocabulary universe.</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 py-8">
                  <Button variant="ghost" className="justify-start"><User data-icon="inline-start" /> Profile</Button>
                  <Button variant="ghost" className="justify-start"><Cloud data-icon="inline-start" /> Synchronize</Button>
                </div>
              </SheetContent>
            </Sheet>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex-1">Add Vocab Form</Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Add Word</SheetTitle>
                  <SheetDescription>Expand your mental dictionary.</SheetDescription>
                </SheetHeader>
                <FieldGroup className="py-8">
                  <Field><FieldLabel>Word</FieldLabel><Input placeholder="Serendipity" size="2xl" /></Field>
                  <Field><FieldLabel>Meaning</FieldLabel><Textarea placeholder="Finding good things..." size="2xl" /></Field>
                </FieldGroup>
                <SheetFooter><Button className="w-full shadow-flashcard" size="2xl">Save Changes</Button></SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* 3. Menus & Tooltips */}
        <div className="flex flex-wrap gap-x-8 gap-y-6 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-xl border border-primary/10">
                Action Menu <ChevronDown data-icon="inline-end" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="start">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem><User /> <span>Profile</span></DropdownMenuItem>
              <DropdownMenuItem disabled><Cloud /> <span>Cloud Sync</span></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive"><LogOut /> <span>Logout</span></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <TooltipProvider>
            <div className="flex gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-xl" className="bg-primary/5 text-primary border-none shadow-none"><Info /></Button>
                </TooltipTrigger>
                <TooltipContent>Status: Learning Pro</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                   <span className="text-sm font-bold border-b-2 border-primary/20 cursor-help">Context Help</span>
                </TooltipTrigger>
                <TooltipContent>Hover hints provide extra clarity.</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
