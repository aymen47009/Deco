import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
})

export type Project = {
  id: string
  code: string
  name: string
  phone: string
  email: string | null
  workshop_type: string
  space_size: string | null
  budget: number | null
  description: string
  status: string
  preferred_date: string | null
  created_at: string
}

export type ProjectInsert = {
  name: string
  phone: string
  email?: string
  workshop_type: string
  space_size?: string
  budget?: number
  description: string
  preferred_date?: string
}
