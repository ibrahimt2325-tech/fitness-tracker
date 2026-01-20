import { useState, useEffect, useCallback } from 'react'
import { supabase, DEMO_USERS, createDemoData } from '../lib/supabase'
import { formatDateKey, getWeekDays } from '../lib/dates'

export function useWeekData(weekStart) {
  const [users, setUsers] = useState(DEMO_USERS)
  const [dailyLogs, setDailyLogs] = useState({})
  const [weeklyLogs, setWeeklyLogs] = useState({})
  const [loading, setLoading] = useState(true)

  const weekStartKey = formatDateKey(weekStart)

  // Fetch data for the week
  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      if (!supabase) {
        // Demo mode
        const demoData = createDemoData(weekStart)
        const daily = {}
        const weekly = {}

        DEMO_USERS.forEach(user => {
          daily[user.id] = demoData[user.id].daily
          weekly[user.id] = demoData[user.id].weekly
        })

        setDailyLogs(daily)
        setWeeklyLogs(weekly)
        setLoading(false)
        return
      }

      try {
        // Fetch users
        const { data: usersData } = await supabase.from('users').select('*')
        if (usersData) setUsers(usersData)

        // Get date range for the week
        const days = getWeekDays(weekStart)
        const startDate = formatDateKey(days[0])
        const endDate = formatDateKey(days[6])

        // Fetch daily logs
        const { data: dailyData } = await supabase
          .from('daily_logs')
          .select('*')
          .gte('date', startDate)
          .lte('date', endDate)

        // Organize by user and date
        const dailyByUser = {}
        dailyData?.forEach(log => {
          if (!dailyByUser[log.user_id]) dailyByUser[log.user_id] = {}
          dailyByUser[log.user_id][log.date] = log
        })
        setDailyLogs(dailyByUser)

        // Fetch weekly logs
        const { data: weeklyData } = await supabase
          .from('weekly_logs')
          .select('*')
          .eq('week_start_date', weekStartKey)

        const weeklyByUser = {}
        weeklyData?.forEach(log => {
          weeklyByUser[log.user_id] = log
        })
        setWeeklyLogs(weeklyByUser)

      } catch (error) {
        console.error('Error fetching data:', error)
      }

      setLoading(false)
    }

    fetchData()
  }, [weekStartKey])

  // Save daily log
  const saveDailyLog = useCallback(async (userId, date, data) => {
    const dateKey = formatDateKey(date)

    // Optimistic update
    setDailyLogs(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [dateKey]: { ...prev[userId]?.[dateKey], ...data }
      }
    }))

    if (!supabase) return

    try {
      const { error } = await supabase
        .from('daily_logs')
        .upsert({
          user_id: userId,
          date: dateKey,
          ...data
        }, {
          onConflict: 'user_id,date'
        })

      if (error) throw error
    } catch (error) {
      console.error('Error saving daily log:', error)
    }
  }, [])

  // Save weekly log
  const saveWeeklyLog = useCallback(async (userId, did3Mile) => {
    // Optimistic update
    setWeeklyLogs(prev => ({
      ...prev,
      [userId]: { ...prev[userId], did_3_mile: did3Mile }
    }))

    if (!supabase) return

    try {
      const { error } = await supabase
        .from('weekly_logs')
        .upsert({
          user_id: userId,
          week_start_date: weekStartKey,
          did_3_mile: did3Mile
        }, {
          onConflict: 'user_id,week_start_date'
        })

      if (error) throw error
    } catch (error) {
      console.error('Error saving weekly log:', error)
    }
  }, [weekStartKey])

  return {
    users,
    dailyLogs,
    weeklyLogs,
    loading,
    saveDailyLog,
    saveWeeklyLog,
  }
}
