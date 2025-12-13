import { useState } from "react";
import { Sparkles, Circle, CheckCircle2, Star, FileText, Calendar } from "lucide-react";
import { Database } from "@/types/supabase";
import { cn } from "@/lib/utils";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface TaskItemProps {
    task: Task;
    onToggle: (id: string, completed: boolean) => void;
    onToggleImportant: (id: string, important: boolean) => void;
    onUpdateNotes: (id: string, notes: string) => void;
}

export default function TaskItem({ task, onToggle, onToggleImportant, onUpdateNotes }: TaskItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasAiEnrichment = !!task.ai_enrichment;

    // Helper to parse AI enrichment content safely
    const getAiContent = () => {
        if (!task.ai_enrichment) return null;
        if (typeof task.ai_enrichment === 'string') return task.ai_enrichment;
        if (typeof task.ai_enrichment === 'object' && 'content' in task.ai_enrichment) {
            return (task.ai_enrichment as any).content;
        }
        return JSON.stringify(task.ai_enrichment);
    };

    const handleAddNote = () => {
        // Simple prompt for now, could be inline edit later
        const note = prompt("Add a note:", task.notes || "");
        if (note !== null) {
            onUpdateNotes(task.id, note);
        }
    };

    return (
        <div className={`group rounded-lg transition-all duration-300 ${isExpanded ? 'bg-white/5 p-4' : 'p-3 hover:bg-white/5'}`}>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => onToggle(task.id, !task.is_completed)}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    {task.is_completed ? (
                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    ) : (
                        <Circle className="w-5 h-5" />
                    )}
                </button>

                <span
                    className={`flex-1 text-sm cursor-pointer ${task.is_completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {task.title}
                </span>

                {hasAiEnrichment && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`p-1 rounded-full transition-colors ${isExpanded ? 'text-purple-400 bg-purple-500/10' : 'text-purple-500/50 hover:text-purple-400'
                            }`}
                        title="View AI Suggestions"
                    >
                        <Sparkles className="w-4 h-4" />
                    </button>
                )}

                <button
                    onClick={() => onToggleImportant(task.id, !task.is_important)}
                    className="text-zinc-600 hover:text-amber-400 transition-colors focus:outline-none"
                    title={task.is_important ? "Mark as not important" : "Mark as important"}
                >
                    <Star className={cn("w-4 h-4", task.is_important && "fill-amber-400 text-amber-400")} />
                </button>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="mt-3 ml-8 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">

                    {/* Notes & Date Controls */}
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <button
                            onClick={handleAddNote}
                            className={cn(
                                "flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 transition-colors",
                                task.notes && "text-zinc-200 bg-white/5"
                            )}
                        >
                            <FileText className="w-3 h-3" />
                            <span>{task.notes ? "Edit Note" : "Add Note"}</span>
                        </button>
                        <button className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 transition-colors">
                            <Calendar className="w-3 h-3" />
                            <span>Add Due Date</span>
                        </button>
                    </div>

                    {/* Display Note if exists */}
                    {task.notes && (
                        <div className="p-2 bg-black/20 rounded text-sm text-zinc-300 border-l-2 border-zinc-500">
                            {task.notes}
                        </div>
                    )}

                    {/* AI Content */}
                    {hasAiEnrichment && (
                        <div className="text-xs text-zinc-400 border-l-2 border-purple-500/20 pl-3">
                            <p className="font-medium text-purple-400 mb-1 flex items-center gap-2">
                                <Sparkles className="w-3 h-3" /> AI Suggestion
                            </p>
                            <div className="prose prose-invert prose-xs max-w-none">
                                {getAiContent()}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
