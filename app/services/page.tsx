import { Globe, Monitor, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import clsx from "clsx";
import { SERVICES } from "@/lib/constants";
import { Navbar } from "@/components/shared/Navbar";

const ICONS = { Globe, Monitor, FileText, Plus };

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-start pt-28 pb-16 px-4 bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-orange-950 dark:via-black dark:to-orange-900">
        <h1 className="text-4xl font-extrabold text-orange-600 dark:text-orange-400 mb-10">Disposable Services</h1>
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-10">
          {SERVICES.map((service) => {
            const Icon = ICONS[service.icon as keyof typeof ICONS];
            return (
              <div
                key={service.key}
                className={clsx(
                  "flex flex-col items-center justify-center text-center bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-8 transition-opacity",
                  !service.enabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon className="w-10 h-10 text-orange-600 mx-auto" />
                <h2 className="mt-4 mb-2 text-xl font-bold text-orange-600 dark:text-orange-400">{service.name}</h2>
                <p className="text-zinc-700 dark:text-zinc-200 mb-6 text-sm">{service.desc}</p>
                {service.select && (
                  <div className="w-full mb-4">
                    <label className="block mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300 text-left pl-1">{service.select.label}</label>
                    <Select defaultValue={service.select.default} disabled={!service.enabled}>
                      <SelectTrigger className="w-full cursor-pointer">
                        <SelectValue className="cursor-pointer" />
                      </SelectTrigger>
                      <SelectContent className="cursor-pointer">
                        {service.select.options.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} disabled={!opt.enabled} className="cursor-pointer">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button disabled={!service.enabled} className="w-full cursor-pointer">
                  {service.action}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
} 