"use client";

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Sun, Star, Home, Plus, Search, List, Menu as MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";

type List = Database["public"]["Tables"]["lists"]["Row"];

export default function Sidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentFilter = searchParams.get('filter');
    const currentListId = searchParams.get('list');

    const [search, setSearch] = useState("");
    const [lists, setLists] = useState<List[]>([]);

    // Fetch lists on mount
    useEffect(() => {
        const fetchLists = async () => {
            try {
                const response = await fetch('/api/lists');
                if (response.ok) {
                    const data = await response.json();
                    setLists(data);
                }
            } catch (error) {
                console.error('Failed to fetch lists', error);
            }
        };

        fetchLists();

        // Subscribe to changes (optional for now, but good for "New List" update)
        const channel = supabase
            .channel('lists-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'lists' }, () => {
                fetchLists();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleNavigation = (filter: string) => {
        router.push(`/?filter=${filter}`);
    };

    const handleListNavigation = (listId: string) => {
        router.push(`/?list=${listId}`);
    };

    const handleCreateList = async () => {
        const title = prompt("Enter list name:");
        if (!title) return;

        try {
            const response = await fetch('/api/lists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title, user_identifier: 'user-123' })
            });

            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    handleListNavigation(data[0].id);
                    // No need to manually refresh lists here as Realtime subscription handles it
                    // or we could optimistically update local state if we wanted to verify implementation
                }
            }
        } catch (error) {
            console.error('Failed to create list', error);
        }
    };

    const navItems = [
        { name: "My Day", icon: Sun, filter: "my-day", activeColor: "text-green-400" },
        { name: "Important", icon: Star, filter: "important", activeColor: "text-red-400" },
        { name: "Tasks", icon: Home, filter: "all", activeColor: "text-blue-400" },
    ];

    return (
        <aside className="w-[280px] bg-[#212124] h-screen flex flex-col fixed left-0 top-0 border-r border-black/10 select-none">
            {/* Profile / Header */}
            <div className="p-4 flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold ring-2 ring-white/10">
                    AI
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-white">FlowTask AI</h2>
                    <p className="text-xs text-zinc-500">Workspace</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-4 mb-4">
                <div className="relative group">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#2c2c30] text-sm text-white placeholder-zinc-500 rounded-md py-2 pl-9 pr-3 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all border border-transparent focus:bg-[#3b3b40]"
                    />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
                {navItems.map((item) => {
                    const isActive = currentFilter === item.filter || (!currentFilter && !currentListId && item.filter === 'all');
                    return (
                        <button
                            key={item.name}
                            onClick={() => handleNavigation(item.filter)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded hover:bg-[#2d2d30] transition-colors text-sm font-medium",
                                isActive ? "bg-[#333336] text-white" : "text-zinc-400 hover:text-white"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 font-light", isActive ? item.activeColor : "text-zinc-500 group-hover:text-zinc-300")} strokeWidth={1.5} />
                            <span>{item.name}</span>
                        </button>
                    );
                })}

                <div className="my-2 border-t border-zinc-700/50 mx-2" />

                {/* User Lists */}
                {lists.map((list) => {
                    const isActive = currentListId === list.id;
                    return (
                        <button
                            key={list.id}
                            onClick={() => handleListNavigation(list.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded hover:bg-[#2d2d30] transition-colors text-sm font-medium",
                                isActive ? "bg-[#333336] text-white" : "text-zinc-400 hover:text-white group"
                            )}
                        >
                            <List className={cn("w-5 h-5", isActive ? "text-blue-400" : "text-zinc-500 group-hover:text-blue-400")} strokeWidth={1.5} />
                            <span>{list.title}</span>
                            {/* count could be fetched if we had relation count */}
                        </button>
                    );
                })}
            </nav>

            {/* New List Button */}
            <div className="p-2 border-t border-zinc-700/30">
                <button
                    onClick={handleCreateList}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded hover:bg-[#2d2d30] transition-colors text-blue-400 group"
                >
                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">New List</span>
                    <div className="ml-auto bg-zinc-800 p-1 rounded hover:bg-zinc-700">
                        <List className="w-4 h-4 text-zinc-500" />
                    </div>
                </button>
            </div>
        </aside>
    );
}
