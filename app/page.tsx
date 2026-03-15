import { ExampleResults } from "@/components/sections/example-results";
import { FaqSection } from "@/components/sections/faq-section";
import { HeroSection } from "@/components/sections/hero-section";
import { HowItWorks } from "@/components/sections/how-it-works";
import { PublicResults } from "@/components/sections/public-results";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <ExampleResults />
      <PublicResults />
      <FaqSection />
    </>
  );
}

