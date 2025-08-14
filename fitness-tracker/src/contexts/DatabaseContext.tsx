"use client"

import { createContext, useContext, useEffect, type ReactNode } from "react"
import { DatabaseService } from "../services/DatabaseService"

interface DatabaseContextType {
  db: DatabaseService
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined)

export const DatabaseProvider = ({ children }: { children: ReactNode }) => {
  const db = new DatabaseService()

  useEffect(() => {
    db.initDatabase()
  }, [])

  return <DatabaseContext.Provider value={{ db }}>{children}</DatabaseContext.Provider>
}

export const useDatabase = () => {
  const context = useContext(DatabaseContext)
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider")
  }
  return context
}
