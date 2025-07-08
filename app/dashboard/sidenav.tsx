import Link from "next/link";

export default function SideNav() {
  return (
    <nav className="h-full bg-white/10 dark:bg-black/20 backdrop-blur-md shadow-lg rounded-r-xl flex flex-col gap-4 p-6 text-orange-600">
      <div className="mb-8 text-2xl font-bold tracking-tight">OUSEC</div>
      <ul className="flex flex-col gap-2">
        <li>
          <Link href="/dashboard" className="font-semibold text-orange-600 hover:text-orange-700 transition-colors">
            Sessions
          </Link>
        </li>
        <li>
          <span className="font-semibold text-gray-400 cursor-not-allowed">Logs</span>
        </li>
        <li>
          <span className="font-semibold text-gray-400 cursor-not-allowed">Profile</span>
        </li>
      </ul>
    </nav>
  );
} 