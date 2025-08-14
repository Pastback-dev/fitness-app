"use client"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { StatusBar } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"

import { ThemeProvider, useTheme } from "./src/contexts/ThemeContext"
import { DatabaseProvider } from "./src/contexts/DatabaseContext"

// Screens
import DashboardScreen from "./src/screens/DashboardScreen"
import WorkoutsScreen from "./src/screens/WorkoutsScreen"
import ExercisesScreen from "./src/screens/ExercisesScreen"
import StatisticsScreen from "./src/screens/StatisticsScreen"
import SettingsScreen from "./src/screens/SettingsScreen"
import WorkoutDetailScreen from "./src/screens/WorkoutDetailScreen"
import AddWorkoutScreen from "./src/screens/AddWorkoutScreen"
import AddExerciseScreen from "./src/screens/AddExerciseScreen"
import ExerciseDetailScreen from "./src/screens/ExerciseDetailScreen"
import TemplatesScreen from "./src/screens/TemplatesScreen"
import CreateTemplateScreen from "./src/screens/CreateTemplateScreen"

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

const WorkoutsStack = () => {
  const { colors } = useTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.onSurface,
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen name="WorkoutsList" component={WorkoutsScreen} options={{ title: "Workouts" }} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} options={{ title: "Workout Details" }} />
      <Stack.Screen name="AddWorkout" component={AddWorkoutScreen} options={{ title: "New Workout" }} />
    </Stack.Navigator>
  )
}

const ExercisesStack = () => {
  const { colors } = useTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.onSurface,
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen name="ExercisesList" component={ExercisesScreen} options={{ title: "Exercises" }} />
      <Stack.Screen name="AddExercise" component={AddExerciseScreen} options={{ title: "Add Exercise" }} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ title: "Exercise Details" }} />
    </Stack.Navigator>
  )
}

const SettingsStack = () => {
  const { colors } = useTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.onSurface,
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen name="SettingsList" component={SettingsScreen} options={{ title: "Settings" }} />
      <Stack.Screen name="Templates" component={TemplatesScreen} options={{ title: "Workout Templates" }} />
      <Stack.Screen name="CreateTemplate" component={CreateTemplateScreen} options={{ title: "Create Template" }} />
    </Stack.Navigator>
  )
}

const MainTabs = () => {
  const { colors, isDark } = useTheme()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = ""

          switch (route.name) {
            case "Dashboard":
              iconName = "dashboard"
              break
            case "Workouts":
              iconName = "fitness-center"
              break
            case "Exercises":
              iconName = "list"
              break
            case "Statistics":
              iconName = "bar-chart"
              break
            case "Settings":
              iconName = "settings"
              break
          }

          return <Icon name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.outline,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Workouts" component={WorkoutsStack} />
      <Tab.Screen name="Exercises" component={ExercisesStack} />
      <Tab.Screen name="Statistics" component={StatisticsScreen} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  )
}

const AppContent = () => {
  const { isDark } = useTheme()

  return (
    <>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
    </>
  )
}

const App = () => {
  return (
    <ThemeProvider>
      <DatabaseProvider>
        <AppContent />
      </DatabaseProvider>
    </ThemeProvider>
  )
}

export default App
