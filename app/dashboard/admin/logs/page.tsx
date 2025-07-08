"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import React from "react";
import { addDays, format, parseISO, isAfter, isBefore } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface SessionLog {
  id: string;
  user: string;
  type: string;
  status: string;
  timestamp: string;
  message: string;
}

interface AuditLog {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  message: string;
}

interface ExecHistoryEntry {
  cmd: string;
  output: string;
}

const mockSessionLogs = [
  {
    id: "1",
    user: "alice",
    type: "chromium",
    status: "active",
    timestamp: "2025-07-08T12:34:56Z",
    message: "Session started.",
  },
  {
    id: "2",
    user: "bob",
    type: "ubuntu",
    status: "stopped",
    timestamp: "2025-07-08T11:20:00Z",
    message: "Container stopped by admin.",
  },
  {
    id: "3",
    user: "carol",
    type: "kali",
    status: "active",
    timestamp: "2025-07-08T12:40:00Z",
    message: "Session extended by 5 minutes.",
  },
];

const mockAuditLogs = [
  {
    id: "a1",
    user: "admin",
    action: "stop",
    target: "session 2",
    timestamp: "2025-07-08T11:20:01Z",
    message: "Stopped session 2 (ubuntu) for user bob.",
  },
  {
    id: "a2",
    user: "admin",
    action: "extend",
    target: "session 3",
    timestamp: "2025-07-08T12:40:01Z",
    message: "Extended session 3 (kali) for user carol.",
  },
];

const mockMetrics = [
  { label: "Active Sessions", value: 2 },
  { label: "Total Sessions Today", value: 12 },
  { label: "Stopped by Admin", value: 3 },
  { label: "Average Session Duration", value: "4m 32s" },
];

const PAGE_SIZE = 5;

