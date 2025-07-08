"use client";
import { useState } from "react";
import { Globe, Monitor } from "lucide-react";

const mockHistory = [
  {
    id: "1",
    type: "chromium",
    status: "stopped",
    startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 58 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    type: "ubuntu",
    status: "expired",
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
  },
];

const typeIconMap = {
  chromium: <Globe className="text-blue-500" />,
  ubuntu: <Monitor className="text-orange-500" />,
  kali: <Monitor className="text-orange-500" />,
  fedora: <Monitor className="text-orange-500" />,
  libreoffice: <Monitor className="text-orange-500" />,
};

const statusColors = {
  stopped: "bg-red-100 text-red-700",
  expired: "bg-gray-200 text-gray-500",
  active: "bg-green-100 text-green-700",
};

export default function SessionHistory() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = mockHistory.filter((s) =>
    (filter === "all" || s.status === filter) &&
    (search === "" || s.type.includes(search.toLowerCase()))
  );

  return (
    <div className="mt-10">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white/60 dark:bg-black/40"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white/60 dark:bg-black/40"
        >
          <option value="all">All Statuses</option>
          <option value="stopped">Stopped</option>
          <option value="expired">Expired</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-400">
          <span className="text-4xl mb-2">🗂️</span>
          <p className="text-lg font-semibold">No session history found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-xl bg-gradient-to-br from-orange-100/60 to-white dark:from-orange-900/30 dark:to-black/20 border border-orange-200/30">
          <table className="min-w-full divide-y divide-orange-100">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Started</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">Ended</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-50">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-orange-50/50 transition-colors duration-150">
                  <td className="px-6 py-4 flex items-center gap-2 font-semibold">
                    {typeIconMap[s.type]}
                    <span className="capitalize">{s.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[s.status]}`}>{s.status}</span>
                  </td>
                  <td className="px-6 py-4">{new Date(s.startTime).toLocaleString()}</td>
                  <td className="px-6 py-4">{new Date(s.endTime).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 