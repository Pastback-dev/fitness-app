"use client"

import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { useTheme } from "../contexts/ThemeContext"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: string
  onPress?: () => void
  trend?: "up" | "down" | "neutral"
  trendValue?: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, onPress, trend, trendValue }) => {
  const { colors } = useTheme()

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "#4CAF50"
      case "down":
        return "#F44336"
      default:
        return colors.onSurfaceVariant
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return "trending-up"
      case "down":
        return "trending-down"
      default:
        return "trending-flat"
    }
  }

  const styles = StyleSheet.create({
    container: {
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
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primaryContainer,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
      fontWeight: "500",
    },
    value: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.onSurface,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
    },
    trendContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },
    trendText: {
      fontSize: 12,
      fontWeight: "500",
      marginLeft: 4,
    },
  })

  const CardContent = (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon name={icon} size={20} color={colors.onPrimaryContainer} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
      <Text style={styles.value}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {trend && trendValue && (
        <View style={styles.trendContainer}>
          <Icon name={getTrendIcon()} size={16} color={getTrendColor()} />
          <Text style={[styles.trendText, { color: getTrendColor() }]}>{trendValue}</Text>
        </View>
      )}
    </View>
  )

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{CardContent}</TouchableOpacity>
  }

  return CardContent
}

export default StatCard
