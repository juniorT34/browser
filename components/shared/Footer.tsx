import { DownloadExtensionButton } from "./DownloadExtensionButton";
import { CurrentYear } from "./CurrentYear";

export function Footer() {
  return (
    <footer className="w-full flex flex-col items-center justify-center text-center py-10 px-4">
      <div className="max-w-2xl w-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900 dark:text-white">Ready to Get Started?</h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-200 mb-8 max-w-xl mx-auto">
          Join thousands of users who trust OUSEC for their secure computing needs.
        </p>
        <DownloadExtensionButton />
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">&copy; <CurrentYear /> OUSEC. All rights reserved.</p>
      </div>
    </footer>
  );
} 