import { useState, useEffect } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isFuture,
  addMonths,
  subMonths,
  subDays,
} from 'date-fns'
import { supabase } from '../lib/supabase'
import { GOALS } from '../types'
import { computePagesRead, readingGoalMet } from '../lib/pages'

function dayHitAllGoals(log, pagesRead) {
  if (!log) return null
  const stepsHit = log.steps >= GOALS.steps
  const pagesHit = readingGoalMet(pagesRead)
  const stretchHit = log.stretched === true
  return stepsHit && pagesHit && stretchHit
}

export function Calendar({ userId, userName, onClose }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [dailyLogs, setDailyLogs] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMonthData() {
      setLoading(true)

      const monthStart = startOfMonth(currentMonth)
      const monthEnd = endOfMonth(currentMonth)
      // Fetch one day before month start for delta calculation
      const lookbackDay = subDays(monthStart, 1)

      if (!supabase) {
        // Demo mode - generate random cumulative data
        const days = eachDayOfInterval({ start: lookbackDay, end: monthEnd })
        const demoLogs = {}
        let runningPage = Math.floor(Math.random() * 100) + 50
        days.forEach(day => {
          if (!isFuture(day)) {
            const dateKey = format(day, 'yyyy-MM-dd')
            const pagesReadToday = Math.floor(Math.random() * 15) + 3
            runningPage += pagesReadToday
            demoLogs[dateKey] = {
              steps: Math.floor(Math.random() * 5000) + 4000,
              current_page: runningPage,
              stretched: Math.random() > 0.3,
            }
          }
        })
        setDailyLogs(demoLogs)
        setLoading(false)
        return
      }

      try {
        const { data } = await supabase
          .from('daily_logs')
          .select('date, steps, current_page, stretched')
          .eq('user_id', userId)
          .gte('date', format(lookbackDay, 'yyyy-MM-dd'))
          .lte('date', format(monthEnd, 'yyyy-MM-dd'))

        const logsByDate = {}
        data?.forEach(log => {
          logsByDate[log.date] = log
        })
        setDailyLogs(logsByDate)
      } catch (error) {
        console.error('Error fetching calendar data:', error)
      }
      setLoading(false)
    }

    fetchMonthData()
  }, [currentMonth, userId])

  // Pre-compute page deltas for the month
  const pagesReadByDay = {}
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  monthDays.forEach(day => {
    const dateKey = format(day, 'yyyy-MM-dd')
    const log = dailyLogs[dateKey]
    if (!log) return

    const prevKey = format(subDays(day, 1), 'yyyy-MM-dd')
    const prevLog = dailyLogs[prevKey]
    const prevPage = prevLog?.current_page ?? null

    pagesReadByDay[dateKey] = computePagesRead(log.current_page, prevPage)
  })

  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg">{userName}</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg border border-border hover:border-muted text-muted hover:text-white transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4l-6 6 6 6" />
            </svg>
          </button>
          <span className="font-heading font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg border border-border hover:border-muted text-muted hover:text-white transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 4l6 6-6 6" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <div key={i} className="text-center text-xs text-muted font-mono py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="h-64 flex items-center justify-center text-muted font-mono text-sm">
            Loading...
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd')
              const inMonth = isSameMonth(day, currentMonth)
              const today = isToday(day)
              const future = isFuture(day)
              const log = dailyLogs[dateKey]
              const pagesRead = pagesReadByDay[dateKey] ?? null
              const hitGoals = dayHitAllGoals(log, pagesRead)

              return (
                <div
                  key={dateKey}
                  className={`
                    aspect-square flex items-center justify-center rounded-lg text-sm
                    ${!inMonth ? 'opacity-20' : ''}
                    ${today ? 'ring-2 ring-white' : ''}
                    ${future ? 'bg-transparent' : 'bg-bg'}
                  `}
                >
                  {future || !inMonth ? (
                    <span className="text-muted font-mono text-xs">{format(day, 'd')}</span>
                  ) : hitGoals === null ? (
                    <span className="text-muted font-mono text-xs">{format(day, 'd')}</span>
                  ) : hitGoals ? (
                    <span className="text-success text-lg">✓</span>
                  ) : (
                    <span className="text-fail text-lg">✗</span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted font-mono">
            <span className="text-success">✓</span> All daily goals
          </div>
          <div className="flex items-center gap-2 text-xs text-muted font-mono">
            <span className="text-fail">✗</span> Missed goal(s)
          </div>
        </div>
      </div>
    </div>
  )
}
