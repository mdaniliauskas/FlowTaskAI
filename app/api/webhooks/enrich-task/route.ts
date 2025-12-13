import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { taskId, taskTitle, enrichmentData } = body;

        console.log('[Webhook] Received enrichment for:', { taskId, taskTitle });

        if (!taskId || !enrichmentData) {
            return NextResponse.json(
                { error: 'Missing taskId or enrichmentData' },
                { status: 400 }
            );
        }

        // Update the task in Supabase
        // Note: In a real scenario, use a service role key for RLS bypass if needed, 
        // but for this prototype, we use the client (assuming policies allow or we upgrade to admin client)
        const { error } = await supabase
            .from('tasks')
            .update({ ai_enrichment: enrichmentData })
            .eq('id', taskId);

        if (error) {
            console.error('[Webhook] Database update failed:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Task enriched successfully' });
    } catch (err) {
        console.error('[Webhook] Internal error:', err);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
