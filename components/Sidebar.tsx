import Link from 'next/link';

export default function Sidebar() {
    return (
        <aside className="w-[280px] bg-[#27272a] h-screen p-4 flex flex-col text-white fixed left-0 top-0 border-r border-white/5">
            <h1 className="text-xl font-bold mb-8 px-2">FlowTask AI</h1>
            <nav className="flex flex-col gap-1">
                <Link href="#" className="p-2 hover:bg-white/5 rounded cursor-pointer transition-colors text-sm font-medium">My Day</Link>
                <Link href="#" className="p-2 hover:bg-white/5 rounded cursor-pointer transition-colors text-sm font-medium">Important</Link>
                <Link href="#" className="p-2 hover:bg-white/5 rounded cursor-pointer transition-colors text-sm font-medium">Tasks</Link>
            </nav>
        </aside>
    );
}
