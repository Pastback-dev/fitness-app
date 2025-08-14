"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useTheme } from "../contexts/ThemeContext"
import { useDatabase } from "../contexts/DatabaseContext"
import ExerciseSelector from "../components/ExerciseSelector"
import SetLogger from "../components/SetLogger"
import type { Exercise, WorkoutExercise, Set } from "../types/database"

const AddWorkoutScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme()
  const { db } = useDatabase()
  const { template } = route.params || {}

  const [workoutName, setWorkoutName] = useState("")
  const [workoutNotes, setWorkoutNotes] = useState("")
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split("T")[0])
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [exerciseSelectorVisible, setExerciseSelectorVisible] = useState(false)
  const [workoutExercises, setWorkoutExercises] = useState<
    (WorkoutExercise & {
      exercise: Exercise
      sets: Set[]
    })[]
  >([])

  useEffect(() => {
    setStartTime(new Date())
    setWorkoutName(`Workout ${new Date().toLocaleDateString()}`)

    if (template) {
      setWorkoutName(template.name)
      const templateWorkoutExercises = template.exercises.map((te: any, index: number) => ({
        workout_id: 0,
        exercise_id: te.exercise_id,
        order_index: index,
        exercise: te.exercise,
        sets: [],
      }))
      setWorkoutExercises(templateWorkoutExercises)
    }
  }, [template])

  const handleAddExercise = (exercise: Exercise) => {
    const newWorkoutExercise: WorkoutExercise & {
      exercise: Exercise
      sets: Set[]
    } = {
      workout_id: 0, // Will be set when workout is saved
      exercise_id: exercise.id!,
      order_index: workoutExercises.length,
      exercise,
      sets: [],
    }

    setWorkoutExercises([...workoutExercises, newWorkoutExercise])
  }

  const handleRemoveExercise = (index: number) => {
    Alert.alert("Remove Exercise", "Are you sure you want to remove this exercise and all its sets?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          const updated = workoutExercises.filter((_, i) => i !== index)
          setWorkoutExercises(updated)
        },
      },
    ])
  }

  const handleAddSet = (exerciseIndex: number, set: Omit<Set, "id" | "workout_exercise_id">) => {
    const updated = [...workoutExercises]
    const newSet: Set = {
      ...set,
      workout_exercise_id: 0, // Will be set when saved
    }
    updated[exerciseIndex].sets.push(newSet)
    setWorkoutExercises(updated)
  }

  const handleUpdateSet = (exerciseIndex: number, setId: number, setData: Partial<Set>) => {
    const updated = [...workoutExercises]
    const setIndex = updated[exerciseIndex].sets.findIndex((s) => s.id === setId)
    if (setIndex !== -1) {
      updated[exerciseIndex].sets[setIndex] = {
        ...updated[exerciseIndex].sets[setIndex],
        ...setData,
      }
      setWorkoutExercises(updated)
    }
  }

  const handleDeleteSet = (exerciseIndex: number, setId: number) => {
    const updated = [...workoutExercises]
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((s) => s.id !== setId)
    // Renumber sets
    updated[exerciseIndex].sets.forEach((set, index) => {
      set.set_number = index + 1
    })
    setWorkoutExercises(updated)
  }

  const calculateWorkoutDuration = (): number => {
    if (!startTime) return 0
    return Math.floor((new Date().getTime() - startTime.getTime()) / 1000 / 60)
  }

  const handleSaveWorkout = async () => {
    if (!workoutName.trim()) {
      Alert.alert("Missing Name", "Please enter a workout name.")
      return
    }

    if (workoutExercises.length === 0) {
      Alert.alert("No Exercises", "Please add at least one exercise to your workout.")
      return
    }

    const hasAnySets = workoutExercises.some((we) => we.sets.length > 0)
    if (!hasAnySets) {
      Alert.alert("No Sets", "Please add at least one set to your workout.")
      return
    }

    try {
      // Create workout
      const workoutId = await db.createWorkout({
        name: workoutName.trim(),
        date: workoutDate,
        duration: calculateWorkoutDuration(),
        notes: workoutNotes.trim() || undefined,
      })

      // Add exercises and sets
      for (let i = 0; i < workoutExercises.length; i++) {
        const workoutExercise = workoutExercises[i]

        if (workoutExercise.sets.length > 0) {
          const workoutExerciseId = await db.addExerciseToWorkout({
            workout_id: workoutId,
            exercise_id: workoutExercise.exercise_id,
            order_index: i,
          })

          // Add sets
          for (const set of workoutExercise.sets) {
            await db.addSet({
              ...set,
              workout_exercise_id: workoutExerciseId,
            })

            // Check for personal records
            if (workoutExercise.exercise.category === "Strength" && set.weight) {
              await db.checkAndCreatePersonalRecord(
                workoutExercise.exercise_id,
                "weight",
                set.weight,
                workoutId,
                workoutDate,
              )
            }
          }
        }
      }

      Alert.alert("Workout Saved!", "Your workout has been saved successfully.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error) {
      console.error("Error saving workout:", error)
      Alert.alert("Error", "Failed to save workout. Please try again.")
    }
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
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    workoutInfo: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.onBackground,
      marginBottom: 12,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.onSurface,
      marginBottom: 8,
    },
    timerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primaryContainer,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    timerText: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.onPrimaryContainer,
      marginLeft: 8,
    },
    addExerciseButton: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      margin: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.primary,
      borderStyle: "dashed",
    },
    addExerciseText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary,
      marginLeft: 8,
    },
    exerciseContainer: {
      margin: 16,
      marginBottom: 0,
    },
    exerciseHeader: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
    },
    exerciseInfo: {
      flex: 1,
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
    removeButton: {
      padding: 8,
    },
    saveButton: {
      backgroundColor: colors.primary,
      margin: 16,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
    },
    saveButtonText: {
      color: colors.onPrimary,
      fontSize: 18,
      fontWeight: "600",
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.workoutInfo}>
            <Text style={styles.label}>Workout Name</Text>
            <TextInput
              style={styles.input}
              value={workoutName}
              onChangeText={setWorkoutName}
              placeholder="Enter workout name"
              placeholderTextColor={colors.onSurfaceVariant}
            />

            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={workoutNotes}
              onChangeText={setWorkoutNotes}
              placeholder="Add workout notes..."
              placeholderTextColor={colors.onSurfaceVariant}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.timerContainer}>
              <Icon name="timer" size={20} color={colors.onPrimaryContainer} />
              <Text style={styles.timerText}>{calculateWorkoutDuration()} minutes</Text>
            </View>
          </View>
        </View>

        {workoutExercises.map((workoutExercise, index) => (
          <View key={index} style={styles.exerciseContainer}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{workoutExercise.exercise.name}</Text>
                <Text style={styles.exerciseDetails}>
                  {workoutExercise.exercise.muscle_groups} • {workoutExercise.exercise.equipment}
                </Text>
              </View>
              <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveExercise(index)}>
                <Icon name="close" size={24} color={colors.error} />
              </TouchableOpacity>
            </View>

            <SetLogger
              sets={workoutExercise.sets}
              exerciseType={workoutExercise.exercise.category}
              onAddSet={(set) => handleAddSet(index, set)}
              onUpdateSet={(setId, setData) => handleUpdateSet(index, setId, setData)}
              onDeleteSet={(setId) => handleDeleteSet(index, setId)}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.addExerciseButton} onPress={() => setExerciseSelectorVisible(true)}>
          <Icon name="add" size={24} color={colors.primary} />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveWorkout}>
          <Text style={styles.saveButtonText}>Save Workout</Text>
        </TouchableOpacity>
      </ScrollView>

      <ExerciseSelector
        visible={exerciseSelectorVisible}
        onClose={() => setExerciseSelectorVisible(false)}
        onSelectExercise={handleAddExercise}
      />
    </SafeAreaView>
  )
}

export default AddWorkoutScreen
