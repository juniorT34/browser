import "./globals.css";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "OUSEC | Secure Disposable Services",
  description: "Secure, disposable browser and desktop sessions in one click.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
