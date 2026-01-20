import { ACTIVITIES } from '../types'

const MEDAL_STYLES = {
  bronze: 'medal-bronze',
  silver: 'medal-silver',
  gold: 'medal-gold',
  platinum: 'medal-platinum medal-shimmer',
}

const MEDAL_LABELS = {
  bronze: '1mo',
  silver: '3mo',
  gold: '6mo',
  platinum: '1yr',
}

export function Medal({ type, activity, earned = false, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  const activityInfo = ACTIVITIES[activity]

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${earned ? MEDAL_STYLES[type] : 'medal-locked'}
        rounded-full flex items-center justify-center
        font-mono font-bold
        transition-all duration-300
        ${earned ? 'opacity-100' : 'opacity-40'}
      `}
      title={`${activityInfo?.label || activity} - ${MEDAL_LABELS[type]} streak${earned ? ' (earned!)' : ''}`}
    >
      <span className={earned ? '' : 'grayscale'}>
        {activityInfo?.icon || '🏅'}
      </span>
    </div>
  )
}

export function MedalRow({ activity, earnedMedals = [] }) {
  const medals = ['bronze', 'silver', 'gold', 'platinum']

  return (
    <div className="flex gap-1.5 items-center">
      {medals.map(medal => (
        <Medal
          key={medal}
          type={medal}
          activity={activity}
          earned={earnedMedals.includes(medal)}
          size="sm"
        />
      ))}
    </div>
  )
}

export function AchievementDisplay({ streaks }) {
  const activities = ['steps', 'reading', 'stretch', 'lifting', 'running']

  // Calculate earned medals for each activity
  const earnedByActivity = {}
  activities.forEach(activity => {
    const streak = streaks[activity] || 0
    const isWeekly = activity === 'lifting' || activity === 'running'
    const thresholds = isWeekly
      ? { bronze: 4, silver: 13, gold: 26, platinum: 52 }
      : { bronze: 30, silver: 90, gold: 180, platinum: 365 }

    earnedByActivity[activity] = []
    if (streak >= thresholds.bronze) earnedByActivity[activity].push('bronze')
    if (streak >= thresholds.silver) earnedByActivity[activity].push('silver')
    if (streak >= thresholds.gold) earnedByActivity[activity].push('gold')
    if (streak >= thresholds.platinum) earnedByActivity[activity].push('platinum')
  })

  // Only show activities with at least one earned medal
  const activitiesWithMedals = activities.filter(a => earnedByActivity[a].length > 0)

  if (activitiesWithMedals.length === 0) {
    return (
      <div className="text-muted text-xs font-heading">
        No medals yet — keep going!
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3">
      {activitiesWithMedals.map(activity => (
        <div key={activity} className="flex flex-col items-center gap-1">
          <span className="text-xs text-muted font-heading">
            {ACTIVITIES[activity].label}
          </span>
          <MedalRow activity={activity} earnedMedals={earnedByActivity[activity]} />
        </div>
      ))}
    </div>
  )
}
