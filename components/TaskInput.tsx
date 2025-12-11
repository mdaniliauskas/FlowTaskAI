"use client";
import { useState } from "react";

export default function TaskInput() {
    const [task, setTask] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!task.trim()) return;
        console.log("Adding task:", task);
        setTask("");
    };

    return (
        <div className="fixed bottom-0 left-[280px] right-0 p-4 bg-[#18181b]/95 backdrop-blur border-t border-white/5">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                <input
                    type="text"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="Add a task"
                    className="w-full bg-[#27272a] text-white p-3 rounded-lg border border-transparent focus:border-blue-500/50 focus:outline-none placeholder-zinc-500 transition-all"
                />
            </form>
        </div>
    );
}
