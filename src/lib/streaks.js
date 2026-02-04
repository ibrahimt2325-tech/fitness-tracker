import { GOALS, STREAK_MILESTONES, STREAK_MILESTONES_WEEKLY } from '../types'
import { computePagesRead, readingGoalMet } from './pages'

/**
 * Calculate current streak for a daily activity
 * @param {Object} dailyLogs - Object with date keys and log values
 * @param {string} field - 'steps', 'current_page', or 'stretched'
 * @param {number|boolean} threshold - Minimum value or true for boolean
 * @returns {number} Current streak in days
 */
export function calculateDailyStreak(dailyLogs, field, threshold) {
  const dates = Object.keys(dailyLogs).sort().reverse()
  let streak = 0

  for (const date of dates) {
    const log = dailyLogs[date]
    const value = log[field]

    let hitGoal = false
    if (typeof threshold === 'boolean') {
      hitGoal = value === true
    } else {
      hitGoal = value >= threshold
    }

    if (hitGoal) {
      streak++
    } else {
      break
    }
  }

  return streak
}

/**
 * Calculate reading streak using page deltas instead of raw values.
 * Sorts dates, computes running deltas, then checks against goal.
 * @param {Object} dailyLogs - Object with date keys and log values (must have current_page)
 * @returns {number} Current reading streak in days
 */
export function calculateReadingStreak(dailyLogs) {
  const dates = Object.keys(dailyLogs).sort()
  if (dates.length === 0) return 0

  // Build a map of pagesRead per day
  const pagesReadMap = {}
  for (let i = 0; i < dates.length; i++) {
    const log = dailyLogs[dates[i]]
    const prevLog = i > 0 ? dailyLogs[dates[i - 1]] : null
    const prevPage = prevLog?.current_page ?? null
    pagesReadMap[dates[i]] = computePagesRead(log.current_page ?? null, prevPage)
  }

  // Now count streak in reverse
  const reverseDates = [...dates].reverse()
  let streak = 0

  for (const date of reverseDates) {
    if (readingGoalMet(pagesReadMap[date])) {
      streak++
    } else {
      break
    }
  }

  return streak
}

/**
 * Calculate lifting streak (weeks with 5+ lifting days)
 * @param {Object} weeklyData - Object with week keys and lifting day counts
 * @returns {number} Current streak in weeks
 */
export function calculateLiftingStreak(weeklyData) {
  const weeks = Object.keys(weeklyData).sort().reverse()
  let streak = 0

  for (const week of weeks) {
    const liftDays = weeklyData[week]
    if (liftDays >= GOALS.lifted) {
      streak++
    } else {
      break
    }
  }

  return streak
}

/**
 * Calculate 3-mile run streak (consecutive weeks)
 * @param {Object} weeklyLogs - Object with week keys and did_3_mile values
 * @returns {number} Current streak in weeks
 */
export function calculateRunningStreak(weeklyLogs) {
  const weeks = Object.keys(weeklyLogs).sort().reverse()
  let streak = 0

  for (const week of weeks) {
    if (weeklyLogs[week].did_3_mile) {
      streak++
    } else {
      break
    }
  }

  return streak
}

/**
 * Get earned medals for a streak count
 * @param {number} streak - Current streak
 * @param {boolean} isWeekly - Whether this is a weekly activity
 * @returns {string[]} Array of earned milestone names
 */
export function getEarnedMedals(streak, isWeekly = false) {
  const milestones = isWeekly ? STREAK_MILESTONES_WEEKLY : STREAK_MILESTONES
  const earned = []

  if (streak >= milestones.bronze) earned.push('bronze')
  if (streak >= milestones.silver) earned.push('silver')
  if (streak >= milestones.gold) earned.push('gold')
  if (streak >= milestones.platinum) earned.push('platinum')

  return earned
}

/**
 * Get the highest earned medal
 * @param {number} streak
 * @param {boolean} isWeekly
 * @returns {string|null}
 */
export function getHighestMedal(streak, isWeekly = false) {
  const earned = getEarnedMedals(streak, isWeekly)
  return earned.length > 0 ? earned[earned.length - 1] : null
}

/**
 * Calculate all streaks for a user
 */
export function calculateAllStreaks(dailyLogs, weeklyLogs, liftingByWeek) {
  return {
    steps: calculateDailyStreak(dailyLogs, 'steps', GOALS.steps),
    reading: calculateReadingStreak(dailyLogs),
    stretch: calculateDailyStreak(dailyLogs, 'stretched', true),
    lifting: calculateLiftingStreak(liftingByWeek),
    running: calculateRunningStreak(weeklyLogs),
  }
}
