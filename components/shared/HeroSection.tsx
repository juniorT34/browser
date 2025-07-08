import { Logo } from "./Logo";
import { DownloadExtensionButton } from "./DownloadExtensionButton";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="flex flex-col items-center text-center pt-32 pb-16">
      <Logo size={96} />
      <h1 className="text-5xl font-extrabold text-orange-600 dark:text-orange-400 mt-6 mb-4">OUSEC</h1>
      <p className="text-xl text-gray-700 dark:text-gray-200 max-w-xl mb-8">
        Secure, Disposable Browsing & Desktop Sessions in One Click.<br />
        Launch secure, ephemeral browser and desktop environments for privacy, testing, and security.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <DownloadExtensionButton />
        <Button variant="outline" size="lg" className="border-orange-600 text-orange-600 dark:text-orange-400" asChild>
          <a href="/services">Get Started</a>
        </Button>
      </div>
    </section>
  );
} 