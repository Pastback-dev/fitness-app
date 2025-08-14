export interface Exercise {
  id?: number
  name: string
  category: "Strength" | "Cardio" | "Flexibility" | "Sports"
  muscle_groups: string
  equipment?: string
  instructions?: string
  is_custom: boolean
  created_at?: string
}

export interface Workout {
  id?: number
  name: string
  date: string
  duration?: number // in minutes
  notes?: string
  created_at?: string
}

export interface WorkoutExercise {
  id?: number
  workout_id: number
  exercise_id: number
  order_index: number
  exercise?: Exercise
}

export interface Set {
  id?: number
  workout_exercise_id: number
  set_number: number
  reps?: number
  weight?: number
  distance?: number // for cardio in meters
  duration?: number // for cardio in seconds
  rest_time?: number // in seconds
  notes?: string
}

export interface Template {
  id?: number
  name: string
  description?: string
  created_at?: string
}

export interface TemplateExercise {
  id?: number
  template_id: number
  exercise_id: number
  order_index: number
  default_sets?: number
  default_reps?: number
  default_weight?: number
  exercise?: Exercise
}

export interface WorkoutWithExercises extends Workout {
  exercises: (WorkoutExercise & {
    exercise: Exercise
    sets: Set[]
  })[]
}

export interface TemplateWithExercises extends Template {
  exercises: (TemplateExercise & {
    exercise: Exercise
  })[]
}

export interface WorkoutStats {
  totalWorkouts: number
  totalVolume: number // total weight lifted
  totalDuration: number // total workout time in minutes
  averageDuration: number
  workoutsThisWeek: number
  workoutsThisMonth: number
}

export interface ExerciseProgress {
  exercise_id: number
  exercise_name: string
  max_weight: number
  max_reps: number
  total_volume: number
  last_performed: string
  progress_data: {
    date: string
    max_weight: number
    total_volume: number
  }[]
}

export interface PersonalRecord {
  id?: number
  exercise_id: number
  exercise_name: string
  record_type: "weight" | "reps" | "volume" | "distance" | "duration"
  value: number
  date: string
  workout_id: number
}
