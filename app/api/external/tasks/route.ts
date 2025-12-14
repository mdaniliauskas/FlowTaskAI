import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        // 1. Authenticate Request
        const authHeader = request.headers.get('Authorization');
        const expectedSecret = process.env.API_SECRET;

        if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, notes } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        // 2. Find a default list for the user (we assume a default user or logic here)
        // NOTE: In a real app with Auth, we might need a specific user ID passed in the body
        // or associated with the API Key if it was a personal key. 
        // For this simple integration, we'll fetch the first available list in the DB
        // or you can hardcode a specific LIST_ID in env if you want tasks to go to "Inbox".

        // Let's try to find a list named "Inbox" or "Tasks" or just the first one.
        let { data: lists, error: listError } = await supabase
            .from('lists')
            .select('id')
            .limit(1);

        if (listError || !lists || lists.length === 0) {
            // Fallback: This user might need a new list or manual setup.
            // For now, let's create a "WhatsApp Inbox" list if none exists (advanced) 
            // or ensure at least one list exists. 
            // Simplest for now: Return error if no list exists.
            return NextResponse.json({ error: 'No lists found to attach task to.' }, { status: 404 });
        }

        const targetListId = lists[0].id;

        // 3. Insert Task
        const { data: task, error: taskError } = await supabase
            .from('tasks')
            .insert([
                {
                    list_id: targetListId,
                    title: title,
                    notes: notes,
                    is_completed: false,
                    is_important: false,
                    is_my_day: false,
                    created_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (taskError) {
            return NextResponse.json({ error: taskError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            task: task,
            message: 'Task added successfully via external API'
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
