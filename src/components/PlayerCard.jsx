import { useState } from 'react'
import { DayCell } from './DayCell'
import { LogModal } from './LogModal'
import { Calendar } from './Calendar'
import { Journal } from './Journal'
import { AchievementDisplay } from './Medal'
import { getWeekDays, formatDateKey } from '../lib/dates'
import { computePagesRead } from '../lib/pages'
import { GOALS } from '../types'
import { subDays } from 'date-fns'

export function PlayerCard({
  user,
  weekStart,
  dailyLogs,
  weeklyLog,
  streaks,
  onSaveDailyLog,
  onSaveWeeklyLog,
  onSaveCurrentBook,
  isCurrentUser = false,
}) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showJournal, setShowJournal] = useState(false)
  const [editingBook, setEditingBook] = useState(false)
  const [bookTitle, setBookTitle] = useState('')
  const [bookPages, setBookPages] = useState('')
  const days = getWeekDays(weekStart)

  // Calculate lifting days this week
  const liftDaysThisWeek = days.reduce((count, day) => {
    const log = dailyLogs[formatDateKey(day)]
    return count + (log?.lifted ? 1 : 0)
  }, 0)

  // Compute pagesRead for each day (delta from previous day)
  const pagesReadByDay = {}
  days.forEach((day, i) => {
    const dateKey = formatDateKey(day)
    const log = dailyLogs[dateKey]
    if (!log) return

    let prevPage = null
    if (i === 0) {
      // Monday: look back to Sunday (lookback day)
      const lookbackKey = formatDateKey(subDays(day, 1))
      const lookbackLog = dailyLogs[lookbackKey]
      prevPage = lookbackLog?.current_page ?? null
    } else {
      const prevKey = formatDateKey(days[i - 1])
      const prevLog = dailyLogs[prevKey]
      prevPage = prevLog?.current_page ?? null
    }

    pagesReadByDay[dateKey] = computePagesRead(log.current_page, prevPage)
  })

  // Get previous page for the selected date (for LogModal)
  const getPreviousPage = (date) => {
    const prevDay = subDays(date, 1)
    const prevKey = formatDateKey(prevDay)
    const prevLog = dailyLogs[prevKey]
    return prevLog?.current_page ?? null
  }

  const handleDayClick = (date) => {
    if (isCurrentUser) {
      setSelectedDate(date)
    }
  }

  const handleSave = (data) => {
    onSaveDailyLog(user.id, selectedDate, data)
  }

  const handleBookSave = () => {
    const title = bookTitle.trim()
    const pages = parseInt(bookPages, 10) || null
    onSaveCurrentBook(user.id, title, pages)
    setEditingBook(false)
  }

  const handleBookEditStart = () => {
    setBookTitle(user.current_book || '')
    setBookPages(user.book_total_pages?.toString() || '')
    setEditingBook(true)
  }

  // Find the latest current_page for progress display
  const latestPage = (() => {
    const sorted = days
      .map(d => dailyLogs[formatDateKey(d)])
      .filter(l => l?.current_page != null)
    return sorted.length > 0 ? sorted[sorted.length - 1].current_page : null
  })()

  return (
    <div className="bg-card border border-border rounded-2xl p-3 sm:p-5 flex-1 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-heading font-bold text-xl">
          {user.name}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowJournal(true)}
            className="p-2 rounded-lg border border-border hover:border-muted text-muted hover:text-white transition-all"
            title="View journal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              <line x1="8" y1="7" x2="16" y2="7"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
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
      </div>

      {/* Current book display */}
      {editingBook ? (
        <div className="mb-4 p-3 bg-bg rounded-lg border border-border space-y-2">
          <input
            type="text"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            placeholder="Book title"
            className="w-full bg-card border border-border rounded px-3 py-1.5 font-mono text-sm
                       focus:outline-none focus:border-success transition-colors"
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={bookPages}
              onChange={(e) => setBookPages(e.target.value)}
              placeholder="Total pages"
              className="flex-1 bg-card border border-border rounded px-3 py-1.5 font-mono text-sm
                         focus:outline-none focus:border-success transition-colors"
            />
            <button
              onClick={handleBookSave}
              className="px-3 py-1.5 bg-success text-bg rounded font-heading text-sm font-semibold"
            >
              Save
            </button>
            <button
              onClick={() => setEditingBook(false)}
              className="px-3 py-1.5 border border-border rounded font-heading text-sm text-muted hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          {user.current_book ? (
            <button
              onClick={isCurrentUser ? handleBookEditStart : undefined}
              className={`text-sm font-mono text-muted ${isCurrentUser ? 'hover:text-white cursor-pointer' : ''} transition-colors`}
            >
              {user.current_book}
              {latestPage != null && (
                <span>
                  {' '}— pg {latestPage}
                  {user.book_total_pages && `/${user.book_total_pages}`}
                </span>
              )}
            </button>
          ) : isCurrentUser ? (
            <button
              onClick={handleBookEditStart}
              className="text-sm font-mono text-muted hover:text-white cursor-pointer transition-colors"
            >
              + Set current book
            </button>
          ) : null}
        </div>
      )}

      {/* Weekly 3-mile toggle */}
      <div className="mb-4 pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="font-heading text-sm">
            3-mile run this week
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
            Lifting this week
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
              pagesRead={pagesReadByDay[dateKey] ?? null}
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
          currentBook={user.current_book}
          previousPage={getPreviousPage(selectedDate)}
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

      {/* Journal Modal */}
      {showJournal && (
        <Journal
          userId={user.id}
          userName={user.name}
          onClose={() => setShowJournal(false)}
        />
      )}
    </div>
  )
}
