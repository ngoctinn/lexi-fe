"use client";

import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "../data";

export function LandingFAQ() {
  return (
    <section className="py-24 md:py-32 bg-muted/30" id="faq">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="flex flex-col items-center gap-4 text-center mb-12">
          <Badge variant="secondary">Câu hỏi thường gặp</Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Xử lý các thắc mắc trước khi bắt đầu
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Phần này giúp người dùng hiểu nhanh Lexi phù hợp với ai, học thế nào
            và có cần cam kết dài hạn hay không.
          </p>
        </div>

        <Accordion type="single" collapsible className="gap-3">
          {FAQS.map(({ question, answer }, index) => (
            <AccordionItem
              key={question}
              value={`faq-${index}`}
              className="mb-3 border border-border/70 bg-card shadow-sm"
            >
              <AccordionTrigger className="px-1 text-base md:text-lg">
                {question}
              </AccordionTrigger>
              <AccordionContent className="px-1 text-muted-foreground">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
