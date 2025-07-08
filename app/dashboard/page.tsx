// import getServerSession from "next-auth";
// import { authConfig } from "@/auth.config";
// import type { Session } from "next-auth";
import UsageStats from "./UsageStats";
import SessionList from "./SessionList";
import SessionHistory from "./SessionHistory";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // let session: Session | null = null;
  try {
    if (!process.env.NEXTAUTH_URL) {
      console.error('Missing NEXTAUTH_URL environment variable.');
    }
    // session = (await getServerSession(authConfig) as unknown) as Session | null;
    // if (!session?.user) {
    //   redirect("/login");
    // }
  } catch (e: unknown) {
    // Ignore Next.js redirect "errors"
    if (
      e &&
      typeof e === "object" &&
      "digest" in e &&
      typeof (e as { digest?: unknown }).digest === "string" &&
      (e as { digest: string }).digest.includes("NEXT_REDIRECT")
    ) {
      throw e; // Let Next.js handle the redirect
    }
    console.error('Error fetching server session:', e);
    redirect("/login");
  }
  return (
    <div>
      <UsageStats />
      <h1 className="text-3xl font-bold mb-4">Your Sessions</h1>
      <SessionList />
      <SessionHistory />
    </div>
  );
} 