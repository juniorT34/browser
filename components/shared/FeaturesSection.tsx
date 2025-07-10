import { Card, CardContent } from "@/components/ui/card";
import { SERVICES, ICONS } from '@/lib/constants';
import type { Service } from '@/type';

export function FeaturesSection() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
      {SERVICES.map((service) => {
        const Icon = ICONS[service.icon as keyof typeof ICONS];
        return (
          <Card
            key={service.title}
            className="flex flex-col items-center justify-center text-center bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-6"
          >
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Icon className="text-orange-600 w-8 h-8 mx-auto" />
              <h3 className="mt-4 mb-2 text-lg font-bold text-orange-600 dark:text-orange-400">{service.title}</h3>
              <p className="text-dark-200 dark:text-zinc-300 text-sm">{service.desc}</p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
} 