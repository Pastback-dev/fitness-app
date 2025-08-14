"use client"

import { useState, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  RefreshControl,
  Alert,
} from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import { useDatabase } from "../contexts/DatabaseContext"
import { useFocusEffect } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialIcons"
import type { Exercise } from "../types/database"

const ExercisesScreen = ({ navigation }: any) => {
  const { colors } = useTheme()
  const { db } = useDatabase()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [showCustomOnly, setShowCustomOnly] = useState(false)

  const categories = ["All", "Strength", "Cardio", "Flexibility", "Sports"]

  const loadExercises = async () => {
    try {
      const exerciseList = await db.getExercises()
      setExercises(exerciseList)
      filterExercises(exerciseList, searchTerm, selectedCategory, showCustomOnly)
    } catch (error) {
      console.error("Error loading exercises:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const filterExercises = (exerciseList: Exercise[], search: string, category: string, customOnly: boolean) => {
    let filtered = exerciseList

    if (customOnly) {
      filtered = filtered.filter((exercise) => exercise.is_custom)
    }

    if (search) {
      filtered = filtered.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(search.toLowerCase()) ||
          exercise.muscle_groups.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (category && category !== "All") {
      filtered = filtered.filter((exercise) => exercise.category === category)
    }

    setFilteredExercises(filtered)
  }

  useFocusEffect(
    useCallback(() => {
      loadExercises()
    }, []),
  )

  const handleRefresh = () => {
    setRefreshing(true)
    loadExercises()
  }

  const handleSearch = (text: string) => {
    setSearchTerm(text)
    filterExercises(exercises, text, selectedCategory, showCustomOnly)
  }

  const handleCategoryFilter = (category: string) => {
    const newCategory = category === "All" ? "" : category
    setSelectedCategory(newCategory)
    filterExercises(exercises, searchTerm, newCategory, showCustomOnly)
  }

  const handleToggleCustomOnly = () => {
    const newShowCustomOnly = !showCustomOnly
    setShowCustomOnly(newShowCustomOnly)
    filterExercises(exercises, searchTerm, selectedCategory, newShowCustomOnly)
  }

  const handleDeleteExercise = (exercise: Exercise) => {
    if (!exercise.is_custom) {
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
            loadExercises()
          } catch (error) {
            console.error("Error deleting exercise:", error)
            Alert.alert("Error", "Failed to delete exercise.")
          }
        },
      },
    ])
  }

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseItem}
      onPress={() => navigation.navigate("ExerciseDetail", { exerciseId: item.id })}
    >
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseInfo}>
          <View style={styles.exerciseNameRow}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            {item.is_custom && (
              <View style={styles.customBadge}>
                <Text style={styles.customBadgeText}>Custom</Text>
              </View>
            )}
          </View>
          <Text style={styles.exerciseCategory}>{item.category}</Text>
          <Text style={styles.exerciseDetails}>
            {item.muscle_groups} • {item.equipment || "No equipment"}
          </Text>
        </View>
        <View style={styles.exerciseActions}>
          {item.is_custom && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("AddExercise", { exerciseId: item.id })}
            >
              <Icon name="edit" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          {item.is_custom && (
            <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteExercise(item)}>
              <Icon name="delete-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="chevron-right" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
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
    searchContainer: {
      marginBottom: 16,
    },
    searchInput: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.onSurface,
      marginBottom: 12,
    },
    filtersContainer: {
      marginBottom: 16,
    },
    categoriesContainer: {
      flexDirection: "row",
      marginBottom: 12,
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
    toggleContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
    },
    toggleText: {
      fontSize: 16,
      color: colors.onSurface,
      fontWeight: "500",
    },
    exercisesList: {
      flex: 1,
    },
    exerciseItem: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    exerciseHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    exerciseInfo: {
      flex: 1,
    },
    exerciseNameRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    exerciseName: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.onSurface,
      marginRight: 8,
    },
    customBadge: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    customBadgeText: {
      fontSize: 10,
      color: colors.onPrimary,
      fontWeight: "600",
    },
    exerciseCategory: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: "500",
      marginBottom: 4,
    },
    exerciseDetails: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
    },
    exerciseActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    actionButton: {
      padding: 8,
      marginLeft: 4,
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
    resultsCount: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
      marginBottom: 8,
      textAlign: "center",
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Exercises</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddExercise")}>
            <Icon name="add" size={28} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            placeholderTextColor={colors.onSurfaceVariant}
            value={searchTerm}
            onChangeText={handleSearch}
          />
        </View>

        <View style={styles.filtersContainer}>
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
                onPress={() => handleCategoryFilter(item)}
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

          <TouchableOpacity style={styles.toggleContainer} onPress={handleToggleCustomOnly}>
            <Text style={styles.toggleText}>Show custom exercises only</Text>
            <Icon
              name={showCustomOnly ? "toggle-on" : "toggle-off"}
              size={24}
              color={showCustomOnly ? colors.primary : colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>

        {filteredExercises.length > 0 && (
          <Text style={styles.resultsCount}>
            {filteredExercises.length} exercise{filteredExercises.length !== 1 ? "s" : ""} found
          </Text>
        )}

        {filteredExercises.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <Icon name="search-off" size={64} color={colors.onSurfaceVariant} />
            <Text style={styles.emptyText}>
              {showCustomOnly
                ? "No custom exercises found.\nTap the + button to add your first custom exercise!"
                : searchTerm || selectedCategory
                  ? "No exercises match your search.\nTry adjusting your filters."
                  : "No exercises found."}
            </Text>
          </View>
        ) : (
          <FlatList
            style={styles.exercisesList}
            data={filteredExercises}
            keyExtractor={(item) => item.id?.toString() || item.name}
            renderItem={renderExerciseItem}
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

export default ExercisesScreen
