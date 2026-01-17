import axios from "axios"

const BACKBOARD_BASE_URL = "https://api.backboard.io"

export const backboard = axios.create({
  baseURL: BACKBOARD_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.BACKBOARD_API_KEY}`,
    "Content-Type": "application/json",
  },
})