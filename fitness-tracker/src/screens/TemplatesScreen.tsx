"use client"

import { useState, useCallback } from "react"
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, RefreshControl, Alert } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import { useDatabase } from "../contexts/DatabaseContext"
import { useFocusEffect } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialIcons"
import type { Template } from "../types/database"

const TemplatesScreen = ({ navigation }: any) => {
  const { colors } = useTheme()
  const { db } = useDatabase()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadTemplates = async () => {
    try {
      const templateList = await db.getTemplates()
      setTemplates(templateList)
    } catch (error) {
      console.error("Error loading templates:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadTemplates()
    }, []),
  )

  const handleRefresh = () => {
    setRefreshing(true)
    loadTemplates()
  }

  const handleDeleteTemplate = (template: Template) => {
    Alert.alert("Delete Template", `Are you sure you want to delete "${template.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await db.deleteTemplate(template.id!)
            loadTemplates()
          } catch (error) {
            console.error("Error deleting template:", error)
            Alert.alert("Error", "Failed to delete template.")
          }
        },
      },
    ])
  }

  const handleUseTemplate = async (template: Template) => {
    try {
      const templateWithExercises = await db.getTemplateById(template.id!)
      if (templateWithExercises) {
        navigation.navigate("AddWorkout", { template: templateWithExercises })
      }
    } catch (error) {
      console.error("Error loading template:", error)
      Alert.alert("Error", "Failed to load template.")
    }
  }

  const renderTemplateItem = ({ item }: { item: Template }) => (
    <View style={styles.templateItem}>
      <View style={styles.templateHeader}>
        <View style={styles.templateInfo}>
          <Text style={styles.templateName}>{item.name}</Text>
          {item.description && <Text style={styles.templateDescription}>{item.description}</Text>}
          <Text style={styles.templateDate}>Created {new Date(item.created_at!).toLocaleDateString()}</Text>
        </View>
        <View style={styles.templateActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleUseTemplate(item)}>
            <Icon name="play-arrow" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("TemplateDetail", { templateId: item.id })}
          >
            <Icon name="visibility" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteTemplate(item)}>
            <Icon name="delete-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
    templatesList: {
      flex: 1,
    },
    templateItem: {
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
    templateHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    templateInfo: {
      flex: 1,
    },
    templateName: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.onSurface,
      marginBottom: 4,
    },
    templateDescription: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
      marginBottom: 4,
    },
    templateDate: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
    },
    templateActions: {
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
  })

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Templates</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("CreateTemplate")}>
            <Icon name="add" size={28} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>

        {templates.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <Icon name="description" size={64} color={colors.onSurfaceVariant} />
            <Text style={styles.emptyText}>
              No workout templates yet.{"\n"}Create templates to quickly start your favorite workouts!
            </Text>
          </View>
        ) : (
          <FlatList
            style={styles.templatesList}
            data={templates}
            keyExtractor={(item) => item.id?.toString() || ""}
            renderItem={renderTemplateItem}
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

export default TemplatesScreen
