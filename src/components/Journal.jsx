import { useState, useEffect } from 'react'
import { format, isFuture, eachDayOfInterval, subDays } from 'date-fns'
import { supabase } from '../lib/supabase'

export function Journal({ userId, userName, onClose }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchJournalEntries() {
      setLoading(true)

      if (!supabase) {
        // Demo mode - generate sample entries
        const sampleNotes = [
          'Habits are the compound interest of self-improvement',
          'You do not rise to the level of your goals, you fall to the level of your systems',
          'The 1% rule: small improvements compound over time',
          'Environment design matters more than motivation',
          'Identity-based habits stick better than outcome-based ones',
          'Deep work requires eliminating shallow distractions',
          'Focus is a skill that must be trained deliberately',
          'The Eisenhower matrix helps prioritize what truly matters',
          'Consistency beats intensity every time',
          'Rest is not the opposite of work — it enables better work',
        ]

        const today = new Date()
        const start = subDays(today, 30)
        const days = eachDayOfInterval({ start, end: today })
        const demoEntries = days
          .filter(() => Math.random() > 0.4)
          .filter(d => !isFuture(d))
          .map((day, i) => ({
            date: format(day, 'yyyy-MM-dd'),
            learned: sampleNotes[i % sampleNotes.length],
          }))
          .reverse()

        setEntries(demoEntries)
        setLoading(false)
        return
      }

      try {
        const { data } = await supabase
          .from('daily_logs')
          .select('date, learned')
          .eq('user_id', userId)
          .not('learned', 'is', null)
          .order('date', { ascending: false })

        setEntries(data || [])
      } catch (error) {
        console.error('Error fetching journal entries:', error)
      }
      setLoading(false)
    }

    fetchJournalEntries()
  }, [userId])

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-5 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg">{userName}'s Journal</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Entries */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-muted font-mono text-sm">
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted font-mono text-sm">
            No journal entries yet.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {entries.map(entry => (
              <div
                key={entry.date}
                className="p-3 bg-bg rounded-lg border border-border"
              >
                <div className="text-xs text-muted font-mono mb-1.5">
                  {format(new Date(entry.date + 'T00:00:00'), 'EEEE, MMM d, yyyy')}
                </div>
                <div className="text-sm font-mono leading-relaxed">
                  {entry.learned}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
