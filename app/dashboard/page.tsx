import getServerSession from "next-auth";
import { authConfig } from "@/auth.config";
import type { Session } from "next-auth";
import UsageStats from "./UsageStats";
import SessionList from "./SessionList";
import SessionHistory from "./SessionHistory";

export default async function DashboardPage() {
  const session = (await getServerSession(authConfig) as unknown) as Session | null;
  if (!session?.user) {
    return <div className="max-w-xl mx-auto mt-16 text-center text-xl font-bold text-red-600">Access Denied: Login required</div>;
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