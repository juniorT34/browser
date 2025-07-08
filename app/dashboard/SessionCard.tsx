"use client";
import { useEffect, useState } from "react";
import { Globe, Monitor, Timer, StopCircle, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export type Session = {
  id: string;
  type: "chromium" | "ubuntu" | "kali" | "fedora" | "libreoffice";
  status: "active" | "expired" | "stopped";
  startTime: string; // ISO string
  remaining: number; // seconds
};

export type LogEntry = {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
};

const typeIconMap = {
  chromium: <Globe className="text-orange-500" />,
  ubuntu: <Monitor className="text-orange-500" />,
  kali: <Monitor className="text-orange-500" />,
  fedora: <Monitor className="text-orange-500" />,
  libreoffice: <Monitor className="text-orange-500" />,
};

export function SessionCard({ session, onStop, onExtend, logs = [] }: {
  session: Session;
  onStop: (id: string) => void;
  onExtend: (id: string) => void;
  logs?: LogEntry[];
}) {
  const [remaining, setRemaining] = useState(session.remaining);
  const [showLogs, setShowLogs] = useState(false);

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
    <div className="bg-gradient-to-br from-orange-100/70 to-white dark:from-orange-900/40 dark:to-black/30 backdrop-blur-lg rounded-2xl shadow-xl p-7 flex flex-col gap-4 border border-orange-200/30 hover:scale-[1.03] hover:shadow-2xl transition-all duration-200 group">
      <div className="flex items-center gap-3 mb-1">
        <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
          {typeIconMap[session.type]}
        </div>
        <div className="font-bold text-lg capitalize text-orange-700 group-hover:text-orange-800 transition-colors duration-200">
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
      <Dialog open={showLogs} onOpenChange={setShowLogs}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Session Logs</DialogTitle>
            <DialogDescription>
              Logs for session <span className="font-mono text-orange-600">{session.id}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-72 overflow-y-auto mt-2 space-y-2">
            {logs.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No logs for this session.</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                  <span className={`mt-1 w-2 h-2 rounded-full ${log.level === "info" ? "bg-blue-400" : log.level === "warn" ? "bg-yellow-400" : "bg-red-500"}`}></span>
                  <div>
                    <span className="font-mono text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className={`ml-2 font-semibold ${log.level === "info" ? "text-blue-500" : log.level === "warn" ? "text-yellow-600" : "text-red-600"}`}>{log.level.toUpperCase()}</span>
                    <span className="ml-2">{log.message}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 