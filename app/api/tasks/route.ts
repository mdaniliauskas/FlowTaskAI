import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const listId = searchParams.get('listId');
        const filter = searchParams.get('filter');

        let query = supabase.from('tasks').select('*').order('created_at', { ascending: true });

        if (listId) {
            query = query.eq('list_id', listId);
        }

        if (filter === 'my-day') {
            query = query.eq('is_my_day', true);
        } else if (filter === 'important') {
            query = query.eq('is_important', true);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Validation needed in real app

        const { data, error } = await supabase
            .from('tasks')
            .insert([body])
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
