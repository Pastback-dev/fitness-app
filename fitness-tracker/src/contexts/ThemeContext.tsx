"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useColorScheme } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface Colors {
  primary: string
  primaryVariant: string
  secondary: string
  background: string
  surface: string
  error: string
  onPrimary: string
  onSecondary: string
  onBackground: string
  onSurface: string
  onError: string
  outline: string
  onSurfaceVariant: string
  surfaceVariant: string
}

interface ThemeContextType {
  isDark: boolean
  colors: Colors
  toggleTheme: () => void
  setThemeMode: (mode: "light" | "dark" | "system") => void
  themeMode: "light" | "dark" | "system"
}

const lightColors: Colors = {
  primary: "#6750A4",
  primaryVariant: "#4F378B",
  secondary: "#625B71",
  background: "#FFFBFE",
  surface: "#FFFBFE",
  error: "#BA1A1A",
  onPrimary: "#FFFFFF",
  onSecondary: "#FFFFFF",
  onBackground: "#1C1B1F",
  onSurface: "#1C1B1F",
  onError: "#FFFFFF",
  outline: "#79747E",
  onSurfaceVariant: "#49454F",
  surfaceVariant: "#E7E0EC",
}

const darkColors: Colors = {
  primary: "#D0BCFF",
  primaryVariant: "#6750A4",
  secondary: "#CCC2DC",
  background: "#1C1B1F",
  surface: "#1C1B1F",
  error: "#F2B8B5",
  onPrimary: "#371E73",
  onSecondary: "#332D41",
  onBackground: "#E6E1E5",
  onSurface: "#E6E1E5",
  onError: "#601410",
  outline: "#938F99",
  onSurfaceVariant: "#CAC4D0",
  surfaceVariant: "#49454F",
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme()
  const [themeMode, setThemeModeState] = useState<"light" | "dark" | "system">("system")

  const isDark = themeMode === "system" ? systemColorScheme === "dark" : themeMode === "dark"

  const colors = isDark ? darkColors : lightColors

  useEffect(() => {
    loadThemePreference()
  }, [])

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("themeMode")
      if (savedTheme) {
        setThemeModeState(savedTheme as "light" | "dark" | "system")
      }
    } catch (error) {
      console.error("Error loading theme preference:", error)
    }
  }

  const setThemeMode = async (mode: "light" | "dark" | "system") => {
    try {
      setThemeModeState(mode)
      await AsyncStorage.setItem("themeMode", mode)
    } catch (error) {
      console.error("Error saving theme preference:", error)
    }
  }

  const toggleTheme = () => {
    const newMode = isDark ? "light" : "dark"
    setThemeMode(newMode)
  }

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        colors,
        toggleTheme,
        setThemeMode,
        themeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
