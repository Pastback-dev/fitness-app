"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useTheme } from "../contexts/ThemeContext"
import { useDatabase } from "../contexts/DatabaseContext"
import type { Exercise, ExerciseProgress } from "../types/database"

const ExerciseDetailScreen = ({ route, navigation }: any) => {
  const { exerciseId } = route.params
  const { colors } = useTheme()
  const { db } = useDatabase()
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [progress, setProgress] = useState<ExerciseProgress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadExerciseDetails()
  }, [exerciseId])

  const loadExerciseDetails = async () => {
    try {
      const exerciseData = await db.getExerciseById(exerciseId)
      setExercise(exerciseData)

      if (exerciseData) {
        const progressData = await db.getExerciseProgress(exerciseId)
        setProgress(progressData)
      }
    } catch (error) {
      console.error("Error loading exercise details:", error)
      Alert.alert("Error", "Failed to load exercise details.")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    if (exercise?.is_custom) {
      navigation.navigate("AddExercise", { exerciseId: exercise.id })
    }
  }

  const handleDelete = () => {
    if (!exercise?.is_custom) {
      Alert.alert("Cannot Delete", "You can only delete custom exercises.")
      return
    }

    Alert.alert("Delete Exercise", `Are you sure you want to delete "${exercise.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await db.deleteExercise(exercise.id!)
            navigation.goBack()
          } catch (error) {
            console.error("Error deleting exercise:", error)
            Alert.alert("Error", "Failed to delete exercise.")
          }
        },
      },
    ])
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
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
    exerciseNameRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    exerciseName: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.onSurface,
      marginRight: 12,
    },
    customBadge: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    customBadgeText: {
      fontSize: 12,
      color: colors.onPrimary,
      fontWeight: "600",
    },
    exerciseCategory: {
      fontSize: 18,
      color: colors.primary,
      fontWeight: "600",
      marginBottom: 8,
    },
    exerciseDetails: {
      fontSize: 16,
      color: colors.onSurfaceVariant,
      marginBottom: 4,
    },
    actionsContainer: {
      flexDirection: "row",
      marginTop: 16,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 12,
    },
    deleteButton: {
      backgroundColor: colors.error,
    },
    actionButtonText: {
      color: colors.onPrimary,
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 4,
    },
    section: {
      backgroundColor: colors.surface,
      margin: 16,
      padding: 16,
      borderRadius: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.onSurface,
      marginBottom: 12,
    },
    instructionsText: {
      fontSize: 16,
      color: colors.onSurface,
      lineHeight: 24,
    },
    progressContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 16,
    },
    progressItem: {
      alignItems: "center",
    },
    progressValue: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.primary,
    },
    progressLabel: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
      marginTop: 4,
      textAlign: "center",
    },
    noProgressText: {
      fontSize: 16,
      color: colors.onSurfaceVariant,
      textAlign: "center",
      fontStyle: "italic",
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
          <Text style={styles.loadingText}>Loading exercise...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!exercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Icon name="error-outline" size={48} color={colors.error} />
          <Text style={styles.loadingText}>Exercise not found</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.exerciseNameRow}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            {exercise.is_custom && (
              <View style={styles.customBadge}>
                <Text style={styles.customBadgeText}>Custom</Text>
              </View>
            )}
          </View>
          <Text style={styles.exerciseCategory}>{exercise.category}</Text>
          <Text style={styles.exerciseDetails}>
            <Icon name="fitness-center" size={16} color={colors.onSurfaceVariant} /> {exercise.muscle_groups}
          </Text>
          {exercise.equipment && (
            <Text style={styles.exerciseDetails}>
              <Icon name="build" size={16} color={colors.onSurfaceVariant} /> {exercise.equipment}
            </Text>
          )}

          {exercise.is_custom && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
                <Icon name="edit" size={16} color={colors.onPrimary} />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
                <Icon name="delete" size={16} color={colors.onPrimary} />
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {exercise.instructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.instructionsText}>{exercise.instructions}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress & Records</Text>
          {progress ? (
            <>
              <View style={styles.progressContainer}>
                <View style={styles.progressItem}>
                  <Text style={styles.progressValue}>{progress.max_weight || 0}</Text>
                  <Text style={styles.progressLabel}>Max Weight{"\n"}(lbs)</Text>
                </View>
                <View style={styles.progressItem}>
                  <Text style={styles.progressValue}>{progress.max_reps || 0}</Text>
                  <Text style={styles.progressLabel}>Max Reps</Text>
                </View>
                <View style={styles.progressItem}>
                  <Text style={styles.progressValue}>{Math.round(progress.total_volume || 0).toLocaleString()}</Text>
                  <Text style={styles.progressLabel}>Total Volume{"\n"}(lbs)</Text>
                </View>
              </View>
              {progress.last_performed && (
                <Text style={styles.exerciseDetails}>Last performed: {formatDate(progress.last_performed)}</Text>
              )}
            </>
          ) : (
            <Text style={styles.noProgressText}>
              No workout data yet.{"\n"}Add this exercise to a workout to track your progress!
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ExerciseDetailScreen
