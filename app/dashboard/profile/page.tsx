"use client";
import { useState } from "react";

const mockUser = {
  name: "Jane Doe",
  email: "jane@example.com",
  password: "********",
  createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
};

export default function ProfilePage() {
  const [user, setUser] = useState(mockUser);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      ...user,
      name: form.name,
      email: form.email,
      password: form.password ? "********" : user.password,
    });
    setEditing(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white/30 dark:bg-black/30 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-orange-200/30">
      <h2 className="text-2xl font-bold mb-6 text-orange-700">Profile</h2>
      <form onSubmit={handleSave} className="flex flex-col gap-4">
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
          <label className="block text-sm font-semibold mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={editing ? form.password : user.password}
            onChange={handleChange}
            disabled={!editing}
            placeholder={editing ? "Enter new password" : "********"}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white/60 dark:bg-black/40"
          />
        </div>
        <div className="flex gap-4 mt-4">
          {editing ? (
            <>
              <button
                type="submit"
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
      </form>
      <div className="mt-8 text-sm text-gray-600 dark:text-gray-400">
        <div>Account created: <span className="font-semibold">{user.createdAt}</span></div>
        <div>Last login: <span className="font-semibold">{user.lastLogin}</span></div>
      </div>
    </div>
  );
} 