import { Navbar } from "@/components/shared/Navbar";
import { HeroSection } from "@/components/shared/HeroSection";
import { FeaturesSection } from "@/components/shared/FeaturesSection";
import { WhyChooseSection } from "@/components/shared/WhyChooseSection";
import { Footer } from "@/components/shared/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-orange-950 dark:via-black dark:to-orange-900" suppressHydrationWarning>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center">
        <HeroSection />
        <FeaturesSection />
        <WhyChooseSection />
      </main>
      <Footer />
    </div>
  );
}
