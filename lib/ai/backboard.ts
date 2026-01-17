import axios from "axios"

// Backboard.io API base URL (correct format based on documentation)
const BACKBOARD_BASE_URL = "https://app.backboard.io/api"

export const backboard = axios.create({
  baseURL: BACKBOARD_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.BACKBOARD_API_KEY}`,
    "Content-Type": "application/json",
  },
})

// Development mode: Check if Backboard is available
export const isBackboardAvailable = async (): Promise<boolean> => {
  try {
    await backboard.get('/health')
    return true
  } catch {
    return false
  }
}