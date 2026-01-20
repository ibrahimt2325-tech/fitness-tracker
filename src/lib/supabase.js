import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Running in demo mode.')
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Demo data for development without Supabase
export const DEMO_USERS = [
  { id: 'user-1', name: 'Thomas' },
  { id: 'user-2', name: 'Nico' },
]

export const createDemoData = (weekStart) => {
  const logs = {}
  DEMO_USERS.forEach(user => {
    logs[user.id] = {
      daily: {},
      weekly: { did_3_mile: Math.random() > 0.3 }
    }
    // Generate some random data for past days
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      const isPast = date < new Date()

      if (isPast || Math.random() > 0.5) {
        logs[user.id].daily[dateStr] = {
          steps: Math.floor(Math.random() * 5000) + 4000,
          pages: Math.floor(Math.random() * 15) + 3,
          stretched: Math.random() > 0.3,
          lifted: Math.random() > 0.4,
        }
      }
    }
  })
  return logs
}
