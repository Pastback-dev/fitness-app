"use client"

import type React from "react"
import { View, Text, StyleSheet, Dimensions } from "react-native"
import { BarChart } from "react-native-chart-kit"
import { useTheme } from "../../contexts/ThemeContext"

interface VolumeChartProps {
  data: {
    labels: string[]
    datasets: {
      data: number[]
    }[]
  }
}

const VolumeChart: React.FC<VolumeChartProps> = ({ data }) => {
  const { colors, isDark } = useTheme()
  const screenWidth = Dimensions.get("window").width

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(${isDark ? "208, 188, 255" : "103, 80, 164"}, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(${isDark ? "230, 225, 229" : "28, 27, 31"}, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: colors.outline,
      strokeWidth: 1,
    },
  }

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.onSurface,
      marginBottom: 16,
      textAlign: "center",
    },
    chartContainer: {
      alignItems: "center",
    },
  })

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Volume (lbs)</Text>
      <View style={styles.chartContainer}>
        <BarChart
          data={data}
          width={screenWidth - 64}
          height={220}
          chartConfig={chartConfig}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
          showValuesOnTopOfBars
        />
      </View>
    </View>
  )
}

export default VolumeChart
