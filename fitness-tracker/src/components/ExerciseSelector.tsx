"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useTheme } from "../contexts/ThemeContext"
import { useDatabase } from "../contexts/DatabaseContext"
import type { Exercise } from "../types/database"

interface ExerciseSelectorProps {
  visible: boolean
  onClose: () => void
  onSelectExercise: (exercise: Exercise) => void
}

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({ visible, onClose, onSelectExercise }) => {
  const { colors } = useTheme()
  const { db } = useDatabase()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")

  const categories = ["All", "Strength", "Cardio", "Flexibility", "Sports"]

  useEffect(() => {
    if (visible) {
      loadExercises()
    }
  }, [visible, searchTerm, selectedCategory])

  const loadExercises = async () => {
    try {
      const category = selectedCategory === "All" ? undefined : selectedCategory
      const exerciseList = await db.getExercises(searchTerm, category)
      setExercises(exerciseList)
    } catch (error) {
      console.error("Error loading exercises:", error)
    }
  }

  const handleSelectExercise = (exercise: Exercise) => {
    onSelectExercise(exercise)
    onClose()
    setSearchTerm("")
    setSelectedCategory("")
  }

  const styles = StyleSheet.create({
    modal: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    closeButton: {
      padding: 8,
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.onBackground,
      flex: 1,
    },
    searchContainer: {
      padding: 16,
    },
    searchInput: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.onSurface,
      marginBottom: 16,
    },
    categoriesContainer: {
      flexDirection: "row",
      marginBottom: 8,
    },
    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      backgroundColor: colors.surface,
    },
    categoryButtonActive: {
      backgroundColor: colors.primary,
    },
    categoryText: {
      fontSize: 14,
      color: colors.onSurface,
      fontWeight: "500",
    },
    categoryTextActive: {
      color: colors.onPrimary,
    },
    exercisesList: {
      flex: 1,
      paddingHorizontal: 16,
    },
    exerciseItem: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    exerciseInfo: {
      flex: 1,
    },
    exerciseName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.onSurface,
      marginBottom: 4,
    },
    exerciseDetails: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
    },
    exerciseIcon: {
      marginLeft: 12,
    },
  })

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modal}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color={colors.onBackground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Exercise</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            placeholderTextColor={colors.onSurfaceVariant}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />

          <FlatList
            horizontal
            data={categories}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  (selectedCategory === item || (selectedCategory === "" && item === "All")) &&
                    styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(item === "All" ? "" : item)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    (selectedCategory === item || (selectedCategory === "" && item === "All")) &&
                      styles.categoryTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <FlatList
          style={styles.exercisesList}
          data={exercises}
          keyExtractor={(item) => item.id?.toString() || item.name}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.exerciseItem} onPress={() => handleSelectExercise(item)}>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Text style={styles.exerciseDetails}>
                  {item.muscle_groups} • {item.equipment || "No equipment"}
                </Text>
              </View>
              <Icon name="add-circle-outline" size={24} color={colors.primary} style={styles.exerciseIcon} />
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  )
}

export default ExerciseSelector
