import { formatDate, isToday, isFuture } from '../lib/dates'
import { GOALS } from '../types'

function GoalIndicator({ hit, label, value, unit }) {
  return (
    <div className={`flex items-center gap-1 text-xs ${hit ? 'text-success' : 'text-fail'}`}>
      <span className={hit ? 'opacity-100' : 'opacity-60'}>
        {hit ? '✓' : '✗'}
      </span>
      <span className="font-mono">
        {value !== null && value !== undefined ? value : '—'}
        {unit && <span className="text-muted ml-0.5">{unit}</span>}
      </span>
    </div>
  )
}

export function DayCell({ date, log, onClick, disabled = false }) {
  const today = isToday(date)
  const future = isFuture(date)
  const hasData = log && (log.steps !== null || log.pages !== null || log.stretched !== undefined || log.lifted !== undefined)

  const stepsHit = log?.steps >= GOALS.steps
  const pagesHit = log?.pages >= GOALS.pages
  const stretchedHit = log?.stretched === true
  const liftedHit = log?.lifted === true

  // Calculate if all daily goals are hit
  const allHit = hasData && stepsHit && pagesHit && stretchedHit
  const anyHit = hasData && (stepsHit || pagesHit || stretchedHit)

  return (
    <button
      onClick={() => !future && onClick?.(date)}
      disabled={disabled || future}
      className={`
        day-cell
        w-full p-1.5 sm:p-3 rounded-lg border
        bg-card text-left
        ${today ? 'day-today' : ''}
        ${future ? 'day-future border-border' : 'border-border hover:border-muted'}
        ${!future && !disabled ? 'cursor-pointer' : 'cursor-default'}
        transition-all
      `}
    >
      {/* Mobile: Simple view */}
      <div className="sm:hidden flex flex-col items-center justify-center min-h-[60px]">
        <span className="font-heading font-semibold text-xs text-muted">
          {formatDate(date, 'EEEEE')}
        </span>
        <span className="font-mono text-xs text-muted mb-1">
          {formatDate(date, 'd')}
        </span>
        {future ? (
          <span className="text-muted text-lg">·</span>
        ) : hasData ? (
          <span className={`text-xl ${allHit ? 'text-success' : anyHit ? 'text-yellow-500' : 'text-fail'}`}>
            {allHit ? '✓' : '✗'}
          </span>
        ) : (
          <span className="text-muted text-lg">+</span>
        )}
      </div>

      {/* Desktop: Full view */}
      <div className="hidden sm:block">
        {/* Date header */}
        <div className="flex justify-between items-center mb-2">
          <span className="font-heading font-semibold text-sm">
            {formatDate(date, 'EEE')}
          </span>
          <span className="font-mono text-xs text-muted">
            {formatDate(date, 'd')}
          </span>
        </div>

        {/* Goals grid */}
        <div className="min-h-[52px]">
          {future ? (
            <div className="text-muted text-xs italic">Upcoming</div>
          ) : hasData ? (
            <div className="space-y-1">
              <GoalIndicator
                hit={stepsHit}
                label="Steps"
                value={log.steps?.toLocaleString()}
              />
              <GoalIndicator
                hit={pagesHit}
                label="Pages"
                value={log.pages}
                unit="pg"
              />
              <div className="flex gap-3">
                <span className={`text-xs ${stretchedHit ? 'text-success' : 'text-fail opacity-60'}`}>
                  🧘{stretchedHit ? '✓' : '✗'}
                </span>
                <span className={`text-xs ${liftedHit ? 'text-success' : 'text-fail opacity-60'}`}>
                  💪{liftedHit ? '✓' : '✗'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-muted text-xs">
              Tap to log
            </div>
          )}
        </div>
      </div>

      {/* All-hit indicator */}
      {allHit && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-success hidden sm:block" />
      )}
    </button>
  )
}
