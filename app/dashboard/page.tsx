import UsageStats from "./UsageStats";
import SessionList from "./SessionList";
import SessionHistory from "./SessionHistory";

export default function DashboardPage() {
  return (
    <div>
      <UsageStats />
      <h1 className="text-3xl font-bold mb-4">Your Sessions</h1>
      <SessionList />
      <SessionHistory />
    </div>
  );
} 