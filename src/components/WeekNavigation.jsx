import { formatWeekRange, getWeekStart } from '../lib/dates'

export function WeekNavigation({ weekStart, onPrevWeek, onNextWeek }) {
  const currentWeekStart = getWeekStart(new Date())
  const isCurrentWeek = weekStart.getTime() === currentWeekStart.getTime()

  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <button
        onClick={onPrevWeek}
        className="p-2 rounded-lg border border-border hover:border-muted
                   text-muted hover:text-white transition-all"
        aria-label="Previous week"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 4l-6 6 6 6" />
        </svg>
      </button>

      <div className="text-center min-w-[240px]">
        <div className="font-heading font-semibold text-lg">
          {formatWeekRange(weekStart)}
        </div>
        {isCurrentWeek && (
          <div className="text-success text-xs font-mono mt-1">Current Week</div>
        )}
      </div>

      <button
        onClick={onNextWeek}
        className="p-2 rounded-lg border border-border hover:border-muted
                   text-muted hover:text-white transition-all"
        aria-label="Next week"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 4l6 6-6 6" />
        </svg>
      </button>
    </div>
  )
}