export default function AdminLogsPage() {
  const [tab, setTab] = useState("sessions");
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>(mockSessionLogs);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);

  // Advanced filters for Session Logs
  const [sessionAction, setSessionAction] = useState("all");
  const [sessionUser, setSessionUser] = useState("");
  const [sessionDateFrom, setSessionDateFrom] = useState("");
  const [sessionDateTo, setSessionDateTo] = useState("");

  // Filter and search logic
  const filteredLogs = sessionLogs.filter((log) => {
    const matchesSearch =
      log.id.includes(search) ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.type.toLowerCase().includes(search.toLowerCase()) ||
      log.message.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" ? true : log.status === filterStatus;
    const matchesAction = sessionAction === "all" ? true : log.message.toLowerCase().includes(sessionAction);
    const matchesUser = sessionUser ? log.user.toLowerCase().includes(sessionUser.toLowerCase()) : true;
    const logDate = log.timestamp ? parseISO(log.timestamp) : null;
    const matchesDateFrom = sessionDateFrom ? (logDate ? isAfter(logDate, parseISO(sessionDateFrom)) || format(logDate, 'yyyy-MM-dd') === sessionDateFrom : false) : true;
    const matchesDateTo = sessionDateTo ? (logDate ? isBefore(logDate, addDays(parseISO(sessionDateTo), 1)) : false) : true;
    return matchesSearch && matchesStatus && matchesAction && matchesUser && matchesDateFrom && matchesDateTo;
  });
  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE) || 1;
  const paginatedLogs = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 on filter/search change
  React.useEffect(() => { setPage(1); }, [search, filterStatus, sessionAction, sessionUser, sessionDateFrom, sessionDateTo]);

  const handleStop = (id: string) => {
    setSessionLogs((logs) =>
      logs.map((log) =>
        log.id === id ? { ...log, status: "stopped", message: "Stopped by admin." } : log
      )
    );
    toast.success(`Session ${id} stopped.`);
  };

  const handleExtend = (id: string) => {
    setSessionLogs((logs) =>
      logs.map((log) =>
        log.id === id ? { ...log, message: "Session extended by 5 minutes." } : log
      )
    );
    toast.success(`Session ${id} extended by 5 minutes.`);
  };

  const handleView = (id: string) => {
    setViewSessionId(id);
    // For mock: show all logs for this session
    setViewSessionLogs(sessionLogs.filter((log) => log.id === id));
    setViewOpen(true);
  };

  const [execOpen, setExecOpen] = useState(false);
  const [execSessionId, setExecSessionId] = useState<string | null>(null);
  const [execCommand, setExecCommand] = useState("");
  const [execOutput, setExecOutput] = useState("");
  const [execLoading, setExecLoading] = useState(false);

  // Exec command history
  const [execHistory, setExecHistory] = useState<ExecHistoryEntry[]>([]);

  const handleExec = (id: string) => {
    setExecSessionId(id);
    setExecCommand("");
    setExecOutput("");
    setExecOpen(true);
  };

  const runExecCommand = async () => {
    setExecLoading(true);
    await new Promise((res) => setTimeout(res, 800));
    const output = `$ ${execCommand}\nMock output for session ${execSessionId}`;
    setExecOutput(output);
    setExecHistory((h) => [{cmd: execCommand, output}, ...h]);
    setExecLoading(false);
  };

  const [viewOpen, setViewOpen] = useState(false);
  const [viewSessionId, setViewSessionId] = useState<string | null>(null);
  const [viewSessionLogs, setViewSessionLogs] = useState<SessionLog[]>([]);

  const [auditSearch, setAuditSearch] = useState("");
  const [auditAction, setAuditAction] = useState("all");
  const [auditPage, setAuditPage] = useState(1);
  const [auditUser, setAuditUser] = useState("");
  const [auditDateFrom, setAuditDateFrom] = useState("");
  const [auditDateTo, setAuditDateTo] = useState("");

  // Filter logic for Audit Logs
  const auditFilteredLogs: AuditLog[] = mockAuditLogs.filter((log) => {
    const matchesSearch =
      log.id.includes(auditSearch) ||
      log.user.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.message.toLowerCase().includes(auditSearch.toLowerCase());
    const matchesAction = auditAction === "all" ? true : log.action === auditAction;
    const matchesUser = auditUser ? log.user.toLowerCase().includes(auditUser.toLowerCase()) : true;
    const logDate = log.timestamp ? parseISO(log.timestamp) : null;
    const matchesDateFrom = auditDateFrom ? (logDate ? isAfter(logDate, parseISO(auditDateFrom)) || format(logDate, 'yyyy-MM-dd') === auditDateFrom : false) : true;
    const matchesDateTo = auditDateTo ? (logDate ? isBefore(logDate, addDays(parseISO(auditDateTo), 1)) : false) : true;
    return matchesSearch && matchesAction && matchesUser && matchesDateFrom && matchesDateTo;
  });
  const auditTotalPages = Math.ceil(auditFilteredLogs.length / PAGE_SIZE) || 1;
  const auditPaginatedLogs: AuditLog[] = auditFilteredLogs.slice((auditPage - 1) * PAGE_SIZE, auditPage * PAGE_SIZE);
  React.useEffect(() => { setAuditPage(1); }, [auditSearch, auditAction, auditUser, auditDateFrom, auditDateTo]);

  // When session status changes to stopped, clear exec history and close modal if needed
  React.useEffect(() => {
    if (execSessionId) {
      const session = sessionLogs.find((log) => log.id === execSessionId);
      if (session && session.status !== "active") {
        setExecOpen(false);
        setExecHistory([]);
      }
    }
  }, [sessionLogs, execSessionId]);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-orange-700 dark:text-orange-400">Admin Logs & Metrics</h1>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="sessions">Session Logs</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>
        <TabsContent value="sessions">
          <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-wrap">
            <Input
              placeholder="Search by user, type, message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="stopped">Stopped</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sessionAction} onValueChange={setSessionAction}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="start">Start</SelectItem>
                <SelectItem value="stop">Stop</SelectItem>
                <SelectItem value="extend">Extend</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Filter by user..."
              value={sessionUser}
              onChange={(e) => setSessionUser(e.target.value)}
              className="max-w-xs"
            />
            <Input
              type="date"
              value={sessionDateFrom}
              onChange={(e) => setSessionDateFrom(e.target.value)}
              className="w-36"
              placeholder="From"
            />
            <Input
              type="date"
              value={sessionDateTo}
              onChange={(e) => setSessionDateTo(e.target.value)}
              className="w-36"
              placeholder="To"
            />
          </div>
          <div className="rounded-xl bg-white/70 dark:bg-black/30 shadow-lg p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-400">No logs found.</TableCell>
                  </TableRow>
                ) : (
                  paginatedLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.id}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>{log.type}</TableCell>
                      <TableCell>{log.status}</TableCell>
                      <TableCell>{new Date(log.timestamp).toLocaleTimeString()}</TableCell>
                      <TableCell>{log.message}</TableCell>
                      <TableCell>
                        <button className="px-2 py-1 bg-orange-500 text-white rounded mr-2" onClick={() => handleStop(log.id)} disabled={log.status !== "active"}>Stop</button>
                        <button className="px-2 py-1 bg-orange-100 text-orange-700 rounded mr-2" onClick={() => handleExtend(log.id)} disabled={log.status !== "active"}>Extend</button>
                        <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded mr-2" onClick={() => handleView(log.id)}>View</button>
                        {log.status === "active" && (
                          <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded" onClick={() => handleExec(log.id)}>Exec</button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <button
                  className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          {/* Exec Modal */}
          <Dialog open={execOpen} onOpenChange={setExecOpen}>
            <DialogContent className="max-w-lg w-full">
              <DialogHeader>
                <DialogTitle>Exec Command</DialogTitle>
                <DialogDescription>
                  Run a command inside session <span className="font-mono text-orange-600">{execSessionId}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 mt-2">
                <input
                  type="text"
                  className="border rounded px-3 py-2 text-sm bg-white dark:bg-black/30"
                  placeholder="Enter command (e.g. ps aux)"
                  value={execCommand}
                  onChange={e => setExecCommand(e.target.value)}
                  disabled={execLoading}
                  autoFocus
                />
                <button
                  className="px-4 py-2 rounded bg-orange-600 text-white font-semibold shadow hover:bg-orange-700 transition-colors disabled:opacity-50"
                  onClick={runExecCommand}
                  disabled={!execCommand.trim() || execLoading}
                >
                  {execLoading ? "Running..." : "Run"}
                </button>
                {execOutput && (
                  <pre className="bg-gray-900 text-green-400 rounded p-3 text-xs overflow-x-auto mt-2 whitespace-pre-wrap">{execOutput}</pre>
                )}
                {/* Only show history if session is still active */}
                {execSessionId && sessionLogs.find((log) => log.id === execSessionId)?.status === "active" && execHistory.length > 0 && (
                  <div className="mt-4">
                    <div className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">Command History</div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {execHistory.map((h, i) => (
                        <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-xs flex flex-col gap-1 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900" onClick={() => { setExecCommand(h.cmd); setExecOutput(h.output); }}>
                          <div className="font-mono text-blue-700 dark:text-blue-300">$ {h.cmd}</div>
                          <pre className="text-green-600 dark:text-green-400 whitespace-pre-wrap">{h.output}</pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          {/* View Modal */}
          <Dialog open={viewOpen} onOpenChange={setViewOpen}>
            <DialogContent className="max-w-lg w-full">
              <DialogHeader>
                <DialogTitle>Session Log Details</DialogTitle>
                <DialogDescription>
                  Detailed logs for session <span className="font-mono text-orange-600">{viewSessionId}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-80 overflow-y-auto mt-2 space-y-2">
                {viewSessionLogs.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">No logs for this session.</div>
                ) : (
                  viewSessionLogs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                      <span className={`mt-1 w-2 h-2 rounded-full ${log.status === "active" ? "bg-green-400" : log.status === "stopped" ? "bg-red-400" : "bg-gray-400"}`}></span>
                      <div>
                        <span className="font-mono text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={`ml-2 font-semibold ${log.status === "active" ? "text-green-700" : log.status === "stopped" ? "text-red-700" : "text-gray-500"}`}>{log.status.toUpperCase()}</span>
                        <span className="ml-2">{log.message}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
        <TabsContent value="audit">
          <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-wrap">
            <Input
              placeholder="Search by user, action, message..."
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select value={auditAction} onValueChange={setAuditAction}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="start">Start</SelectItem>
                <SelectItem value="stop">Stop</SelectItem>
                <SelectItem value="extend">Extend</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Filter by user..."
              value={auditUser}
              onChange={(e) => setAuditUser(e.target.value)}
              className="max-w-xs"
            />
            <Input
              type="date"
              value={auditDateFrom}
              onChange={(e) => setAuditDateFrom(e.target.value)}
              className="w-36"
              placeholder="From"
            />
            <Input
              type="date"
              value={auditDateTo}
              onChange={(e) => setAuditDateTo(e.target.value)}
              className="w-36"
              placeholder="To"
            />
          </div>
          <div className="rounded-xl bg-white/70 dark:bg-black/30 shadow-lg p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditPaginatedLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400">No logs found.</TableCell>
                  </TableRow>
                ) : (
                  auditPaginatedLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.id}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.target}</TableCell>
                      <TableCell>{new Date(log.timestamp).toLocaleTimeString()}</TableCell>
                      <TableCell>{log.message}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">Page {auditPage} of {auditTotalPages}</span>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                  onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                  disabled={auditPage === 1}
                >
                  Previous
                </button>
                <button
                  className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                  onClick={() => setAuditPage((p) => Math.min(auditTotalPages, p + 1))}
                  disabled={auditPage === auditTotalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="metrics">
          <div className="rounded-xl bg-white/70 dark:bg-black/30 shadow-lg p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {mockMetrics.map((metric) => (
              <div key={metric.label} className="flex flex-col items-center justify-center p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl shadow">
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-400 mb-2">{metric.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{metric.label}</div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 