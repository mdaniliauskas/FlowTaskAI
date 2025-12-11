"use client";
import Sidebar from "@/components/Sidebar";
import TaskInput from "@/components/TaskInput";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

function MainContent() {
  const { user, login } = useAuth();
  const [emailInput, setEmailInput] = useState("");

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#18181b] text-white">
        <div className="w-full max-w-sm p-6 bg-[#27272a] rounded-lg shadow-xl border border-white/5">
          <h1 className="text-2xl font-bold mb-2 text-center">FlowTask AI</h1>
          <p className="text-zinc-400 text-center mb-8 text-sm">Sign in to continue</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (emailInput.trim()) login(emailInput);
            }}
            className="flex flex-col gap-4"
          >
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-zinc-400 mb-1 ml-1">EMAIL</label>
              <input
                id="email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="you@example.com"
                className="w-full p-3 rounded-lg bg-[#18181b] border border-zinc-700 text-white focus:border-blue-500 focus:outline-none transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors mt-2"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#18181b] text-white flex">
      <Sidebar />
      <main className="ml-[280px] flex-1 p-8 pb-32">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">My Day</h1>
          <p className="text-zinc-400 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </header>

        <div className="space-y-4">
          {/* Task List Placeholder - Will be replaced by real data */}
          <div className="p-4 bg-[#27272a] rounded-lg flex items-center gap-3 border border-white/5 opacity-50">
            <div className="w-5 h-5 rounded-full border-2 border-zinc-500"></div>
            <span className="text-zinc-400">Empty logic placeholder</span>
          </div>
        </div>

        <TaskInput />
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
