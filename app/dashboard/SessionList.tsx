"use client";
import { useState } from "react";
import { Session, SessionCard } from "./SessionCard";
import { toast } from "sonner";

const mockSessions: Session[] = [
  {
    id: "1",
    type: "chromium",
    status: "active",
    startTime: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    remaining: 180,
  },
  {
    id: "2",
    type: "ubuntu",
    status: "stopped",
    startTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    remaining: 0,
  },
];

export default function SessionList() {
  const [sessions, setSessions] = useState<Session[]>(mockSessions);

  const handleStop = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "stopped", remaining: 0 } : s))
    );
    toast.success("Session stopped.");
  };

  const handleExtend = (id: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id && s.status === "active"
          ? { ...s, remaining: s.remaining + 300 } // +5 min
          : s
      )
    );
    toast.success("Session extended by 5 minutes.");
  };

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <span className="text-4xl mb-2">🕒</span>
        <p className="text-lg font-semibold">No active sessions</p>
        <p className="text-sm">Start a new session from the Services page.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          onStop={handleStop}
          onExtend={handleExtend}
        />
      ))}
    </div>
  );
} 