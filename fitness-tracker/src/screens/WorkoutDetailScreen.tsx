"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useTheme } from "../contexts/ThemeContext"
import { useDatabase } from "../contexts/DatabaseContext"
import type { WorkoutWithExercises } from "../types/database"

const WorkoutDetailScreen = ({ route, navigation }: any) => {
  const { workoutId } = route.params
  const { colors } = useTheme()
  const { db } = useDatabase()
  const [workout, setWorkout] = useState<WorkoutWithExercises | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWorkout()
  }, [workoutId])

  const loadWorkout = async () => {
    try {
      const workoutData = await db.getWorkoutById(workoutId)
      setWorkout(workoutData)
    } catch (error) {
      console.error("Error loading workout:", error)
      Alert.alert("Error", "Failed to load workout details.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteWorkout = () => {
    Alert.alert("Delete Workout", "Are you sure you want to delete this workout? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await db.deleteWorkout(workoutId)
            navigation.goBack()
          } catch (error) {
            console.error("Error deleting workout:", error)
            Alert.alert("Error", "Failed to delete workout.")
          }
        },
      },
    ])
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "Not recorded"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const calculateTotalVolume = () => {
    if (!workout) return 0
    let totalVolume = 0
    workout.exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        if (set.weight && set.reps) {
          totalVolume += set.weight * set.reps
        }
      })
    })
    return totalVolume
  }

  const calculateTotalSets = () => {
    if (!workout) return 0
    return workout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0)
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    header: {
      backgroundColor: colors.surface,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    workoutName: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.onSurface,
      marginBottom: 8,
    },
    workoutDate: {
      fontSize: 16,
      color: colors.onSurfaceVariant,
      marginBottom: 16,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    statItem: {
      alignItems: "center",
    },
    statValue: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
      marginTop: 4,
    },
    notesSection: {
      backgroundColor: colors.surface,
      margin: 16,
      padding: 16,
      borderRadius: 12,
    },
    notesTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.onSurface,
      marginBottom: 8,
    },
    notesText: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
      lineHeight: 20,
    },
    exercisesSection: {
      flex: 1,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.onBackground,
      marginBottom: 16,
    },
    exerciseItem: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    exerciseHeader: {
      marginBottom: 12,
    },
    exerciseName: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.onSurface,
      marginBottom: 4,
    },
    exerciseDetails: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
    },
    setsContainer: {
      marginTop: 8,
    },
    setsHeader: {
      flexDirection: "row",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
      marginBottom: 8,
    },
    headerText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.onSurfaceVariant,
      textAlign: "center",
    },
    setRow: {
      flexDirection: "row",
      paddingVertical: 6,
    },
    setNumber: {
      width: 30,
      fontSize: 14,
      color: colors.onSurface,
      textAlign: "center",
    },
    setData: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-around",
    },
    setDataText: {
      fontSize: 14,
      color: colors.onSurface,
      textAlign: "center",
    },
    deleteButton: {
      backgroundColor: colors.error,
      margin: 16,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
    },
    deleteButtonText: {
      color: colors.onError,
      fontSize: 16,
      fontWeight: "600",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      fontSize: 16,
      color: colors.onSurfaceVariant,
      marginTop: 16,
    },
  })

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Icon name="fitness-center" size={48} color={colors.onSurfaceVariant} />
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Icon name="error-outline" size={48} color={colors.error} />
          <Text style={styles.loadingText}>Workout not found</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.workoutName}>{workout.name}</Text>
          <Text style={styles.workoutDate}>{formatDate(workout.date)}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatDuration(workout.duration)}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{workout.exercises.length}</Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{calculateTotalSets()}</Text>
              <Text style={styles.statLabel}>Sets</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{calculateTotalVolume().toLocaleString()}</Text>
              <Text style={styles.statLabel}>Volume (lbs)</Text>
            </View>
          </View>
        </View>

        {workout.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{workout.notes}</Text>
          </View>
        )}

        <View style={styles.exercisesSection}>
          <Text style={styles.sectionTitle}>Exercises</Text>

          {workout.exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseItem}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{exercise.exercise.name}</Text>
                <Text style={styles.exerciseDetails}>
                  {exercise.exercise.muscle_groups} • {exercise.exercise.equipment}
                </Text>
              </View>

              {exercise.sets.length > 0 && (
                <View style={styles.setsContainer}>
                  <View style={styles.setsHeader}>
                    <Text style={[styles.headerText, { width: 30 }]}>Set</Text>
                    {exercise.exercise.category === "Strength" && (
                      <>
                        <Text style={[styles.headerText, { flex: 1 }]}>Weight</Text>
                        <Text style={[styles.headerText, { flex: 1 }]}>Reps</Text>
                      </>
                    )}
                    {exercise.exercise.category === "Cardio" && (
                      <>
                        <Text style={[styles.headerText, { flex: 1 }]}>Distance</Text>
                        <Text style={[styles.headerText, { flex: 1 }]}>Duration</Text>
                      </>
                    )}
                  </View>

                  {exercise.sets.map((set, setIndex) => (
                    <View key={setIndex} style={styles.setRow}>
                      <Text style={styles.setNumber}>{set.set_number}</Text>
                      <View style={styles.setData}>
                        {exercise.exercise.category === "Strength" && (
                          <>
                            <Text style={styles.setDataText}>{set.weight || "-"} lbs</Text>
                            <Text style={styles.setDataText}>{set.reps || "-"}</Text>
                          </>
                        )}
                        {exercise.exercise.category === "Cardio" && (
                          <>
                            <Text style={styles.setDataText}>{set.distance ? `${set.distance}m` : "-"}</Text>
                            <Text style={styles.setDataText}>
                              {set.duration
                                ? `${Math.floor(set.duration / 60)}:${(set.duration % 60).toString().padStart(2, "0")}`
                                : "-"}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteWorkout}>
          <Text style={styles.deleteButtonText}>Delete Workout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

export default WorkoutDetailScreen
