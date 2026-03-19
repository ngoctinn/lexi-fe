import {
  LandingHeader,
  LandingHero,
  LandingStats,
  LandingFeatures,
  LandingHowItWorks,
  LandingTestimonials,
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
        <LandingStats />
        <LandingFeatures />
        <Separator />
        <LandingHowItWorks />
        <Separator />
        <LandingTestimonials />
        <LandingCTA />
      </main>

      <LandingFooter />
    </div>
  );
}
