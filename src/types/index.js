// Database types matching Supabase schema

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 */

/**
 * @typedef {Object} DailyLog
 * @property {string} id
 * @property {string} user_id
 * @property {string} date - ISO date string (YYYY-MM-DD)
 * @property {number|null} steps
 * @property {number|null} pages
 * @property {boolean} stretched
 * @property {boolean} lifted
 */

/**
 * @typedef {Object} WeeklyLog
 * @property {string} id
 * @property {string} user_id
 * @property {string} week_start_date - Monday of the week (YYYY-MM-DD)
 * @property {boolean} did_3_mile
 */

/**
 * @typedef {'steps'|'reading'|'stretch'|'lifting'|'running'} ActivityType
 */

/**
 * @typedef {'bronze'|'silver'|'gold'|'platinum'} MilestoneType
 */

/**
 * @typedef {Object} Achievement
 * @property {string} id
 * @property {string} user_id
 * @property {ActivityType} activity
 * @property {MilestoneType} milestone
 * @property {string} earned_at - ISO timestamp
 */

// Goal thresholds
export const GOALS = {
  steps: 6500,
  pages: 10,
  stretched: true,
  lifted: 5, // days per week
  did_3_mile: true,
}

// Streak requirements for medals (in days for daily, weeks for weekly)
export const STREAK_MILESTONES = {
  bronze: 30,   // 1 month
  silver: 90,   // 3 months
  gold: 180,    // 6 months
  platinum: 365 // 1 year
}

// For weekly activities (lifting, running), use weeks instead
export const STREAK_MILESTONES_WEEKLY = {
  bronze: 4,    // 1 month (4 weeks)
  silver: 13,   // 3 months
  gold: 26,     // 6 months
  platinum: 52  // 1 year
}

export const ACTIVITIES = {
  steps: { label: 'Steps', icon: '👟', unit: 'steps', daily: true },
  reading: { label: 'Reading', icon: '📖', unit: 'pages', daily: true },
  stretch: { label: 'Stretch', icon: '🧘', unit: null, daily: true },
  lifting: { label: 'Lifting', icon: '💪', unit: null, daily: false },
  running: { label: '3-Mile', icon: '🏃', unit: null, daily: false },
}
