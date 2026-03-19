import React from "react";
import { TypographyShowcase } from "./typography-showcase";
import { ButtonShowcase } from "./button-showcase";
import { BadgeShowcase } from "./indicator-showcase";
import { FormShowcase } from "./form-showcase";
import { InteractiveShowcase } from "./interactive-showcase";
import { ModalShowcase } from "./modal-showcase";
import { FeedbackShowcase } from "./feedback-showcase";
import { OverlayShowcase } from "./overlay-showcase";
import { DataDisplayShowcase } from "./data-display-showcase";
import { AdvancedShowcase } from "./advanced-showcase";
import { AuthForm } from "@/features/auth";

export function Showcase() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Component Showcase</h1>
          <p className="text-muted-foreground mt-2">
            Tổng hợp và demo tất cả các UI Components cơ bản hiện có của Lexi, tuân theo quy tắc FSD và Shadcn/UI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* 1. Theme & Colors */}
          <Section title="1. Theme & Colors">
            <TypographyShowcase />
          </Section>

          {/* 2. Buttons */}
          <Section title="2. Buttons (Tactile Depth)">
            <ButtonShowcase />
          </Section>

          {/* 3. Indicators (Badge & Avatar) */}
          <Section title="3. Indicators (Badge & Avatar)">
            <BadgeShowcase />
          </Section>

          {/* 4. Form Elements */}
          <Section title="4. Forms & Inputs">
            <FormShowcase />
          </Section>

          {/* 5. Interactive Layouts */}
          <Section title="5. Accordion & Progress">
            <InteractiveShowcase />
          </Section>

          {/* 6. Overlays / Modals */}
          <Section title="6. Overlays (Modals & Tooltips)">
            <ModalShowcase />
            <OverlayShowcase />
          </Section>

          {/* 7. Feedback (Alerts & Toasts) */}
          <Section title="7. Feedback (Alerts & Toasts)">
            <FeedbackShowcase />
          </Section>

          {/* 8. Data Display (Tables, Tabs, Carousel) */}
          <Section title="8. Data Display">
            <DataDisplayShowcase />
          </Section>

          {/* 9. Advanced Components (Calendar, Command) */}
          <Section title="9. Advanced Components">
            <AdvancedShowcase />
          </Section>

          {/* 10. Authentication */}
          <Section title="10. Authentication">
            <AuthForm />
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 h-full">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      {children}
    </div>
  );
}
