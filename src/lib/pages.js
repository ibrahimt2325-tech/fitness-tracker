import { GOALS } from '../types'

/**
 * Compute pages read as the delta between current and previous page.
 * @param {number|null} currentPage - The page the user is currently on
 * @param {number|null} previousPage - The page the user was on yesterday
 * @returns {number|null} Pages read, or null if can't compute
 */
export function computePagesRead(currentPage, previousPage) {
  if (currentPage == null) return null

  // First day or new book: assume started from page 0
  if (previousPage == null) return currentPage

  const delta = currentPage - previousPage

  // Negative delta means book changed — no reading credit
  if (delta < 0) return null

  return delta
}

/**
 * Check if the pages-read delta meets the daily reading goal.
 * @param {number|null} pagesRead - Computed pages read
 * @param {number} goal - Daily page goal (default from GOALS)
 * @returns {boolean}
 */
export function readingGoalMet(pagesRead, goal = GOALS.pages) {
  return pagesRead != null && pagesRead >= goal
}
