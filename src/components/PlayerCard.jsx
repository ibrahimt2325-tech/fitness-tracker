import { useState } from 'react'
import { DayCell } from './DayCell'
import { LogModal } from './LogModal'
import { Calendar } from './Calendar'
import { AchievementDisplay } from './Medal'
import { getWeekDays, formatDateKey } from '../lib/dates'
import { GOALS } from '../types'

export function PlayerCard({
  user,
  weekStart,
  dailyLogs,
  weeklyLog,
  streaks,
  onSaveDailyLog,
  onSaveWeeklyLog,
  isCurrentUser = false,
}) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const days = getWeekDays(weekStart)

  // Calculate lifting days this week
  const liftDaysThisWeek = days.reduce((count, day) => {
    const log = dailyLogs[formatDateKey(day)]
    return count + (log?.lifted ? 1 : 0)
  }, 0)

  const handleDayClick = (date) => {
    if (isCurrentUser) {
      setSelectedDate(date)
    }
  }

  const handleSave = (data) => {
    onSaveDailyLog(user.id, selectedDate, data)
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-3 sm:p-5 flex-1 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-bold text-xl">
          {user.name}
        </h2>
        <button
          onClick={() => setShowCalendar(true)}
          className="p-2 rounded-lg border border-border hover:border-muted text-muted hover:text-white transition-all"
          title="View calendar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </button>
      </div>

      {/* Weekly 3-mile toggle */}
      <div className="mb-4 pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="font-heading text-sm">
            🏃 3-mile run this week
          </span>
          {isCurrentUser ? (
            <button
              onClick={() => onSaveWeeklyLog(user.id, !weeklyLog?.did_3_mile)}
              className={`
                px-4 py-1.5 rounded-full text-sm font-heading transition-all
                ${weeklyLog?.did_3_mile
                  ? 'bg-success/20 text-success border border-success'
                  : 'bg-bg border border-border text-muted hover:border-muted'}
              `}
            >
              {weeklyLog?.did_3_mile ? '✓ Done' : 'Mark done'}
            </button>
          ) : (
            <span className={`text-sm font-mono ${weeklyLog?.did_3_mile ? 'text-success' : 'text-muted'}`}>
              {weeklyLog?.did_3_mile ? '✓ Done' : '—'}
            </span>
          )}
        </div>

        {/* Lifting progress this week */}
        <div className="flex items-center justify-between mt-3">
          <span className="font-heading text-sm">
            💪 Lifting this week
          </span>
          <span className={`text-sm font-mono ${liftDaysThisWeek >= GOALS.lifted ? 'text-success' : 'text-muted'}`}>
            {liftDaysThisWeek}/{GOALS.lifted} days
          </span>
        </div>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-5">
        {days.map(day => {
          const dateKey = formatDateKey(day)
          return (
            <DayCell
              key={dateKey}
              date={day}
              log={dailyLogs[dateKey]}
              onClick={handleDayClick}
              disabled={!isCurrentUser}
            />
          )
        })}
      </div>

      {/* Achievements */}
      <div className="pt-4 border-t border-border">
        <h3 className="font-heading text-sm text-muted mb-3">Achievements</h3>
        <AchievementDisplay streaks={streaks} />
      </div>

      {/* Log Modal */}
      {selectedDate && (
        <LogModal
          date={selectedDate}
          currentLog={dailyLogs[formatDateKey(selectedDate)]}
          onSave={handleSave}
          onClose={() => setSelectedDate(null)}
        />
      )}

      {/* Calendar Modal */}
      {showCalendar && (
        <Calendar
          userId={user.id}
          userName={user.name}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </div>
  )
}
