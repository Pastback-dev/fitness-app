"use client"

import { useState, useCallback } from "react"
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, RefreshControl } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import { useDatabase } from "../contexts/DatabaseContext"
import { useFocusEffect } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialIcons"
import type { Workout } from "../types/database"

const WorkoutsScreen = ({ navigation }: any) => {
  const { colors } = useTheme()
  const { db } = useDatabase()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadWorkouts = async () => {
    try {
      const workoutList = await db.getWorkouts(50) // Load last 50 workouts
      setWorkouts(workoutList)
    } catch (error) {
      console.error("Error loading workouts:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadWorkouts()
    }, []),
  )

  const handleRefresh = () => {
    setRefreshing(true)
    loadWorkouts()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    }
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return ""
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const renderWorkoutItem = ({ item }: { item: Workout }) => (
    <TouchableOpacity
      style={styles.workoutItem}
      onPress={() => navigation.navigate("WorkoutDetail", { workoutId: item.id })}
    >
      <View style={styles.workoutHeader}>
        <View style={styles.workoutInfo}>
          <Text style={styles.workoutName}>{item.name}</Text>
          <Text style={styles.workoutDate}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.workoutStats}>
          {item.duration && (
            <View style={styles.statItem}>
              <Icon name="timer" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.statText}>{formatDuration(item.duration)}</Text>
            </View>
          )}
        </View>
      </View>
      {item.notes && (
        <Text style={styles.workoutNotes} numberOfLines={2}>
          {item.notes}
        </Text>
      )}
      <View style={styles.workoutFooter}>
        <Icon name="chevron-right" size={20} color={colors.onSurfaceVariant} />
      </View>
    </TouchableOpacity>
  )

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
    addButton: {
      backgroundColor: colors.primary,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    workoutsList: {
      flex: 1,
    },
    workoutItem: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    workoutHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    workoutInfo: {
      flex: 1,
    },
    workoutName: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.onSurface,
      marginBottom: 4,
    },
    workoutDate: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
    },
    workoutStats: {
      alignItems: "flex-end",
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 2,
    },
    statText: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
      marginLeft: 4,
    },
    workoutNotes: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
      marginBottom: 8,
      fontStyle: "italic",
    },
    workoutFooter: {
      alignItems: "flex-end",
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyText: {
      fontSize: 18,
      color: colors.onSurfaceVariant,
      textAlign: "center",
      marginTop: 16,
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Workouts</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddWorkout")}>
            <Icon name="add" size={28} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>

        {workouts.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <Icon name="fitness-center" size={64} color={colors.onSurfaceVariant} />
            <Text style={styles.emptyText}>No workouts yet.{"\n"}Tap the + button to start your first workout!</Text>
          </View>
        ) : (
          <FlatList
            style={styles.workoutsList}
            data={workouts}
            keyExtractor={(item) => item.id?.toString() || ""}
            renderItem={renderWorkoutItem}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  )
}

export default WorkoutsScreen
