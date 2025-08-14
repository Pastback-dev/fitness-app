"use client"

import { useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import { useDatabase } from "../contexts/DatabaseContext"
import Icon from "react-native-vector-icons/MaterialIcons"
import ExerciseSelector from "../components/ExerciseSelector"
import type { Exercise, TemplateExercise } from "../types/database"

const CreateTemplateScreen = ({ navigation }: any) => {
  const { colors } = useTheme()
  const { db } = useDatabase()
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")
  const [exerciseSelectorVisible, setExerciseSelectorVisible] = useState(false)
  const [templateExercises, setTemplateExercises] = useState<(TemplateExercise & { exercise: Exercise })[]>([])
  const [loading, setLoading] = useState(false)

  const handleAddExercise = (exercise: Exercise) => {
    const newTemplateExercise: TemplateExercise & { exercise: Exercise } = {
      template_id: 0,
      exercise_id: exercise.id!,
      order_index: templateExercises.length,
      default_sets: 3,
      default_reps: 10,
      default_weight: 0,
      exercise,
    }

    setTemplateExercises([...templateExercises, newTemplateExercise])
  }

  const handleRemoveExercise = (index: number) => {
    const updated = templateExercises.filter((_, i) => i !== index)
    setTemplateExercises(updated)
  }

  const handleUpdateExerciseDefaults = (
    index: number,
    field: "default_sets" | "default_reps" | "default_weight",
    value: number,
  ) => {
    const updated = [...templateExercises]
    updated[index] = { ...updated[index], [field]: value }
    setTemplateExercises(updated)
  }

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      Alert.alert("Missing Name", "Please enter a template name.")
      return
    }

    if (templateExercises.length === 0) {
      Alert.alert("No Exercises", "Please add at least one exercise to your template.")
      return
    }

    try {
      setLoading(true)

      const templateId = await db.createTemplate({
        name: templateName.trim(),
        description: templateDescription.trim() || undefined,
      })

      // Add exercises to template
      for (let i = 0; i < templateExercises.length; i++) {
        const exercise = templateExercises[i]
        await db.addExerciseToTemplate({
          template_id: templateId,
          exercise_id: exercise.exercise_id,
          order_index: i,
          default_sets: exercise.default_sets,
          default_reps: exercise.default_reps,
          default_weight: exercise.default_weight,
        })
      }

      Alert.alert("Template Created!", "Your workout template has been saved successfully.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error) {
      console.error("Error saving template:", error)
      Alert.alert("Error", "Failed to save template. Please try again.")
    } finally {
      setLoading(false)
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
    templateInfo: {
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
    textArea: {
      height: 80,
      textAlignVertical: "top",
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.onSurface,
      marginBottom: 8,
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
    defaultsContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
    },
    defaultsTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.onSurface,
      marginBottom: 12,
    },
    defaultsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    defaultInput: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: colors.onBackground,
      textAlign: "center",
      width: 80,
    },
    defaultLabel: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
      textAlign: "center",
      marginBottom: 4,
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
  })

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.templateInfo}>
            <Text style={styles.label}>Template Name</Text>
            <TextInput
              style={styles.input}
              value={templateName}
              onChangeText={setTemplateName}
              placeholder="Enter template name"
              placeholderTextColor={colors.onSurfaceVariant}
            />

            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={templateDescription}
              onChangeText={setTemplateDescription}
              placeholder="Describe this workout template..."
              placeholderTextColor={colors.onSurfaceVariant}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        {templateExercises.map((templateExercise, index) => (
          <View key={index} style={styles.exerciseContainer}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{templateExercise.exercise.name}</Text>
                <Text style={styles.exerciseDetails}>
                  {templateExercise.exercise.muscle_groups} • {templateExercise.exercise.equipment}
                </Text>
              </View>
              <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveExercise(index)}>
                <Icon name="close" size={24} color={colors.error} />
              </TouchableOpacity>
            </View>

            <View style={styles.defaultsContainer}>
              <Text style={styles.defaultsTitle}>Default Values</Text>
              <View style={styles.defaultsRow}>
                <View>
                  <Text style={styles.defaultLabel}>Sets</Text>
                  <TextInput
                    style={styles.defaultInput}
                    value={templateExercise.default_sets?.toString() || ""}
                    onChangeText={(text) =>
                      handleUpdateExerciseDefaults(index, "default_sets", Number.parseInt(text) || 0)
                    }
                    keyboardType="numeric"
                    placeholder="3"
                    placeholderTextColor={colors.onSurfaceVariant}
                  />
                </View>
                <View>
                  <Text style={styles.defaultLabel}>Reps</Text>
                  <TextInput
                    style={styles.defaultInput}
                    value={templateExercise.default_reps?.toString() || ""}
                    onChangeText={(text) =>
                      handleUpdateExerciseDefaults(index, "default_reps", Number.parseInt(text) || 0)
                    }
                    keyboardType="numeric"
                    placeholder="10"
                    placeholderTextColor={colors.onSurfaceVariant}
                  />
                </View>
                <View>
                  <Text style={styles.defaultLabel}>Weight (lbs)</Text>
                  <TextInput
                    style={styles.defaultInput}
                    value={templateExercise.default_weight?.toString() || ""}
                    onChangeText={(text) =>
                      handleUpdateExerciseDefaults(index, "default_weight", Number.parseFloat(text) || 0)
                    }
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.onSurfaceVariant}
                  />
                </View>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addExerciseButton} onPress={() => setExerciseSelectorVisible(true)}>
          <Icon name="add" size={24} color={colors.primary} />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSaveTemplate}
          disabled={loading}
        >
          <Text style={[styles.saveButtonText, loading && styles.saveButtonTextDisabled]}>
            {loading ? "Saving..." : "Save Template"}
          </Text>
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

export default CreateTemplateScreen
