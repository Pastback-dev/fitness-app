"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import { useDatabase } from "../contexts/DatabaseContext"
import type { Exercise } from "../types/database"

const AddExerciseScreen = ({ route, navigation }: any) => {
  const { exerciseId } = route.params || {}
  const { colors } = useTheme()
  const { db } = useDatabase()
  const [isEditing, setIsEditing] = useState(!!exerciseId)
  const [loading, setLoading] = useState(false)

  const [exerciseData, setExerciseData] = useState({
    name: "",
    category: "Strength" as "Strength" | "Cardio" | "Flexibility" | "Sports",
    muscle_groups: "",
    equipment: "",
    instructions: "",
  })

  const categories: ("Strength" | "Cardio" | "Flexibility" | "Sports")[] = [
    "Strength",
    "Cardio",
    "Flexibility",
    "Sports",
  ]

  const commonMuscleGroups = [
    "Chest",
    "Back",
    "Shoulders",
    "Biceps",
    "Triceps",
    "Forearms",
    "Abs",
    "Quadriceps",
    "Hamstrings",
    "Glutes",
    "Calves",
    "Full Body",
  ]

  const commonEquipment = [
    "Barbell",
    "Dumbbells",
    "Kettlebell",
    "Cable Machine",
    "Machine",
    "Pull-up Bar",
    "Resistance Bands",
    "Bodyweight",
    "None",
  ]

  useEffect(() => {
    if (isEditing && exerciseId) {
      loadExercise()
    }
  }, [exerciseId, isEditing])

  const loadExercise = async () => {
    try {
      setLoading(true)
      const exercise = await db.getExerciseById(exerciseId)
      if (exercise) {
        setExerciseData({
          name: exercise.name,
          category: exercise.category,
          muscle_groups: exercise.muscle_groups,
          equipment: exercise.equipment || "",
          instructions: exercise.instructions || "",
        })
      }
    } catch (error) {
      console.error("Error loading exercise:", error)
      Alert.alert("Error", "Failed to load exercise details.")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!exerciseData.name.trim()) {
      Alert.alert("Missing Name", "Please enter an exercise name.")
      return
    }

    if (!exerciseData.muscle_groups.trim()) {
      Alert.alert("Missing Muscle Groups", "Please specify the muscle groups worked.")
      return
    }

    try {
      setLoading(true)

      const exerciseToSave: Omit<Exercise, "id" | "created_at"> = {
        name: exerciseData.name.trim(),
        category: exerciseData.category,
        muscle_groups: exerciseData.muscle_groups.trim(),
        equipment: exerciseData.equipment.trim() || undefined,
        instructions: exerciseData.instructions.trim() || undefined,
        is_custom: true,
      }

      if (isEditing && exerciseId) {
        await db.updateExercise(exerciseId, exerciseToSave)
        Alert.alert("Exercise Updated!", "Your exercise has been updated successfully.", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ])
      } else {
        await db.createExercise(exerciseToSave)
        Alert.alert("Exercise Created!", "Your custom exercise has been created successfully.", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ])
      }
    } catch (error) {
      console.error("Error saving exercise:", error)
      Alert.alert("Error", "Failed to save exercise. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleMuscleGroupSelect = (muscleGroup: string) => {
    const currentGroups = exerciseData.muscle_groups
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean)

    if (currentGroups.includes(muscleGroup)) {
      // Remove if already selected
      const updated = currentGroups.filter((g) => g !== muscleGroup)
      setExerciseData({ ...exerciseData, muscle_groups: updated.join(", ") })
    } else {
      // Add if not selected
      const updated = [...currentGroups, muscleGroup]
      setExerciseData({ ...exerciseData, muscle_groups: updated.join(", ") })
    }
  }

  const isMuscleGroupSelected = (muscleGroup: string) => {
    const currentGroups = exerciseData.muscle_groups
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean)
    return currentGroups.includes(muscleGroup)
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    section: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.onBackground,
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.onBackground,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.onSurface,
      marginBottom: 16,
    },
    textArea: {
      height: 100,
      textAlignVertical: "top",
    },
    categoryContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 16,
    },
    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      marginRight: 8,
      marginBottom: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.outline,
    },
    categoryButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryText: {
      fontSize: 14,
      color: colors.onSurface,
      fontWeight: "500",
    },
    categoryTextActive: {
      color: colors.onPrimary,
    },
    muscleGroupsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 16,
    },
    muscleGroupButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      marginRight: 8,
      marginBottom: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.outline,
    },
    muscleGroupButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    muscleGroupText: {
      fontSize: 12,
      color: colors.onSurface,
      fontWeight: "500",
    },
    muscleGroupTextActive: {
      color: colors.onPrimary,
    },
    equipmentContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 16,
    },
    equipmentButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      marginRight: 8,
      marginBottom: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.outline,
    },
    equipmentButtonActive: {
      backgroundColor: colors.secondary,
      borderColor: colors.secondary,
    },
    equipmentText: {
      fontSize: 12,
      color: colors.onSurface,
      fontWeight: "500",
    },
    equipmentTextActive: {
      color: colors.onSecondary,
    },
    saveButton: {
      backgroundColor: colors.primary,
      margin: 16,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
    },
    saveButtonDisabled: {
      backgroundColor: colors.onSurfaceVariant,
    },
    saveButtonText: {
      color: colors.onPrimary,
      fontSize: 18,
      fontWeight: "600",
    },
    saveButtonTextDisabled: {
      color: colors.surface,
    },
    helperText: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
      marginBottom: 8,
      fontStyle: "italic",
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isEditing ? "Edit Exercise" : "Create Custom Exercise"}</Text>

          <Text style={styles.label}>Exercise Name *</Text>
          <TextInput
            style={styles.input}
            value={exerciseData.name}
            onChangeText={(text) => setExerciseData({ ...exerciseData, name: text })}
            placeholder="Enter exercise name"
            placeholderTextColor={colors.onSurfaceVariant}
          />

          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.categoryButton, exerciseData.category === category && styles.categoryButtonActive]}
                onPress={() => setExerciseData({ ...exerciseData, category })}
              >
                <Text style={[styles.categoryText, exerciseData.category === category && styles.categoryTextActive]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Muscle Groups *</Text>
          <Text style={styles.helperText}>Tap to select multiple muscle groups</Text>
          <View style={styles.muscleGroupsContainer}>
            {commonMuscleGroups.map((muscleGroup) => (
              <TouchableOpacity
                key={muscleGroup}
                style={[styles.muscleGroupButton, isMuscleGroupSelected(muscleGroup) && styles.muscleGroupButtonActive]}
                onPress={() => handleMuscleGroupSelect(muscleGroup)}
              >
                <Text
                  style={[styles.muscleGroupText, isMuscleGroupSelected(muscleGroup) && styles.muscleGroupTextActive]}
                >
                  {muscleGroup}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            value={exerciseData.muscle_groups}
            onChangeText={(text) => setExerciseData({ ...exerciseData, muscle_groups: text })}
            placeholder="Or type custom muscle groups (comma separated)"
            placeholderTextColor={colors.onSurfaceVariant}
          />

          <Text style={styles.label}>Equipment</Text>
          <View style={styles.equipmentContainer}>
            {commonEquipment.map((equipment) => (
              <TouchableOpacity
                key={equipment}
                style={[styles.equipmentButton, exerciseData.equipment === equipment && styles.equipmentButtonActive]}
                onPress={() => setExerciseData({ ...exerciseData, equipment })}
              >
                <Text
                  style={[styles.equipmentText, exerciseData.equipment === equipment && styles.equipmentTextActive]}
                >
                  {equipment}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            value={exerciseData.equipment}
            onChangeText={(text) => setExerciseData({ ...exerciseData, equipment: text })}
            placeholder="Or type custom equipment"
            placeholderTextColor={colors.onSurfaceVariant}
          />

          <Text style={styles.label}>Instructions (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={exerciseData.instructions}
            onChangeText={(text) => setExerciseData({ ...exerciseData, instructions: text })}
            placeholder="Enter exercise instructions or form cues..."
            placeholderTextColor={colors.onSurfaceVariant}
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={[styles.saveButtonText, loading && styles.saveButtonTextDisabled]}>
            {loading ? "Saving..." : isEditing ? "Update Exercise" : "Create Exercise"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

export default AddExerciseScreen
