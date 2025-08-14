"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useTheme } from "../contexts/ThemeContext"
import type { Set } from "../types/database"

interface SetLoggerProps {
  sets: Set[]
  exerciseType: "Strength" | "Cardio" | "Flexibility" | "Sports"
  onAddSet: (set: Omit<Set, "id" | "workout_exercise_id">) => void
  onUpdateSet: (setId: number, set: Partial<Set>) => void
  onDeleteSet: (setId: number) => void
}

const SetLogger: React.FC<SetLoggerProps> = ({ sets, exerciseType, onAddSet, onUpdateSet, onDeleteSet }) => {
  const { colors } = useTheme()
  const [newSet, setNewSet] = useState<Partial<Set>>({
    reps: undefined,
    weight: undefined,
    distance: undefined,
    duration: undefined,
    rest_time: undefined,
  })

  const handleAddSet = () => {
    if (exerciseType === "Strength" && (!newSet.reps || !newSet.weight)) {
      Alert.alert("Missing Data", "Please enter both reps and weight for strength exercises.")
      return
    }

    if (exerciseType === "Cardio" && !newSet.duration && !newSet.distance) {
      Alert.alert("Missing Data", "Please enter either duration or distance for cardio exercises.")
      return
    }

    const setToAdd: Omit<Set, "id" | "workout_exercise_id"> = {
      set_number: sets.length + 1,
      reps: newSet.reps,
      weight: newSet.weight,
      distance: newSet.distance,
      duration: newSet.duration,
      rest_time: newSet.rest_time,
      notes: newSet.notes,
    }

    onAddSet(setToAdd)
    setNewSet({
      reps: exerciseType === "Strength" ? newSet.reps : undefined,
      weight: exerciseType === "Strength" ? newSet.weight : undefined,
      distance: undefined,
      duration: undefined,
      rest_time: newSet.rest_time,
    })
  }

  const handleDeleteSet = (setId: number) => {
    Alert.alert("Delete Set", "Are you sure you want to delete this set?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDeleteSet(setId) },
    ])
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return ""
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.onSurface,
    },
    setsCount: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
    },
    setItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    setNumber: {
      width: 30,
      fontSize: 14,
      fontWeight: "600",
      color: colors.onSurface,
      textAlign: "center",
    },
    setData: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-around",
      paddingHorizontal: 16,
    },
    setDataText: {
      fontSize: 14,
      color: colors.onSurface,
      textAlign: "center",
    },
    deleteButton: {
      padding: 4,
    },
    newSetContainer: {
      marginTop: 16,
      padding: 16,
      backgroundColor: colors.background,
      borderRadius: 8,
    },
    newSetTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.onBackground,
      marginBottom: 12,
    },
    inputRow: {
      flexDirection: "row",
      marginBottom: 12,
    },
    inputGroup: {
      flex: 1,
      marginHorizontal: 4,
    },
    inputLabel: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
      marginBottom: 4,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.onSurface,
      textAlign: "center",
    },
    addButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 12,
      alignItems: "center",
      marginTop: 8,
    },
    addButtonText: {
      color: colors.onPrimary,
      fontSize: 16,
      fontWeight: "600",
    },
    headerLabels: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      marginBottom: 8,
    },
    headerLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.onSurfaceVariant,
      textAlign: "center",
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sets</Text>
        <Text style={styles.setsCount}>{sets.length} sets</Text>
      </View>

      {sets.length > 0 && (
        <>
          <View style={styles.headerLabels}>
            <Text style={[styles.headerLabel, { width: 30 }]}>Set</Text>
            <View style={styles.setData}>
              {exerciseType === "Strength" && (
                <>
                  <Text style={styles.headerLabel}>Weight</Text>
                  <Text style={styles.headerLabel}>Reps</Text>
                </>
              )}
              {exerciseType === "Cardio" && (
                <>
                  <Text style={styles.headerLabel}>Distance</Text>
                  <Text style={styles.headerLabel}>Duration</Text>
                </>
              )}
            </View>
            <View style={{ width: 32 }} />
          </View>

          {sets.map((set, index) => (
            <View key={set.id || index} style={styles.setItem}>
              <Text style={styles.setNumber}>{set.set_number}</Text>
              <View style={styles.setData}>
                {exerciseType === "Strength" && (
                  <>
                    <Text style={styles.setDataText}>{set.weight || "-"} lbs</Text>
                    <Text style={styles.setDataText}>{set.reps || "-"}</Text>
                  </>
                )}
                {exerciseType === "Cardio" && (
                  <>
                    <Text style={styles.setDataText}>{set.distance ? `${set.distance}m` : "-"}</Text>
                    <Text style={styles.setDataText}>{set.duration ? formatDuration(set.duration) : "-"}</Text>
                  </>
                )}
              </View>
              <TouchableOpacity style={styles.deleteButton} onPress={() => set.id && handleDeleteSet(set.id)}>
                <Icon name="delete-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      <View style={styles.newSetContainer}>
        <Text style={styles.newSetTitle}>Add New Set</Text>

        <View style={styles.inputRow}>
          {exerciseType === "Strength" && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight (lbs)</Text>
                <TextInput
                  style={styles.input}
                  value={newSet.weight?.toString() || ""}
                  onChangeText={(text) => setNewSet({ ...newSet, weight: Number.parseFloat(text) || undefined })}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.onSurfaceVariant}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reps</Text>
                <TextInput
                  style={styles.input}
                  value={newSet.reps?.toString() || ""}
                  onChangeText={(text) => setNewSet({ ...newSet, reps: Number.parseInt(text) || undefined })}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.onSurfaceVariant}
                />
              </View>
            </>
          )}

          {exerciseType === "Cardio" && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Distance (m)</Text>
                <TextInput
                  style={styles.input}
                  value={newSet.distance?.toString() || ""}
                  onChangeText={(text) => setNewSet({ ...newSet, distance: Number.parseFloat(text) || undefined })}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.onSurfaceVariant}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration (min)</Text>
                <TextInput
                  style={styles.input}
                  value={newSet.duration ? (newSet.duration / 60).toString() : ""}
                  onChangeText={(text) => setNewSet({ ...newSet, duration: (Number.parseFloat(text) || 0) * 60 })}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.onSurfaceVariant}
                />
              </View>
            </>
          )}
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Rest Time (min)</Text>
            <TextInput
              style={styles.input}
              value={newSet.rest_time ? (newSet.rest_time / 60).toString() : ""}
              onChangeText={(text) => setNewSet({ ...newSet, rest_time: (Number.parseFloat(text) || 0) * 60 })}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.onSurfaceVariant}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddSet}>
          <Text style={styles.addButtonText}>Add Set</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default SetLogger
