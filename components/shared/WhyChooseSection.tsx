import { CheckCircle, Shield, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { WHY_CHOOSE_FEATURES } from "@/lib/constants";

export function WhyChooseSection() {
  return (
    <section className="w-full flex flex-col md:flex-row gap-8 items-center justify-center py-16 px-4">
      <div className="flex-1 max-w-xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-8">
        <h2 className="text-4xl font-bold mb-4 text-zinc-900 dark:text-white">Why Choose OUSEC?</h2>
        <p className="mb-6 text-zinc-600 dark:text-zinc-200">
          Built for security professionals, developers, and privacy-conscious users who need reliable, temporary computing environments.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {WHY_CHOOSE_FEATURES.map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <CheckCircle className="text-green-500 w-5 h-5" />
              <span className="text-zinc-900 dark:text-white">{feature}</span>
            </div>
          ))}
        </div>
      </div>
      <Card className="flex-1 max-w-sm bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
        <CardContent className="flex flex-col items-center py-8">
          <Shield className="w-12 h-12 text-orange-500 mb-4" />
          <h3 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Enterprise Security</h3>
          <p className="text-zinc-600 dark:text-zinc-200 mb-4 text-center">
            Military-grade encryption and isolation protocols ensure your data stays protected.
          </p>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Trusted by 10,000+ users</span>
        </CardContent>
      </Card>
    </section>
  );
} 