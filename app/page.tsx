"use client";

import { useSearchParams } from "next/navigation";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import TaskInput from "@/components/TaskInput";
import TaskItem from "@/components/TaskItem";
import { Database } from "@/types/supabase";
import { Suspense } from "react";

// Mock data for initial state
const MOCK_TASKS = [
  { id: '1', title: 'Plan launch strategy', is_completed: false, is_important: true, is_my_day: true, notes: 'Detail note', due_date: null, position: 0, ai_enrichment: null },
  { id: '2', title: 'Review marketing copy', is_completed: true, is_important: false, is_my_day: false, notes: null, due_date: null, position: 1, ai_enrichment: { content: "Consider focusing on value proposition..." } },
];

type Task = Database["public"]["Tables"]["tasks"]["Row"];

function MainContent() {
  const { user, login } = useAuth();
  const [emailInput, setEmailInput] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);

  // Filter tasks based on URL params - Moved to top to avoid hoisting issues
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') || 'all';
  const listId = searchParams.get('list');

  // Initialize with mock data for prototype feel, later replace with DB fetch
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        let url = '/api/tasks';
        const params = new URLSearchParams();
        if (listId) params.append('listId', listId);
        if (filter !== 'all') params.append('filter', filter);

        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        }
      } catch (error) {
        console.error('Failed to fetch tasks', error);
      }
    };

    fetchTasks();
  }, [listId, filter]);

  // Supabase Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Realtime update:', payload);
          // Simple optimisic update logic for prototype
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => [...prev, payload.new as Task]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) => prev.map(t => t.id === payload.new.id ? payload.new as Task : t));
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter(t => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleToggle = async (id: string, completed: boolean) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, is_completed: completed } : t));
    console.log(`Toggling task ${id} to ${completed}`);

    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed: completed })
      });
    } catch (error) {
      console.error('Failed to toggle task', error);
    }
  };

  const handleToggleImportant = async (id: string, important: boolean) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, is_important: important } : t));
    console.log(`Toggling task ${id} importance to ${important}`);

    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_important: important })
      });
    } catch (error) {
      console.error('Failed to toggle importance', error);
    }
  };

  const handleUpdateNotes = async (id: string, notes: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, notes: notes } : t));
    console.log(`Updated notes for task ${id}`);

    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes })
      });
    } catch (error) {
      console.error('Failed to update notes', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'my-day') return task.is_my_day;
    if (filter === 'important') return task.is_important;
    if (listId) return task.list_id === listId;
    return true;
  });

  const getPageTitle = () => {
    if (filter === 'my-day') return 'My Day';
    if (filter === 'important') return 'Important';
    if (listId) return "List View";
    return 'Tasks';
  };

  const handleAddTask = async (title: string) => {
    // Determine list_id
    const targetListId = listId || 'temp-list-id';

    // 1. Optimistic Update
    const tempId = crypto.randomUUID();
    const newTask: Task = {
      id: tempId,
      list_id: targetListId,
      title: title,
      is_completed: false,
      is_important: filter === 'important',
      is_my_day: filter === 'my-day',
      notes: null,
      due_date: null,
      position: 0,
      created_at: new Date().toISOString(),
      ai_enrichment: null,
    };

    // Optimistically add to state
    setTasks(prev => [...prev, newTask]);

    try {
      console.log('Persisting task to Supabase via API...');
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          list_id: targetListId,
          is_important: newTask.is_important,
          is_my_day: newTask.is_my_day
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }
    } catch (err) {
      console.error('Failed to sync task', err);
    }
  };

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
          <h1 className="text-3xl font-bold">{getPageTitle()}</h1>
          {filter === 'my-day' && (
            <p className="text-zinc-400 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          )}
        </header>

        <div className="space-y-1">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onToggleImportant={handleToggleImportant}
              onUpdateNotes={handleUpdateNotes}
            />
          ))}

          {filteredTasks.length === 0 && (
            <div className="p-8 text-center text-zinc-500">
              {filter === 'important' ? "No important tasks yet." : "No tasks yet. Add one below!"}
            </div>
          )}
        </div>

        <TaskInput onAddTask={handleAddTask} />
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="h-screen bg-[#18181b] flex items-center justify-center text-white">Loading...</div>}>
        <MainContent />
      </Suspense>
    </AuthProvider>
  );
}
