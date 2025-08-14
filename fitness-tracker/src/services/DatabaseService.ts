import SQLite from "react-native-sqlite-storage"
import type {
  Exercise,
  Workout,
  WorkoutExercise,
  Set,
  Template,
  TemplateExercise,
  WorkoutWithExercises,
  TemplateWithExercises,
  WorkoutStats,
  ExerciseProgress,
  PersonalRecord,
} from "../types/database"

SQLite.DEBUG(true)
SQLite.enablePromise(true)

export class DatabaseService {
  private database: SQLite.SQLiteDatabase | null = null

  async initDatabase(): Promise<void> {
    try {
      this.database = await SQLite.openDatabase({
        name: "FitnessTracker.db",
        location: "default",
      })

      await this.createTables()
      await this.seedDefaultExercises()

      console.log("Database initialized successfully")
    } catch (error) {
      console.error("Database initialization failed:", error)
    }
  }

  private async createTables(): Promise<void> {
    if (!this.database) return

    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        muscle_groups TEXT NOT NULL,
        equipment TEXT,
        instructions TEXT,
        is_custom INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        duration INTEGER,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS workout_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        order_index INTEGER NOT NULL,
        FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises (id)
      );

      CREATE TABLE IF NOT EXISTS sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_exercise_id INTEGER NOT NULL,
        set_number INTEGER NOT NULL,
        reps INTEGER,
        weight REAL,
        distance REAL,
        duration INTEGER,
        rest_time INTEGER,
        notes TEXT,
        FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS template_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        order_index INTEGER NOT NULL,
        default_sets INTEGER,
        default_reps INTEGER,
        default_weight REAL,
        FOREIGN KEY (template_id) REFERENCES templates (id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises (id)
      );

