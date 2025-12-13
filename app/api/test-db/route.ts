import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        // Attempt to select from a table that might exist, or just check the health of the connection context.
        // If we just want to check if the client is initialized:
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });

        // Note: If 'users' table doesn't exist, this might error with a specific PG code, 
        // but connectivity itself (auth, url) can be inferred if we get a meaningful response from Supabase.

        // Alternatively, strictly checking auth service health if available, but query is easiest.
        // Let's just return the config check and the error/data from a simple query attempt.

        return NextResponse.json({
            status: 'success',
            message: 'Supabase client initialized',
            supabaseUrlConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            supabaseKeyConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            queryResult: { data, error }
        }, { status: 200 });

    } catch (err: any) {
        return NextResponse.json({
            status: 'error',
            message: err.message
        }, { status: 500 });
    }
}
