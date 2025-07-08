"use client";
export const dynamic = "force-dynamic";
import { useState, useRef } from "react";
import { Trash2, LogOut, Smartphone, UploadCloud, User } from "lucide-react";
// import Image from "next/image";

const mockUser = {
  name: "Jane Doe",
  username: "janedoe",
  email: "jane@example.com",
  phone: "+1 555-123-4567",
  avatarUrl: "/avatar-default.png",
  role: "user",
  language: "English",
  timezone: "UTC+0",
  bio: "Security enthusiast. Loves disposable browsers.",
  twoFactorEnabled: true,
  createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
  lastPasswordChange: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  usage: {
    sessionsThisMonth: 7,
    sessionLimit: 10,
    timeSpent: 320, // minutes
  },
};

const mockActivity = [
  { type: "login", time: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(), desc: "Logged in from Chrome on Windows" },
  { type: "session", time: new Date(Date.now() - 3 * 60 * 60 * 1000).toLocaleString(), desc: "Started Chromium session" },
  { type: "password", time: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleString(), desc: "Changed password" },
];

const mockDevices = [
  { id: 1, name: "Chrome on Windows", lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(), current: true },
  { id: 2, name: "Safari on iPhone", lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000).toLocaleString(), current: false },
];

export default function ProfilePage() {
  const [user, setUser] = useState(mockUser);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    password: "",
    bio: user.bio,
    phone: user.phone,
  });
  const [avatar, setAvatar] = useState(user.avatarUrl);
  const [showDelete, setShowDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      ...user,
      name: form.name,
      email: form.email,
      bio: form.bio,
      phone: form.phone,
      avatarUrl: avatar,
    });
    setEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setAvatar(url);
    }
  };

  const handleDeleteAccount = () => {
    setShowDelete(false);
    alert("Account deleted (mock)");
  };

  const handleRevokeDevice = (id: number) => {
    alert(`Device ${id} revoked (mock)`);
  };

  return (
    <div className="mx-auto max-w-3xl py-10 px-2 md:px-0">
      <h2 className="text-3xl font-bold mb-8 text-orange-700">Profile</h2>
      <form onSubmit={handleSave} className="flex flex-col md:flex-row gap-10 mb-10">
        <div className="flex flex-col items-center gap-4 md:w-1/3">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-orange-100 flex items-center justify-center border-4 border-orange-200 shadow">
              <User size={64} className="text-orange-400" />
            </div>
            {/* Optionally keep the upload button for future avatar support */}
            {editing && (
              <button
                type="button"
                className="absolute bottom-0 right-0 bg-orange-600 text-white rounded-full p-1 shadow hover:bg-orange-700"
                onClick={() => fileInputRef.current?.click()}
                title="Upload new picture"
              >
                <UploadCloud size={18} />
              </button>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleAvatarChange}
              disabled={!editing}
            />
          </div>
          <div className="font-bold text-lg mt-2">{user.username}</div>
          <div className="text-xs text-gray-500">{user.role}</div>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={editing ? form.name : user.name}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white/60 dark:bg-black/40"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={editing ? form.email : user.email}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white/60 dark:bg-black/40"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={editing ? form.phone : user.phone}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white/60 dark:bg-black/40"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Bio</label>
            <textarea
              name="bio"
              value={editing ? form.bio : user.bio}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white/60 dark:bg-black/40"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              disabled={!editing}
              placeholder={editing ? "Enter new password" : "********"}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white/60 dark:bg-black/40"
            />
          </div>
        </div>
      </form>
      <div className="flex gap-4 mb-10">
        {editing ? (
          <>
            <button
              type="submit"
              onClick={handleSave}
              className="px-6 py-2 rounded-lg bg-orange-600 text-white font-semibold shadow hover:bg-orange-700 transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-6 py-2 rounded-lg border border-orange-600 text-orange-700 font-semibold shadow hover:bg-orange-50 transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="px-6 py-2 rounded-lg bg-orange-600 text-white font-semibold shadow hover:bg-orange-700 transition-colors"
          >
            Edit
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div>
          <div className="font-semibold text-orange-700 mb-2">Usage Limits</div>
          <div className="mb-2">Sessions this month: <span className="font-bold">{user.usage.sessionsThisMonth}</span> / {user.usage.sessionLimit}</div>
          <div className="mb-2">Time spent: <span className="font-bold">{user.usage.timeSpent}</span> min</div>
        </div>
        <div>
          <div className="font-semibold text-orange-700 mb-2">Active Sessions/Devices</div>
          <ul className="space-y-2">
            {mockDevices.map((d) => (
              <li key={d.id} className="flex items-center gap-2 bg-white/40 dark:bg-black/40 rounded-lg px-3 py-2 shadow">
                <Smartphone size={18} className="text-orange-500" />
                <span>{d.name}</span>
                <span className="text-xs text-gray-500 ml-auto">{d.lastActive}</span>
                {d.current ? (
                  <span className="ml-2 px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">Current</span>
                ) : (
                  <button
                    className="ml-2 px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs font-semibold hover:bg-orange-200"
                    onClick={() => handleRevokeDevice(d.id)}
                  >
                    Revoke
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mb-10">
        <div className="font-semibold text-orange-700 mb-2">Recent Account Activity</div>
        <ul className="space-y-2">
          {mockActivity.map((a, i) => (
            <li key={i} className="flex items-center gap-2 bg-white/40 dark:bg-black/40 rounded-lg px-3 py-2 shadow">
              <LogOut size={16} className="text-orange-500" />
              <span>{a.desc}</span>
              <span className="ml-auto text-xs text-gray-500">{a.time}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-10 text-sm text-gray-600 dark:text-gray-400">
        <div>Account created: <span className="font-semibold">{user.createdAt}</span></div>
        <div>Last login: <span className="font-semibold">{user.lastLogin}</span></div>
        <div>Last password change: <span className="font-semibold">{user.lastPasswordChange}</span></div>
      </div>
      <div className="flex justify-end">
        <button
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition-colors"
          onClick={() => setShowDelete(true)}
        >
          <Trash2 size={18} /> Delete Account
        </button>
      </div>
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-black rounded-xl p-8 shadow-2xl max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4 text-red-700">Confirm Account Deletion</h3>
            <p className="mb-6">Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="flex gap-4 justify-end">
              <button
                className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                onClick={() => setShowDelete(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
                onClick={handleDeleteAccount}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 