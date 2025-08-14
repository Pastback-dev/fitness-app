"use client"

import { useState, useCallback } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import { useDatabase } from "../contexts/DatabaseContext"
import { useFocusEffect } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialIcons"
import type { WorkoutStats, PersonalRecord } from "../types/database"
import StatCard from "../components/StatCard"

const DashboardScreen = ({ navigation }: any) => {
  const { colors } = useTheme()
  const { db } = useDatabase()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState<WorkoutStats | null>(null)
  const [recentRecords, setRecentRecords] = useState<PersonalRecord[]>([])

  const loadDashboardData = async () => {
    try {
      const workoutStats = await db.getWorkoutStats()
      setStats(workoutStats)

      const records = await db.getPersonalRecords(3)
      setRecentRecords(records)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadDashboardData()
    }, []),
  )

  const handleRefresh = () => {
    setRefreshing(true)
    loadDashboardData()
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
      marginBottom: 24,
    },
    greeting: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.onBackground,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: colors.onSurfaceVariant,
    },
    quickActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    actionButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      marginHorizontal: 4,
    },
    actionButtonSecondary: {
      backgroundColor: colors.secondary,
    },
    actionButtonText: {
      color: colors.onPrimary,
      fontSize: 14,
      fontWeight: "600",
      marginTop: 8,
    },
    actionButtonTextSecondary: {
      color: colors.onSecondary,
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
      fontSize: 14,
      fontWeight: "bold",
      color: colors.primary,
    },
    emptyText: {
      fontSize: 16,
      color: colors.onSurfaceVariant,
      textAlign: "center",
      fontStyle: "italic",
    },
  })

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
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
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.subtitle}>Ready for your next workout?</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Workouts", { screen: "AddWorkout" })}
          >
            <Icon name="add" size={24} color={colors.onPrimary} />
            <Text style={styles.actionButtonText}>Start Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => navigation.navigate("Statistics")}
          >
            <Icon name="bar-chart" size={24} color={colors.onSecondary} />
            <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>View Stats</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        {stats && (
          <>
            <StatCard
              title="This Week"
              value={stats.workoutsThisWeek}
              subtitle="Workouts completed"
              icon="calendar-today"
              onPress={() => navigation.navigate("Statistics")}
            />

            <StatCard
              title="Personal Records"
              value={recentRecords.length}
              subtitle="New PRs this month"
              icon="emoji-events"
              onPress={() => navigation.navigate("Statistics")}
            />

            <StatCard
              title="Total Volume"
              value={`${Math.round(stats.totalVolume).toLocaleString()} lbs`}
              subtitle="Lifted this week"
              icon="fitness-center"
              onPress={() => navigation.navigate("Statistics")}
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
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No personal records yet. Start working out to track your progress!</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default DashboardScreen
