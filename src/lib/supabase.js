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
  { id: 'user-1', name: 'Thomas', current_book: 'Atomic Habits', book_total_pages: 320 },
  { id: 'user-2', name: 'Nico', current_book: 'Deep Work', book_total_pages: 296 },
]

const SAMPLE_LEARNED = [
  'Habits are the compound interest of self-improvement',
  'You do not rise to the level of your goals, you fall to the level of your systems',
  'The 1% rule: small improvements compound over time',
  'Environment design matters more than motivation',
  'Identity-based habits stick better than outcome-based ones',
  'Deep work requires eliminating shallow distractions',
  'Focus is a skill that must be trained deliberately',
]

export const createDemoData = (weekStart) => {
  const logs = {}
  DEMO_USERS.forEach((user, userIdx) => {
    logs[user.id] = {
      daily: {},
      weekly: { did_3_mile: Math.random() > 0.3 }
    }
    // Start at a random page and accumulate
    let runningPage = Math.floor(Math.random() * 100) + 50

    // Generate some random data for past days
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      const isPast = date < new Date()

      if (isPast || Math.random() > 0.5) {
        const pagesReadToday = Math.floor(Math.random() * 15) + 3
        runningPage += pagesReadToday
        const learnedNote = Math.random() > 0.4
          ? SAMPLE_LEARNED[(userIdx * 3 + i) % SAMPLE_LEARNED.length]
          : null
        logs[user.id].daily[dateStr] = {
          steps: Math.floor(Math.random() * 5000) + 4000,
          current_page: runningPage,
          stretched: Math.random() > 0.3,
          lifted: Math.random() > 0.4,
          learned: learnedNote,
        }
      }
    }
  })
  return logs
}
