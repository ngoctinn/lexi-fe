"use client";

import React from "react";
import { TypographyShowcase } from "./typography-showcase";
import { ButtonShowcase } from "./button-showcase";
import { BadgeShowcase } from "./indicator-showcase";
import { FormShowcase } from "./form-showcase";
import { InteractiveShowcase } from "./interactive-showcase";
import { OverlayShowcase } from "./overlay-showcase";
import { FeedbackShowcase } from "./feedback-showcase";
import { DataDisplayShowcase } from "./data-display-showcase";
import { FlashcardShowcase } from "./flashcard-showcase";
import { AdvancedShowcase } from "./advanced-showcase";
import { SizingShowcase } from "./sizing-showcase";
import { LoginForm } from "@/features/auth";
import { Badge } from "@/components/ui/badge";
export function Showcase({ dashboard }: { dashboard?: React.ReactNode }) {
  return (
    <div className="container mx-auto py-16 px-4 max-w-7xl animate-in fade-in duration-700">
      <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <h1 className="text-display-lg font-black tracking-tight text-foreground uppercase italic ring-offset-4">
            Lexi<span className="text-primary italic">.</span>UI
          </h1>
          <p className="text-xl text-muted-foreground mt-4 leading-relaxed font-medium">
            Phòng thí nghiệm thiết kế Lexi. Nơi chúng tôi tinh chỉnh các tương tác cảm ứng,
            độ sâu vật lý và trải nghiệm học tập đỉnh cao.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-5 py-2.5 bg-background shadow-flashcard-solid rounded-2xl border border-primary-100 text-primary-600 text-2xs font-black uppercase tracking-[0.2em]">
            v2.0 Beta
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 auto-rows-auto gap-6 sm:gap-8">
        <div className="md:col-span-4 lg:col-span-6">
          <SizingShowcase />
        </div>

        {/* Large Feature Block - No background requested */}
        <div className="md:col-span-2 lg:col-span-3 lg:row-span-2 overflow-hidden">
          <FlashcardShowcase />
        </div>

        {/* Auth Module Block */}
        <div className="md:col-span-2 lg:col-span-3 lg:row-span-2">
          <LoginForm />
        </div>

        {/* Dashboard Preview */}
        <div className="md:col-span-4 lg:col-span-6 bg-background rounded-[2.5rem] p-4 lg:p-8 border border-primary-50 shadow-flashcard-solid">
           <div className="mb-8 px-4 flex justify-between items-center">
             <div>
               <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Preview</h2>
               <p className="text-muted-foreground text-sm">Cái nhìn tổng quan về trung tâm điều khiển của học viên.</p>
             </div>
             <Badge>Khu vực riêng tư</Badge>
           </div>
           {dashboard}
        </div>

        {/* Indicators (Tall Block) */}
        <div className="md:col-span-2 lg:col-span-2 lg:row-span-2">
          <BadgeShowcase />
        </div>

        {/* Core Elements Blocks */}
        <div className="md:col-span-2 lg:col-span-2">
          <ButtonShowcase />
        </div>

        <div className="md:col-span-2 lg:col-span-2">
          <InteractiveShowcase />
        </div>

        {/* Form Block (Wide) */}
        <div className="md:col-span-4 lg:col-span-4">
          <FormShowcase />
        </div>

        {/* Layout & Overlays */}
        <div className="md:col-span-2 lg:col-span-2">
          <OverlayShowcase />
        </div>

        <div className="md:col-span-2 lg:col-span-2">
          <DataDisplayShowcase />
        </div>

        <div className="md:col-span-2 lg:col-span-2">
          <FeedbackShowcase />
        </div>

        <div className="md:col-span-2 lg:col-span-2">
          <AdvancedShowcase />
        </div>

        {/* Global Tokens */}
        <div className="md:col-span-4 lg:col-span-6 mt-8">
          <TypographyShowcase />
        </div>
      </div>

      <div className="mt-20 py-10 border-t border-primary-50 text-center">
        <p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
          Designed by Antigravity & Lexi Team • 2026
        </p>
      </div>
    </div>
  );
}
