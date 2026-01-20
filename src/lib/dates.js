import { startOfWeek, endOfWeek, addWeeks, subWeeks, format, isToday, isFuture, eachDayOfInterval } from 'date-fns'

/**
 * Get the Monday of the week containing the given date
 */
export function getWeekStart(date = new Date()) {
  return startOfWeek(date, { weekStartsOn: 1 }) // Monday
}

/**
 * Get the Sunday of the week containing the given date
 */
export function getWeekEnd(date = new Date()) {
  return endOfWeek(date, { weekStartsOn: 1 })
}

/**
 * Get all days in a week as Date objects
 */
export function getWeekDays(weekStart) {
  return eachDayOfInterval({
    start: weekStart,
    end: addWeeks(weekStart, 1).setDate(addWeeks(weekStart, 1).getDate() - 1)
  }).slice(0, 7)
}

/**
 * Navigate to previous week
 */
export function getPrevWeek(weekStart) {
  return subWeeks(weekStart, 1)
}

/**
 * Navigate to next week
 */
export function getNextWeek(weekStart) {
  return addWeeks(weekStart, 1)
}

/**
 * Format date for display
 */
export function formatDate(date, formatStr = 'MMM d') {
  return format(date, formatStr)
}

/**
 * Format date for database keys (YYYY-MM-DD)
 */
export function formatDateKey(date) {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Format week range for display
 */
export function formatWeekRange(weekStart) {
  const weekEnd = getWeekEnd(weekStart)
  const startMonth = format(weekStart, 'MMM')
  const endMonth = format(weekEnd, 'MMM')

  if (startMonth === endMonth) {
    return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'd, yyyy')}`
  }
  return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
}

export { isToday, isFuture }
