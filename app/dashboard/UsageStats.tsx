"use client";
import { Globe, Monitor, Timer, Flame } from "lucide-react";

const mockStats = {
  totalSessions: 27,
  timeSpent: 1240, // minutes
  mostUsed: "chromium",
};

const typeIconMap = {
  chromium: <Globe className="text-orange-500" />,
  ubuntu: <Monitor className="text-orange-500" />,
  kali: <Monitor className="text-orange-500" />,
  fedora: <Monitor className="text-orange-500" />,
  libreoffice: <Monitor className="text-orange-500" />,
};

const statCards = [
  {
    label: "Total Sessions",
    value: mockStats.totalSessions,
    icon: <Flame size={28} className="text-orange-500" />,
    bg: "bg-gradient-to-br from-orange-100/80 to-white dark:from-orange-900/40 dark:to-black/30",
  },
  {
    label: "Time Spent",
    value: `${Math.floor(mockStats.timeSpent / 60)}h ${mockStats.timeSpent % 60}m`,
    icon: <Timer size={28} className="text-orange-500" />,
    bg: "bg-gradient-to-br from-orange-100/80 to-white dark:from-orange-900/40 dark:to-black/30",
  },
  {
    label: "Most Used Service",
    value: (
      <span className="flex items-center gap-2">
        {typeIconMap[mockStats.mostUsed]}
        <span className="capitalize">{mockStats.mostUsed}</span>
      </span>
    ),
    icon: typeIconMap[mockStats.mostUsed],
    bg: "bg-gradient-to-br from-orange-100/80 to-white dark:from-orange-900/40 dark:to-black/30",
  },
];

export default function UsageStats() {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-12">
      {statCards.map((card, i) => (
        <div
          key={i}
          className={`flex flex-col items-center justify-center p-8 rounded-2xl shadow-xl ${card.bg} backdrop-blur-lg border border-orange-200/30 hover:scale-[1.04] hover:shadow-2xl transition-all duration-200 group`}
        >
          <div className="mb-3 group-hover:scale-110 transition-transform duration-200">{card.label === "Most Used Service" ? null : card.icon}</div>
          {card.label === "Most Used Service" ? (
            <div className="flex flex-col items-center mb-1">
              <span className="mb-2">{typeIconMap[mockStats.mostUsed]}</span>
              <span className="text-2xl font-bold tracking-tight text-orange-700 group-hover:text-orange-800 transition-colors duration-200 capitalize">{mockStats.mostUsed}</span>
            </div>
          ) : (
            <div className="text-3xl font-extrabold mb-1 tracking-tight text-orange-700 group-hover:text-orange-800 transition-colors duration-200">{card.value}</div>
          )}
          <div className="text-sm text-orange-700 font-semibold opacity-80 group-hover:opacity-100 transition-opacity duration-200">{card.label}</div>
        </div>
      ))}
    </div>
  );
} 