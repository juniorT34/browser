"use client";
import { useState, useEffect } from "react";
import { Globe, Monitor, FileText, Plus, Upload as UploadIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import clsx from "clsx";
import { SERVICES } from "@/lib/constants";
import { Navbar } from "@/components/shared/Navbar";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const ICONS = { Globe, Monitor, FileText, Plus };
const SESSION_DURATION = 5 * 60; // 5 minutes in seconds

const SERVICE_DISPLAY_NAMES: Record<string, string> = {
  browser: 'Browser',
  desktop: 'Desktop',
  'file-viewer': 'File Viewer',
  future: 'Service',
};

export default function ServicesPage() {
  // Track state for each service card by key
  const [activeSessions, setActiveSessions] = useState<Record<string, { running: boolean; timeLeft: number }>>({});
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fullPageLoading, setFullPageLoading] = useState(false);

  // Timer effect for all running sessions
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSessions((prev) => {
        const updated: typeof prev = { ...prev };
        Object.keys(updated).forEach((key) => {
          if (updated[key].running && updated[key].timeLeft > 0) {
            updated[key] = { ...updated[key], timeLeft: updated[key].timeLeft - 1 };
          }
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format seconds as mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Handlers
  const handleStart = async (key: string) => {
    setFullPageLoading(true);
    try {
      // Simulate backend call (replace with real API call)
      await new Promise((res) => setTimeout(res, 1800));
      // Example: const res = await fetch('/api/start', ...)
      // try {
      //   const res = await fetch('/api/start', ...);
      //   if (!res.ok) throw new Error('Failed to start session');
      //   const { url } = await res.json();
      //   window.open(url, '_blank');
      // } catch (e) {
      //   console.error('Error starting session:', e);
      //   toast.error('Failed to start session.');
      //   return;
      // }
      const url = 'https://example.com/session'; // Replace with real URL from backend
      window.open(url, '_blank');
    } catch (e) {
      console.error('Error in handleStart:', e);
      toast.error('Failed to start session.');
    } finally {
      setFullPageLoading(false);
    }
    setActiveSessions((prev) => ({
      ...prev,
      [key]: { running: true, timeLeft: SESSION_DURATION },
    }));
    toast.success(`${SERVICE_DISPLAY_NAMES[key] || 'Service'} session started!`, { style: { color: '#22c55e' } });
  };
  const handleStop = (key: string) => {
    setActiveSessions((prev) => ({
      ...prev,
      [key]: { running: false, timeLeft: 0 },
    }));
    toast.success(`${SERVICE_DISPLAY_NAMES[key] || 'Service'} session stopped.`, { style: { color: '#22c55e' } });
  };
  const handleExtend = (key: string) => {
    setActiveSessions((prev) => {
      const current = prev[key] || { running: false, timeLeft: 0 };
      if (current.running && current.timeLeft < SESSION_DURATION) {
        toast.success(`${SERVICE_DISPLAY_NAMES[key] || 'Service'} session extended by 5 minutes!`, { style: { color: '#22c55e' } });
        return {
          ...prev,
          [key]: {
            running: true,
            timeLeft: Math.min(current.timeLeft + 5 * 60, SESSION_DURATION),
          },
        };
      }
      return prev;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
    setUploadSuccess(false);
    setUploadError(null);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadSuccess(false);
    setUploadError(null);
    try {
      // Simulate upload delay
      await new Promise((res) => setTimeout(res, 1200));
      // Uncomment below for real API call:
      // const formData = new FormData();
      // formData.append('file', selectedFile);
      // const res = await fetch('/api/browser/upload', {
      //   method: 'POST',
      //   body: formData,
      // });
      // if (!res.ok) throw new Error('Upload failed');
      setUploadSuccess(true);
      toast.success('File uploaded successfully!', { style: { color: '#22c55e' } });
      setTimeout(() => setFileViewerOpen(false), 1000);
    } catch {
      setUploadError('Failed to upload file.');
      toast.error('Failed to upload file.');
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  return (
    <>
      {fullPageLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm">
          <Loader2 className="animate-spin text-orange-600" size={64} />
          <div className="mt-6 text-xl font-semibold text-orange-700 dark:text-orange-300">Starting your secure session...</div>
        </div>
      )}
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-start pt-28 pb-16 px-4 bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-orange-950 dark:via-black dark:to-orange-900">
        <h1 className="text-4xl font-extrabold text-orange-600 dark:text-orange-400 mb-10">Disposable Services</h1>
        <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-12">
          {SERVICES.map((service) => {
            const Icon = ICONS[service.icon as keyof typeof ICONS];
            const session = activeSessions[service.key] || { running: false, timeLeft: SESSION_DURATION };
            return (
              <div
                key={service.key}
                className={clsx(
                  "flex flex-col items-center justify-center text-center bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-12 min-h-[420px] min-w-[320px] max-w-[420px] mx-auto transition-opacity",
                  !service.enabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {!session.running ? (
                  <>
                    <Icon className="w-14 h-14 text-orange-600 mx-auto" />
                    <h2 className="mt-6 mb-3 text-2xl font-bold text-orange-600 dark:text-orange-400">{service.name}</h2>
                    <p className="text-zinc-700 dark:text-zinc-200 mb-8 text-base">{service.desc}</p>
                    {service.key === "file-viewer" && (
                      <Dialog open={fileViewerOpen} onOpenChange={setFileViewerOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full cursor-pointer text-lg py-3 mb-4" variant="secondary">
                            Upload File
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Upload a File</DialogTitle>
                            <DialogDescription>
                              Select a file to view in the disposable environment.
                            </DialogDescription>
                          </DialogHeader>
                          {/* Enhanced file input with icon and label */}
                          <label
                            htmlFor="file-upload-input"
                            className="flex items-center gap-2 justify-center w-full px-4 py-2 mb-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-dashed border-orange-500 text-orange-600 dark:text-orange-400 cursor-pointer hover:bg-orange-50 dark:hover:bg-zinc-700 transition-colors text-base font-medium"
                          >
                            <UploadIcon className="w-5 h-5" />
                            {selectedFile ? selectedFile.name : "Click to choose a file"}
                            <input
                              id="file-upload-input"
                              type="file"
                              className="hidden"
                              onChange={handleFileChange}
                              disabled={uploading}
                            />
                          </label>
                          {uploading && (
                            <div className="text-orange-600 text-sm mb-2">Uploading...</div>
                          )}
                          {uploadSuccess && (
                            <div className="text-green-600 text-sm mb-2">Upload successful!</div>
                          )}
                          {uploadError && (
                            <div className="text-red-600 text-sm mb-2">{uploadError}</div>
                          )}
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="ghost" disabled={uploading}>Cancel</Button>
                            </DialogClose>
                            <Button
                              onClick={handleFileUpload}
                              disabled={!selectedFile || uploading}
                              className="cursor-pointer"
                            >
                              {uploading ? 'Uploading...' : 'Upload'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                    {service.select && (
                      <div className="w-full mb-6">
                        <label className="block mb-2 text-base font-medium text-zinc-700 dark:text-zinc-300 text-left pl-1">{service.select.label}</label>
                        <Select
                          defaultValue={service.select.default}
                          disabled={!service.enabled}
                        >
                          <SelectTrigger className="w-full cursor-pointer">
                            <SelectValue className="cursor-pointer" />
                          </SelectTrigger>
                          <SelectContent className="cursor-pointer">
                            {service.select.options.map((opt) => (
                              <SelectItem
                                key={opt.value}
                                value={opt.value}
                                disabled={!opt.enabled}
                                className="cursor-pointer"
                              >
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <Button
                      disabled={!service.enabled}
                      className="w-full cursor-pointer text-lg py-3"
                      onClick={() => handleStart(service.key)}
                    >
                      {service.action}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col items-center justify-center gap-4 w-full">
                      <Icon className="w-14 h-14 text-orange-600 mx-auto" />
                      <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400">{service.name}</h2>
                      <div className="flex flex-col items-center gap-2 mt-2 mb-4">
                        <span className="text-4xl font-mono font-bold text-zinc-900 dark:text-white tracking-widest">
                          {formatTime(session.timeLeft)}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">Session expires in</span>
                      </div>
                      <div className="flex flex-row gap-4 w-full mt-2">
                        <Button
                          variant="destructive"
                          className="flex-1 cursor-pointer text-base py-2"
                          onClick={() => handleStop(service.key)}
                        >
                          Stop
                        </Button>
                        <Button
                          variant="secondary"
                          className="flex-1 cursor-pointer text-base py-2"
                          onClick={() => handleExtend(service.key)}
                          disabled={session.timeLeft >= SESSION_DURATION}
                        >
                          Extend +5m
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
} 