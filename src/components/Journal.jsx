import { useState, useEffect, useMemo } from 'react'
import { format, isFuture, eachDayOfInterval, subDays, startOfWeek } from 'date-fns'
import { supabase } from '../lib/supabase'

export function Journal({ userId, userName, onClose }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchJournalEntries() {
      setLoading(true)

      if (!supabase) {
        const sampleNotes = [
          'Habits are the compound interest of self-improvement. Getting 1% better each day adds up enormously over months and years.',
          'You do not rise to the level of your goals, you fall to the level of your systems',
          'The 1% rule: small improvements compound over time',
          'Environment design matters more than motivation — make the good choice the easy choice',
          'Identity-based habits stick better than outcome-based ones. Focus on who you want to become.',
          'Deep work requires eliminating shallow distractions. Schedule blocks of uninterrupted focus time.',
          'Focus is a skill that must be trained deliberately, like a muscle',
          'The Eisenhower matrix helps prioritize what truly matters vs what just feels urgent',
          'Consistency beats intensity every time. Show up daily even when it is small.',
          'Rest is not the opposite of work — it enables better work. Recovery is productive.',
          'Atomic Habits ch4: cue, craving, response, reward — the four stages of every habit loop',
          'The two-minute rule: scale any habit down to two minutes to build the starting ritual',
          'Temptation bundling pairs something you need to do with something you want to do',
          'Implementation intentions — "I will [behavior] at [time] in [location]" — dramatically increase follow-through',
          'Learned about variable reward schedules and why they make habits so sticky',
          'The Goldilocks Rule: peak motivation when working on tasks right at the edge of current ability',
          'Motion vs action: planning feels productive but only action produces results',
          'Never miss twice. Missing once is an accident. Missing twice is the start of a new habit.',
        ]

        const today = new Date()
        const start = subDays(today, 90)
        const days = eachDayOfInterval({ start, end: today })
        const demoEntries = days
          .filter(() => Math.random() > 0.45)
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

  // Build list of available months from entries
  const months = useMemo(() => {
    const seen = new Map()
    entries.forEach(e => {
      const key = e.date.slice(0, 7) // "2026-02"
      if (!seen.has(key)) {
        const d = new Date(e.date + 'T00:00:00')
        seen.set(key, { key, label: format(d, 'MMM yyyy') })
      }
    })
    return Array.from(seen.values())
  }, [entries])

  // Filter entries
  const filtered = useMemo(() => {
    let list = entries
    if (selectedMonth !== 'all') {
      list = list.filter(e => e.date.startsWith(selectedMonth))
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(e => e.learned.toLowerCase().includes(q))
    }
    return list
  }, [entries, selectedMonth, search])

  // Group filtered entries by week
  const weekGroups = useMemo(() => {
    const groups = []
    let currentWeekKey = null
    let currentGroup = null

    filtered.forEach(entry => {
      const d = new Date(entry.date + 'T00:00:00')
      const weekStart = startOfWeek(d, { weekStartsOn: 1 })
      const weekKey = format(weekStart, 'yyyy-MM-dd')

      if (weekKey !== currentWeekKey) {
        currentWeekKey = weekKey
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)
        currentGroup = {
          weekKey,
          label: `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d')}`,
          entries: [],
        }
        groups.push(currentGroup)
      }
      currentGroup.entries.push(entry)
    })

    return groups
  }, [filtered])

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-5 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-heading font-bold text-lg">{userName}'s Journal</h2>
            {!loading && (
              <span className="text-xs text-muted font-mono">
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Search */}
        {!loading && entries.length > 0 && (
          <div className="mb-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search entries..."
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 font-mono text-sm
                         focus:outline-none focus:border-muted transition-colors placeholder:text-muted/50"
            />
          </div>
        )}

        {/* Month pills */}
        {!loading && months.length > 1 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 shrink-0 scrollbar-none">
            <button
              onClick={() => setSelectedMonth('all')}
              className={`
                px-3 py-1 rounded-full text-xs font-heading whitespace-nowrap transition-all shrink-0
                ${selectedMonth === 'all'
                  ? 'bg-white text-bg'
                  : 'bg-bg border border-border text-muted hover:border-muted hover:text-white'}
              `}
            >
              All
            </button>
            {months.map(m => (
              <button
                key={m.key}
                onClick={() => setSelectedMonth(m.key)}
                className={`
                  px-3 py-1 rounded-full text-xs font-heading whitespace-nowrap transition-all shrink-0
                  ${selectedMonth === m.key
                    ? 'bg-white text-bg'
                    : 'bg-bg border border-border text-muted hover:border-muted hover:text-white'}
                `}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}

        {/* Entries */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-muted font-mono text-sm">
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted font-mono text-sm">
            No journal entries yet.
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted font-mono text-sm">
            No entries match your search.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1 min-h-0">
            {weekGroups.map(group => (
              <div key={group.weekKey} className="mb-4 last:mb-0">
                {/* Week header */}
                <div className="flex items-center gap-3 mb-2 sticky top-0 bg-card py-1 z-10">
                  <span className="text-xs font-heading text-muted uppercase tracking-wider">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs font-mono text-muted">
                    {group.entries.length}
                  </span>
                </div>

                {/* Week entries */}
                <div className="space-y-2">
                  {group.entries.map(entry => (
                    <JournalEntry key={entry.date} entry={entry} search={search} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function JournalEntry({ entry, search }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = entry.learned.length > 120
  const displayText = isLong && !expanded
    ? entry.learned.slice(0, 120) + '...'
    : entry.learned

  // Highlight search matches
  const highlighted = useMemo(() => {
    if (!search.trim()) return displayText
    const q = search.trim()
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = displayText.split(regex)
    return parts.map((part, i) =>
      regex.test(part)
        ? <mark key={i} className="bg-success/30 text-white rounded-sm px-0.5">{part}</mark>
        : part
    )
  }, [displayText, search])

  return (
    <div className="p-3 bg-bg rounded-lg border border-border group">
      <div className="text-xs text-muted font-mono mb-1.5">
        {format(new Date(entry.date + 'T00:00:00'), 'EEEE, MMM d')}
      </div>
      <div className="text-sm leading-relaxed">
        {highlighted}
      </div>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-muted hover:text-white font-mono mt-1.5 transition-colors"
        >
          {expanded ? 'show less' : 'show more'}
        </button>
      )}
    </div>
  )
}
