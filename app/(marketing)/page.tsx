import {
  LandingHeader,
  LandingHero,
  LandingConversationPreview,
  LandingStats,
  LandingFeatures,
  LandingHowItWorks,
  LandingTestimonials,
  LandingFAQ,
  LandingCTA,
  LandingFooter,
} from "@/features/marketing";
import { Separator } from "@/components/ui/separator";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingHeader />

      <main className="flex-1">
        <LandingHero />
        <LandingConversationPreview />
        <LandingStats />
        <LandingFeatures />
        <Separator />
        <LandingHowItWorks />
        <Separator />
        <LandingTestimonials />
        <LandingFAQ />
        <LandingCTA />
      </main>

      <LandingFooter />
    </div>
  );
}
