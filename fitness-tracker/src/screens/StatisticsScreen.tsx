"use client"

import { useState, useCallback } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import { useDatabase } from "../contexts/DatabaseContext"
import { useFocusEffect } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialIcons"
import type { WorkoutStats, ExerciseProgress, PersonalRecord } from "../types/database"

// Components
import StatCard from "../components/StatCard"
import WorkoutFrequencyChart from "../components/charts/WorkoutFrequencyChart"
import WeightProgressionChart from "../components/charts/WeightProgressionChart"
import VolumeChart from "../components/charts/VolumeChart"

const StatisticsScreen = () => {
  const { colors } = useTheme()
  const { db } = useDatabase()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState<WorkoutStats | null>(null)
  const [recentRecords, setRecentRecords] = useState<PersonalRecord[]>([])
  const [topExerciseProgress, setTopExerciseProgress] = useState<ExerciseProgress | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<"week" | "month" | "year">("month")

  const loadStatistics = async () => {
    try {
      // Load workout stats
      const workoutStats = await db.getWorkoutStats()
      setStats(workoutStats)

      // Load recent personal records
      const records = await db.getPersonalRecords(5)
      setRecentRecords(records)

      // Load progress for most active exercise (example: bench press)
      const exercises = await db.getExercises("", "Strength")
      if (exercises.length > 0) {
        const progress = await db.getExerciseProgress(exercises[0].id!, 90)
        setTopExerciseProgress(progress)
      }
    } catch (error) {
      console.error("Error loading statistics:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadStatistics()
    }, []),
  )

  const handleRefresh = () => {
    setRefreshing(true)
    loadStatistics()
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  // Generate sample data for charts
  const generateWorkoutFrequencyData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const data = [1, 0, 1, 1, 0, 1, 0] // Sample data
    return {
      labels: days,
      datasets: [{ data }],
    }
  }

  const generateVolumeData = () => {
    const weeks = ["W1", "W2", "W3", "W4"]
    const data = [12500, 15200, 14800, 16100] // Sample data in lbs
    return {
      labels: weeks,
      datasets: [{ data }],
    }
  }

  const generateWeightProgressionData = () => {
    if (!topExerciseProgress || topExerciseProgress.progress_data.length === 0) {
      return {
        labels: ["No Data"],
        datasets: [{ data: [0] }],
      }
    }

    const labels = topExerciseProgress.progress_data.slice(-6).map((item) => {
      const date = new Date(item.date)
      return `${date.getMonth() + 1}/${date.getDate()}`
    })

    const data = topExerciseProgress.progress_data.slice(-6).map((item) => item.max_weight)

    return {
      labels,
      datasets: [{ data }],
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.onBackground,
    },
    timeframeContainer: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 4,
    },
    timeframeButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    timeframeButtonActive: {
      backgroundColor: colors.primary,
    },
    timeframeText: {
      fontSize: 12,
      color: colors.onSurface,
      fontWeight: "500",
    },
    timeframeTextActive: {
      color: colors.onPrimary,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    statCardHalf: {
      width: "48%",
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.onBackground,
      marginBottom: 16,
      marginTop: 8,
    },
    recordsContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    recordItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    recordItemLast: {
      borderBottomWidth: 0,
    },
    recordIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primaryContainer,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    recordInfo: {
      flex: 1,
    },
    recordExercise: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.onSurface,
    },
    recordDetails: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
      marginTop: 2,
    },
    recordValue: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.primary,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 18,
      color: colors.onSurfaceVariant,
      textAlign: "center",
      marginTop: 16,
    },
  })

  if (!stats || (stats.totalWorkouts === 0 && !loading)) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          <Text style={styles.title}>Statistics</Text>

          <View style={styles.emptyState}>
            <Icon name="bar-chart" size={64} color={colors.onSurfaceVariant} />
            <Text style={styles.emptyText}>
              No data to display yet.{"\n"}Complete some workouts to see your progress!
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Statistics</Text>
          <View style={styles.timeframeContainer}>
            {(["week", "month", "year"] as const).map((timeframe) => (
              <TouchableOpacity
                key={timeframe}
                style={[styles.timeframeButton, selectedTimeframe === timeframe && styles.timeframeButtonActive]}
                onPress={() => setSelectedTimeframe(timeframe)}
              >
                <Text style={[styles.timeframeText, selectedTimeframe === timeframe && styles.timeframeTextActive]}>
                  {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsGrid}>
          <View style={styles.statCardHalf}>
            <StatCard
              title="Total Workouts"
              value={stats.totalWorkouts}
              icon="fitness-center"
              trend="up"
              trendValue={`+${stats.workoutsThisMonth} this month`}
            />
          </View>
          <View style={styles.statCardHalf}>
            <StatCard
              title="This Week"
              value={stats.workoutsThisWeek}
              subtitle="workouts completed"
              icon="calendar-today"
            />
          </View>
          <View style={styles.statCardHalf}>
            <StatCard
              title="Total Volume"
              value={`${Math.round(stats.totalVolume).toLocaleString()}`}
              subtitle="lbs lifted"
              icon="fitness-center"
            />
          </View>
          <View style={styles.statCardHalf}>
            <StatCard
              title="Avg Duration"
              value={formatDuration(stats.averageDuration)}
              subtitle="per workout"
              icon="timer"
            />
          </View>
        </View>

        {/* Workout Frequency Chart */}
        <Text style={styles.sectionTitle}>Workout Frequency</Text>
        <WorkoutFrequencyChart data={generateWorkoutFrequencyData()} />

        {/* Volume Chart */}
        <Text style={styles.sectionTitle}>Training Volume</Text>
        <VolumeChart data={generateVolumeData()} />

        {/* Weight Progression Chart */}
        {topExerciseProgress && (
          <>
            <Text style={styles.sectionTitle}>Weight Progression</Text>
            <WeightProgressionChart
              data={generateWeightProgressionData()}
              exerciseName={topExerciseProgress.exercise_name}
            />
          </>
        )}

        {/* Recent Personal Records */}
        <Text style={styles.sectionTitle}>Recent Personal Records</Text>
        <View style={styles.recordsContainer}>
          {recentRecords.length > 0 ? (
            recentRecords.map((record, index) => (
              <View
                key={record.id}
                style={[styles.recordItem, index === recentRecords.length - 1 && styles.recordItemLast]}
              >
                <View style={styles.recordIcon}>
                  <Icon name="emoji-events" size={16} color={colors.onPrimaryContainer} />
                </View>
                <View style={styles.recordInfo}>
                  <Text style={styles.recordExercise}>{record.exercise_name}</Text>
                  <Text style={styles.recordDetails}>
                    {record.record_type} • {new Date(record.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.recordValue}>
                  {record.value}
                  {record.record_type === "weight" && " lbs"}
                  {record.record_type === "reps" && " reps"}
                  {record.record_type === "distance" && " m"}
                  {record.record_type === "duration" && " min"}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No personal records yet. Keep pushing your limits!</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default StatisticsScreen
