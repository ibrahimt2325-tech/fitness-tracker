import { useState } from 'react'
import { PlayerCard } from './PlayerCard'
import { WeekNavigation } from './WeekNavigation'
import { useWeekData } from '../hooks/useWeekData'
import { getWeekStart, getPrevWeek, getNextWeek } from '../lib/dates'

export function WeekView() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))

  const {
    users,
    dailyLogs,
    weeklyLogs,
    loading,
    saveDailyLog,
    saveWeeklyLog,
    saveCurrentBook,
  } = useWeekData(weekStart)

  // Mock streaks for demo - in real app would calculate from full history
  const mockStreaks = {
    'user-1': { steps: 12, reading: 45, stretch: 8, lifting: 6, running: 3 },
    'user-2': { steps: 30, reading: 15, stretch: 60, lifting: 10, running: 8 },
  }

  const handlePrevWeek = () => setWeekStart(getPrevWeek(weekStart))
  const handleNextWeek = () => setWeekStart(getNextWeek(weekStart))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted font-mono">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <WeekNavigation
        weekStart={weekStart}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
      />

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {users.map(user => (
          <PlayerCard
            key={user.id}
            user={user}
            weekStart={weekStart}
            dailyLogs={dailyLogs[user.id] || {}}
            weeklyLog={weeklyLogs[user.id]}
            streaks={mockStreaks[user.id] || {}}
            onSaveDailyLog={saveDailyLog}
            onSaveWeeklyLog={saveWeeklyLog}
            onSaveCurrentBook={saveCurrentBook}
            isCurrentUser={true}
          />
        ))}
      </div>
    </div>
  )
}
