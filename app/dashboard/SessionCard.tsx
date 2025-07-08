"use client";
import { useEffect, useState } from "react";
import { Monitor, Timer, StopCircle, PlusCircle } from "lucide-react";

export type Session = {
  id: string;
  type: "chromium" | "ubuntu" | "kali" | "fedora" | "libreoffice";
  status: "active" | "expired" | "stopped";
  startTime: string; // ISO string
  remaining: number; // seconds
};

const typeIconMap = {
  chromium: <Monitor className="text-blue-500" />,
  ubuntu: <Monitor className="text-orange-500" />,
  kali: <Monitor className="text-cyan-500" />,
  fedora: <Monitor className="text-indigo-500" />,
  libreoffice: <Monitor className="text-green-500" />,
};

export function SessionCard({ session, onStop, onExtend }: {
  session: Session;
  onStop: (id: string) => void;
  onExtend: (id: string) => void;
}) {
  const [remaining, setRemaining] = useState(session.remaining);

  useEffect(() => {
    if (session.status !== "active") return;
    const interval = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [session.status]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="bg-white/30 dark:bg-black/30 backdrop-blur-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4 border border-orange-200/30 hover:scale-[1.02] transition-transform">
      <div className="flex items-center gap-3">
        <div className="text-2xl">
          {typeIconMap[session.type]}
        </div>
        <div className="font-bold text-lg capitalize">
          {session.type}
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${session.status === "active" ? "bg-green-100 text-green-700" : session.status === "expired" ? "bg-gray-200 text-gray-500" : "bg-red-100 text-red-700"}`}>
          {session.status}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <Timer size={16} />
        <span>
          {minutes}:{seconds.toString().padStart(2, "0")} remaining
        </span>
        <span className="ml-auto">Started: {new Date(session.startTime).toLocaleTimeString()}</span>
      </div>
      {session.status === "active" && (
        <div className="flex gap-3 mt-2">
          <button
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-orange-600 text-white font-semibold shadow hover:bg-orange-700 transition-colors disabled:opacity-50"
            onClick={() => onStop(session.id)}
            disabled={session.status !== "active"}
          >
            <StopCircle size={18} /> Stop
          </button>
          <button
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-orange-600 text-orange-700 font-semibold shadow hover:bg-orange-50 transition-colors disabled:opacity-50"
            onClick={() => onExtend(session.id)}
            disabled={session.status !== "active"}
          >
            <PlusCircle size={18} /> Extend +5m
          </button>
        </div>
      )}
    </div>
  );
} 