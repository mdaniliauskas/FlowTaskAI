export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            lists: {
                Row: {
                    id: string
                    title: string
                    user_identifier: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    user_identifier: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    user_identifier?: string
                    created_at?: string
                }
            }
            tasks: {
                Row: {
                    id: string
                    list_id: string
                    title: string
                    is_completed: boolean
                    is_important: boolean
                    created_at: string
                    ai_enrichment: Json | null
                }
                Insert: {
                    id?: string
                    list_id: string
                    title: string
                    is_completed?: boolean
                    is_important?: boolean
                    created_at?: string
                    ai_enrichment?: Json | null
                }
                Update: {
                    id?: string
                    list_id?: string
                    title?: string
                    is_completed?: boolean
                    is_important?: boolean
                    created_at?: string
                    ai_enrichment?: Json | null
                }
            }
        }
    }
}
