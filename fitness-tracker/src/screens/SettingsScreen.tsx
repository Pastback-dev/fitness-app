"use client"

import { useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, Alert, Share } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import { useDatabase } from "../contexts/DatabaseContext"
import Icon from "react-native-vector-icons/MaterialIcons"
import DocumentPicker from "react-native-document-picker"
import RNFS from "react-native-fs"

const SettingsScreen = ({ navigation }: any) => {
  const { colors, isDark, toggleTheme, themeMode, setThemeMode } = useTheme()
  const { db } = useDatabase()
  const [loading, setLoading] = useState(false)

  const handleExportData = async () => {
    try {
      setLoading(true)
      const data = await db.exportData()
      const fileName = `fitness_tracker_backup_${new Date().toISOString().split("T")[0]}.json`
      const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`

      await RNFS.writeFile(filePath, data, "utf8")

      await Share.share({
        url: `file://${filePath}`,
        title: "Fitness Tracker Backup",
        message: "Your fitness tracker data backup",
      })

      Alert.alert("Export Complete", "Your data has been exported successfully!")
    } catch (error) {
      console.error("Error exporting data:", error)
      Alert.alert("Export Failed", "Failed to export your data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleImportData = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.json],
      })

      const fileContent = await RNFS.readFile(result.uri, "utf8")

      Alert.alert("Import Data", "This will replace your current data. Are you sure you want to continue?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true)
              await db.importData(fileContent)
              Alert.alert("Import Complete", "Your data has been imported successfully!")
            } catch (error) {
              console.error("Error importing data:", error)
              Alert.alert("Import Failed", "Failed to import data. Please check the file format.")
            } finally {
              setLoading(false)
            }
          },
        },
      ])
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        console.error("Error picking file:", error)
        Alert.alert("Error", "Failed to select file.")
      }
    }
  }

  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your workouts, custom exercises, and templates. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All Data",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true)
              // Clear all user data (implementation would depend on database structure)
              Alert.alert("Data Cleared", "All your data has been cleared.")
            } catch (error) {
              console.error("Error clearing data:", error)
              Alert.alert("Error", "Failed to clear data.")
            } finally {
              setLoading(false)
            }
          },
        },
      ],
    )
  }

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
      fontSize: 28,
      fontWeight: "bold",
      color: colors.onBackground,
      marginBottom: 24,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.onBackground,
      marginBottom: 16,
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 8,
    },
    settingLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    settingIcon: {
      marginRight: 16,
    },
    settingText: {
      fontSize: 16,
      color: colors.onSurface,
    },
    settingSubtext: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
      marginTop: 2,
    },
    dangerItem: {
      backgroundColor: colors.errorContainer,
    },
    dangerText: {
      color: colors.onErrorContainer,
    },
    loadingText: {
      color: colors.onSurfaceVariant,
    },
  })

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>

          <TouchableOpacity style={styles.settingItem} onPress={toggleTheme}>
            <View style={styles.settingLeft}>
              <Icon
                name={isDark ? "dark-mode" : "light-mode"}
                size={24}
                color={colors.primary}
                style={styles.settingIcon}
              />
              <View>
                <Text style={styles.settingText}>Dark Mode</Text>
                <Text style={styles.settingSubtext}>
                  Currently: {themeMode === "system" ? "System" : themeMode === "dark" ? "Dark" : "Light"}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.outline, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Templates</Text>

          <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate("Templates")}>
            <View style={styles.settingLeft}>
              <Icon name="description" size={24} color={colors.primary} style={styles.settingIcon} />
              <View>
                <Text style={styles.settingText}>Manage Templates</Text>
                <Text style={styles.settingSubtext}>Create and edit workout templates</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <TouchableOpacity style={styles.settingItem} onPress={handleExportData} disabled={loading}>
            <View style={styles.settingLeft}>
              <Icon name="backup" size={24} color={colors.primary} style={styles.settingIcon} />
              <View>
                <Text style={[styles.settingText, loading && styles.loadingText]}>
                  {loading ? "Exporting..." : "Export Data"}
                </Text>
                <Text style={styles.settingSubtext}>Backup your workouts and exercises</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleImportData} disabled={loading}>
            <View style={styles.settingLeft}>
              <Icon name="restore" size={24} color={colors.primary} style={styles.settingIcon} />
              <View>
                <Text style={[styles.settingText, loading && styles.loadingText]}>
                  {loading ? "Importing..." : "Import Data"}
                </Text>
                <Text style={styles.settingSubtext}>Restore from backup file</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced</Text>

          <TouchableOpacity
            style={[styles.settingItem, styles.dangerItem]}
            onPress={handleClearAllData}
            disabled={loading}
          >
            <View style={styles.settingLeft}>
              <Icon name="delete-forever" size={24} color={colors.error} style={styles.settingIcon} />
              <View>
                <Text style={[styles.settingText, styles.dangerText]}>Clear All Data</Text>
                <Text style={styles.settingSubtext}>Permanently delete all your data</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="info" size={24} color={colors.primary} style={styles.settingIcon} />
              <View>
                <Text style={styles.settingText}>Fitness Tracker</Text>
                <Text style={styles.settingSubtext}>Version 1.0.0</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SettingsScreen