      CREATE TABLE IF NOT EXISTS personal_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exercise_id INTEGER NOT NULL,
        record_type TEXT NOT NULL,
        value REAL NOT NULL,
        date TEXT NOT NULL,
        workout_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (exercise_id) REFERENCES exercises (id),
        FOREIGN KEY (workout_id) REFERENCES workouts (id)
      );

      CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
      CREATE INDEX IF NOT EXISTS idx_sets_workout_exercise ON sets(workout_exercise_id);
      CREATE INDEX IF NOT EXISTS idx_personal_records_exercise ON personal_records(exercise_id);
    `

    await this.database.executeSql(createTablesSQL)
  }

  private async seedDefaultExercises(): Promise<void> {
    if (!this.database) return

    // Check if exercises already exist
    const [result] = await this.database.executeSql("SELECT COUNT(*) as count FROM exercises WHERE is_custom = 0")
    if (result.rows.item(0).count > 0) return

    const defaultExercises = [
      // Chest
      { name: "Bench Press", category: "Strength", muscle_groups: "Chest,Shoulders,Triceps", equipment: "Barbell" },
      {
        name: "Incline Bench Press",
        category: "Strength",
        muscle_groups: "Chest,Shoulders,Triceps",
        equipment: "Barbell",
      },
      {
        name: "Dumbbell Press",
        category: "Strength",
        muscle_groups: "Chest,Shoulders,Triceps",
        equipment: "Dumbbells",
      },
      { name: "Push-ups", category: "Strength", muscle_groups: "Chest,Shoulders,Triceps", equipment: "Bodyweight" },

      // Back
      { name: "Pull-ups", category: "Strength", muscle_groups: "Back,Biceps", equipment: "Pull-up Bar" },
      { name: "Deadlift", category: "Strength", muscle_groups: "Back,Glutes,Hamstrings", equipment: "Barbell" },
      { name: "Bent-over Row", category: "Strength", muscle_groups: "Back,Biceps", equipment: "Barbell" },
      { name: "Lat Pulldown", category: "Strength", muscle_groups: "Back,Biceps", equipment: "Cable Machine" },

      // Legs
      { name: "Squat", category: "Strength", muscle_groups: "Quadriceps,Glutes,Hamstrings", equipment: "Barbell" },
      { name: "Leg Press", category: "Strength", muscle_groups: "Quadriceps,Glutes", equipment: "Machine" },
      { name: "Lunges", category: "Strength", muscle_groups: "Quadriceps,Glutes,Hamstrings", equipment: "Dumbbells" },
      { name: "Calf Raises", category: "Strength", muscle_groups: "Calves", equipment: "Dumbbells" },

      // Shoulders
      { name: "Overhead Press", category: "Strength", muscle_groups: "Shoulders,Triceps", equipment: "Barbell" },
      { name: "Lateral Raises", category: "Strength", muscle_groups: "Shoulders", equipment: "Dumbbells" },
      { name: "Rear Delt Flyes", category: "Strength", muscle_groups: "Shoulders", equipment: "Dumbbells" },

      // Arms
      { name: "Bicep Curls", category: "Strength", muscle_groups: "Biceps", equipment: "Dumbbells" },
      { name: "Tricep Dips", category: "Strength", muscle_groups: "Triceps", equipment: "Bodyweight" },
      { name: "Hammer Curls", category: "Strength", muscle_groups: "Biceps,Forearms", equipment: "Dumbbells" },

      // Cardio
      { name: "Running", category: "Cardio", muscle_groups: "Full Body", equipment: "None" },
      { name: "Cycling", category: "Cardio", muscle_groups: "Legs,Glutes", equipment: "Bike" },
      { name: "Rowing", category: "Cardio", muscle_groups: "Full Body", equipment: "Rowing Machine" },
    ]

    for (const exercise of defaultExercises) {
      await this.database.executeSql(
        "INSERT INTO exercises (name, category, muscle_groups, equipment, is_custom) VALUES (?, ?, ?, ?, 0)",
        [exercise.name, exercise.category, exercise.muscle_groups, exercise.equipment],
      )
    }
  }

  async getExercises(searchTerm?: string, category?: string): Promise<Exercise[]> {
    if (!this.database) return []

    let query = "SELECT * FROM exercises WHERE 1=1"
    const params: any[] = []

    if (searchTerm) {
      query += " AND (name LIKE ? OR muscle_groups LIKE ?)"
      params.push(`%${searchTerm}%`, `%${searchTerm}%`)
    }

    if (category) {
      query += " AND category = ?"
      params.push(category)
    }

    query += " ORDER BY is_custom ASC, name ASC"

    const [result] = await this.database.executeSql(query, params)
    const exercises: Exercise[] = []

    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i)
      exercises.push({
        ...row,
        is_custom: Boolean(row.is_custom),
      })
    }

    return exercises
  }

  async getExerciseById(id: number): Promise<Exercise | null> {
    if (!this.database) return null

    const [result] = await this.database.executeSql("SELECT * FROM exercises WHERE id = ?", [id])

    if (result.rows.length === 0) return null

    const row = result.rows.item(0)
    return {
      ...row,
      is_custom: Boolean(row.is_custom),
    }
  }

  async createExercise(exercise: Omit<Exercise, "id" | "created_at">): Promise<number> {
    if (!this.database) throw new Error("Database not initialized")

    const [result] = await this.database.executeSql(
      "INSERT INTO exercises (name, category, muscle_groups, equipment, instructions, is_custom) VALUES (?, ?, ?, ?, ?, ?)",
      [
        exercise.name,
        exercise.category,
        exercise.muscle_groups,
        exercise.equipment || null,
        exercise.instructions || null,
        exercise.is_custom ? 1 : 0,
      ],
    )

    return result.insertId
  }

  async updateExercise(id: number, exercise: Partial<Exercise>): Promise<void> {
    if (!this.database) throw new Error("Database not initialized")

    const fields: string[] = []
    const values: any[] = []

    Object.entries(exercise).forEach(([key, value]) => {
      if (key !== "id" && key !== "created_at" && value !== undefined) {
        fields.push(`${key} = ?`)
        values.push(key === "is_custom" ? (value ? 1 : 0) : value)
      }
    })

    if (fields.length === 0) return

    values.push(id)
    await this.database.executeSql(`UPDATE exercises SET ${fields.join(", ")} WHERE id = ?`, values)
  }

  async deleteExercise(id: number): Promise<void> {
    if (!this.database) throw new Error("Database not initialized")

    await this.database.executeSql("DELETE FROM exercises WHERE id = ? AND is_custom = 1", [id])
  }

  async getWorkouts(limit?: number, offset?: number): Promise<Workout[]> {
    if (!this.database) return []

    let query = "SELECT * FROM workouts ORDER BY date DESC, created_at DESC"
    const params: any[] = []

    if (limit) {
      query += " LIMIT ?"
      params.push(limit)

      if (offset) {
        query += " OFFSET ?"
        params.push(offset)
      }
    }

    const [result] = await this.database.executeSql(query, params)
    const workouts: Workout[] = []

    for (let i = 0; i < result.rows.length; i++) {
      workouts.push(result.rows.item(i))
    }

    return workouts
  }

  async getWorkoutById(id: number): Promise<WorkoutWithExercises | null> {
    if (!this.database) return null

    // Get workout
    const [workoutResult] = await this.database.executeSql("SELECT * FROM workouts WHERE id = ?", [id])

    if (workoutResult.rows.length === 0) return null

    const workout = workoutResult.rows.item(0)

    // Get workout exercises with exercise details
    const [exercisesResult] = await this.database.executeSql(
      `
      SELECT we.*, e.name, e.category, e.muscle_groups, e.equipment, e.instructions, e.is_custom
      FROM workout_exercises we
      JOIN exercises e ON we.exercise_id = e.id
      WHERE we.workout_id = ?
      ORDER BY we.order_index
    `,
      [id],
    )

    const exercises: (WorkoutExercise & { exercise: Exercise; sets: Set[] })[] = []

    for (let i = 0; i < exercisesResult.rows.length; i++) {
      const row = exercisesResult.rows.item(i)

      // Get sets for this workout exercise
      const [setsResult] = await this.database.executeSql(
        "SELECT * FROM sets WHERE workout_exercise_id = ? ORDER BY set_number",
        [row.id],
      )

      const sets: Set[] = []
      for (let j = 0; j < setsResult.rows.length; j++) {
        sets.push(setsResult.rows.item(j))
      }

      exercises.push({
        id: row.id,
        workout_id: row.workout_id,
        exercise_id: row.exercise_id,
        order_index: row.order_index,
        exercise: {
          id: row.exercise_id,
          name: row.name,
          category: row.category,
          muscle_groups: row.muscle_groups,
          equipment: row.equipment,
          instructions: row.instructions,
          is_custom: Boolean(row.is_custom),
        },
        sets,
      })
    }

    return {
      ...workout,
      exercises,
    }
  }

  async createWorkout(workout: Omit<Workout, "id" | "created_at">): Promise<number> {
    if (!this.database) throw new Error("Database not initialized")

    const [result] = await this.database.executeSql(
      "INSERT INTO workouts (name, date, duration, notes) VALUES (?, ?, ?, ?)",
      [workout.name, workout.date, workout.duration || null, workout.notes || null],
    )

    return result.insertId
  }

  async updateWorkout(id: number, workout: Partial<Workout>): Promise<void> {
    if (!this.database) throw new Error("Database not initialized")

    const fields: string[] = []
    const values: any[] = []

    Object.entries(workout).forEach(([key, value]) => {
      if (key !== "id" && key !== "created_at" && value !== undefined) {
        fields.push(`${key} = ?`)
        values.push(value)
      }
    })

    if (fields.length === 0) return

    values.push(id)
    await this.database.executeSql(`UPDATE workouts SET ${fields.join(", ")} WHERE id = ?`, values)
  }

  async deleteWorkout(id: number): Promise<void> {
    if (!this.database) throw new Error("Database not initialized")

    await this.database.executeSql("DELETE FROM workouts WHERE id = ?", [id])
  }

  async addExerciseToWorkout(workoutExercise: Omit<WorkoutExercise, "id">): Promise<number> {
    if (!this.database) throw new Error("Database not initialized")

    const [result] = await this.database.executeSql(
      "INSERT INTO workout_exercises (workout_id, exercise_id, order_index) VALUES (?, ?, ?)",
      [workoutExercise.workout_id, workoutExercise.exercise_id, workoutExercise.order_index],
    )

    return result.insertId
  }

  async removeExerciseFromWorkout(workoutExerciseId: number): Promise<void> {
    if (!this.database) throw new Error("Database not initialized")

    await this.database.executeSql("DELETE FROM workout_exercises WHERE id = ?", [workoutExerciseId])
  }

  async addSet(set: Omit<Set, "id">): Promise<number> {
    if (!this.database) throw new Error("Database not initialized")

    const [result] = await this.database.executeSql(
      "INSERT INTO sets (workout_exercise_id, set_number, reps, weight, distance, duration, rest_time, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        set.workout_exercise_id,
        set.set_number,
        set.reps || null,
        set.weight || null,
        set.distance || null,
        set.duration || null,
        set.rest_time || null,
        set.notes || null,
      ],
    )

    return result.insertId
  }

  async updateSet(id: number, set: Partial<Set>): Promise<void> {
    if (!this.database) throw new Error("Database not initialized")

    const fields: string[] = []
    const values: any[] = []

    Object.entries(set).forEach(([key, value]) => {
      if (key !== "id" && value !== undefined) {
        fields.push(`${key} = ?`)
        values.push(value)
      }
    })

    if (fields.length === 0) return

    values.push(id)
    await this.database.executeSql(`UPDATE sets SET ${fields.join(", ")} WHERE id = ?`, values)
  }

  async deleteSet(id: number): Promise<void> {
    if (!this.database) throw new Error("Database not initialized")

    await this.database.executeSql("DELETE FROM sets WHERE id = ?", [id])
  }

  async getTemplates(): Promise<Template[]> {
    if (!this.database) return []

    const [result] = await this.database.executeSql("SELECT * FROM templates ORDER BY name ASC")

    const templates: Template[] = []
    for (let i = 0; i < result.rows.length; i++) {
      templates.push(result.rows.item(i))
    }

    return templates
  }

  async getTemplateById(id: number): Promise<TemplateWithExercises | null> {
    if (!this.database) return null

    const [templateResult] = await this.database.executeSql("SELECT * FROM templates WHERE id = ?", [id])

    if (templateResult.rows.length === 0) return null

    const template = templateResult.rows.item(0)

    const [exercisesResult] = await this.database.executeSql(
      `
      SELECT te.*, e.name, e.category, e.muscle_groups, e.equipment, e.instructions, e.is_custom
      FROM template_exercises te
      JOIN exercises e ON te.exercise_id = e.id
      WHERE te.template_id = ?
      ORDER BY te.order_index
    `,
      [id],
    )

    const exercises: (TemplateExercise & { exercise: Exercise })[] = []

    for (let i = 0; i < exercisesResult.rows.length; i++) {
      const row = exercisesResult.rows.item(i)
      exercises.push({
        id: row.id,
        template_id: row.template_id,
        exercise_id: row.exercise_id,
        order_index: row.order_index,
        default_sets: row.default_sets,
        default_reps: row.default_reps,
        default_weight: row.default_weight,
        exercise: {
          id: row.exercise_id,
          name: row.name,
          category: row.category,
          muscle_groups: row.muscle_groups,
          equipment: row.equipment,
          instructions: row.instructions,
          is_custom: Boolean(row.is_custom),
        },
      })
    }

    return {
      ...template,
      exercises,
    }
  }

  async createTemplate(template: Omit<Template, "id" | "created_at">): Promise<number> {
    if (!this.database) throw new Error("Database not initialized")

    const [result] = await this.database.executeSql("INSERT INTO templates (name, description) VALUES (?, ?)", [
      template.name,
      template.description || null,
    ])

    return result.insertId
  }

  async deleteTemplate(id: number): Promise<void> {
    if (!this.database) throw new Error("Database not initialized")

    await this.database.executeSql("DELETE FROM templates WHERE id = ?", [id])
  }

  async getWorkoutStats(): Promise<WorkoutStats> {
    if (!this.database) {
      return {
        totalWorkouts: 0,
        totalVolume: 0,
        totalDuration: 0,
        averageDuration: 0,
        workoutsThisWeek: 0,
        workoutsThisMonth: 0,
      }
    }

    const now = new Date()
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Total workouts
    const [totalResult] = await this.database.executeSql("SELECT COUNT(*) as count FROM workouts")
    const totalWorkouts = totalResult.rows.item(0).count

    // Total volume (sum of weight * reps for all sets)
    const [volumeResult] = await this.database.executeSql(`
      SELECT SUM(weight * reps) as total_volume
      FROM sets
      WHERE weight IS NOT NULL AND reps IS NOT NULL
    `)
    const totalVolume = volumeResult.rows.item(0).total_volume || 0

    // Total and average duration
    const [durationResult] = await this.database.executeSql(`
      SELECT SUM(duration) as total_duration, AVG(duration) as avg_duration
      FROM workouts
      WHERE duration IS NOT NULL
    `)
    const totalDuration = durationResult.rows.item(0).total_duration || 0
    const averageDuration = durationResult.rows.item(0).avg_duration || 0

    // Workouts this week
    const [weekResult] = await this.database.executeSql("SELECT COUNT(*) as count FROM workouts WHERE date >= ?", [
      weekStart.toISOString().split("T")[0],
    ])
    const workoutsThisWeek = weekResult.rows.item(0).count

    // Workouts this month
    const [monthResult] = await this.database.executeSql("SELECT COUNT(*) as count FROM workouts WHERE date >= ?", [
      monthStart.toISOString().split("T")[0],
    ])
    const workoutsThisMonth = monthResult.rows.item(0).count

    return {
      totalWorkouts,
      totalVolume,
      totalDuration,
      averageDuration,
      workoutsThisWeek,
      workoutsThisMonth,
    }
  }

  async getExerciseProgress(exerciseId: number, days = 90): Promise<ExerciseProgress | null> {
    if (!this.database) return null

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const [progressResult] = await this.database.executeSql(
      `
      SELECT 
        e.id as exercise_id,
        e.name as exercise_name,
        MAX(s.weight) as max_weight,
        MAX(s.reps) as max_reps,
        SUM(s.weight * s.reps) as total_volume,
        MAX(w.date) as last_performed
      FROM exercises e
      JOIN workout_exercises we ON e.id = we.exercise_id
      JOIN workouts w ON we.workout_id = w.id
      JOIN sets s ON we.id = s.workout_exercise_id
      WHERE e.id = ? AND w.date >= ?
      GROUP BY e.id, e.name
    `,
      [exerciseId, cutoffDate.toISOString().split("T")[0]],
    )

    if (progressResult.rows.length === 0) return null

    const progress = progressResult.rows.item(0)

    // Get progress data over time
    const [timeSeriesResult] = await this.database.executeSql(
      `
      SELECT 
        w.date,
        MAX(s.weight) as max_weight,
        SUM(s.weight * s.reps) as total_volume
      FROM workouts w
      JOIN workout_exercises we ON w.id = we.workout_id
      JOIN sets s ON we.id = s.workout_exercise_id
      WHERE we.exercise_id = ? AND w.date >= ?
      GROUP BY w.date
      ORDER BY w.date ASC
    `,
      [exerciseId, cutoffDate.toISOString().split("T")[0]],
    )

    const progressData: { date: string; max_weight: number; total_volume: number }[] = []
    for (let i = 0; i < timeSeriesResult.rows.length; i++) {
      const row = timeSeriesResult.rows.item(i)
      progressData.push({
        date: row.date,
        max_weight: row.max_weight || 0,
        total_volume: row.total_volume || 0,
      })
    }

    return {
      exercise_id: progress.exercise_id,
      exercise_name: progress.exercise_name,
      max_weight: progress.max_weight || 0,
      max_reps: progress.max_reps || 0,
      total_volume: progress.total_volume || 0,
      last_performed: progress.last_performed,
      progress_data: progressData,
    }
  }

  async getPersonalRecords(limit = 10): Promise<PersonalRecord[]> {
    if (!this.database) return []

    const [result] = await this.database.executeSql(
      `
      SELECT 
        pr.*,
        e.name as exercise_name
      FROM personal_records pr
      JOIN exercises e ON pr.exercise_id = e.id
      ORDER BY pr.created_at DESC
      LIMIT ?
    `,
      [limit],
    )

    const records: PersonalRecord[] = []
    for (let i = 0; i < result.rows.length; i++) {
      records.push(result.rows.item(i))
    }

    return records
  }

  async checkAndCreatePersonalRecord(
    exerciseId: number,
    recordType: "weight" | "reps" | "volume" | "distance" | "duration",
    value: number,
    workoutId: number,
    date: string,
  ): Promise<boolean> {
    if (!this.database) return false

    // Check if this is a new record
    const [existingResult] = await this.database.executeSql(
      "SELECT MAX(value) as max_value FROM personal_records WHERE exercise_id = ? AND record_type = ?",
      [exerciseId, recordType],
    )

    const existingMax = existingResult.rows.item(0).max_value || 0

    if (value > existingMax) {
      await this.database.executeSql(
        "INSERT INTO personal_records (exercise_id, record_type, value, date, workout_id) VALUES (?, ?, ?, ?, ?)",
        [exerciseId, recordType, value, date, workoutId],
      )
      return true
    }

    return false
  }

  async exportData(): Promise<string> {
    if (!this.database) throw new Error("Database not initialized")

    const data: any = {}

    // Export exercises
    const [exercisesResult] = await this.database.executeSql("SELECT * FROM exercises WHERE is_custom = 1")
    data.exercises = []
    for (let i = 0; i < exercisesResult.rows.length; i++) {
      data.exercises.push(exercisesResult.rows.item(i))
    }

    // Export workouts
    const [workoutsResult] = await this.database.executeSql("SELECT * FROM workouts")
    data.workouts = []
    for (let i = 0; i < workoutsResult.rows.length; i++) {
      data.workouts.push(workoutsResult.rows.item(i))
    }

    // Export workout_exercises
    const [workoutExercisesResult] = await this.database.executeSql("SELECT * FROM workout_exercises")
    data.workout_exercises = []
    for (let i = 0; i < workoutExercisesResult.rows.length; i++) {
      data.workout_exercises.push(workoutExercisesResult.rows.item(i))
    }

    // Export sets
    const [setsResult] = await this.database.executeSql("SELECT * FROM sets")
    data.sets = []
    for (let i = 0; i < setsResult.rows.length; i++) {
      data.sets.push(setsResult.rows.item(i))
    }

    // Export templates
    const [templatesResult] = await this.database.executeSql("SELECT * FROM templates")
    data.templates = []
    for (let i = 0; i < templatesResult.rows.length; i++) {
      data.templates.push(templatesResult.rows.item(i))
    }

    // Export template_exercises
    const [templateExercisesResult] = await this.database.executeSql("SELECT * FROM template_exercises")
    data.template_exercises = []
    for (let i = 0; i < templateExercisesResult.rows.length; i++) {
      data.template_exercises.push(templateExercisesResult.rows.item(i))
    }

    // Export personal_records
    const [recordsResult] = await this.database.executeSql("SELECT * FROM personal_records")
    data.personal_records = []
    for (let i = 0; i < recordsResult.rows.length; i++) {
      data.personal_records.push(recordsResult.rows.item(i))
    }

    return JSON.stringify(data, null, 2)
  }

  async importData(jsonData: string): Promise<void> {
    if (!this.database) throw new Error("Database not initialized")

    const data = JSON.parse(jsonData)

    // Import custom exercises
    if (data.exercises) {
      for (const exercise of data.exercises) {
        await this.database.executeSql(
          "INSERT OR REPLACE INTO exercises (name, category, muscle_groups, equipment, instructions, is_custom) VALUES (?, ?, ?, ?, ?, 1)",
          [exercise.name, exercise.category, exercise.muscle_groups, exercise.equipment, exercise.instructions],
        )
      }
    }

    // Import other data tables...
    // Note: This would need careful handling of foreign key relationships
  }

  async getDatabase(): Promise<SQLite.SQLiteDatabase | null> {
    return this.database
  }

  async addExerciseToTemplate(templateExercise: Omit<TemplateExercise, "id">): Promise<number> {
    if (!this.database) throw new Error("Database not initialized")

    const [result] = await this.database.executeSql(
      "INSERT INTO template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_weight) VALUES (?, ?, ?, ?, ?, ?)",
      [
        templateExercise.template_id,
        templateExercise.exercise_id,
        templateExercise.order_index,
        templateExercise.default_sets || null,
        templateExercise.default_reps || null,
        templateExercise.default_weight || null,
      ],
    )

    return result.insertId
  }
}
