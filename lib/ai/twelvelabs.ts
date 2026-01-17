import axios from "axios"

export const twelvelabs = axios.create({
  baseURL: "https://api.twelvelabs.io/v1",
  headers: {
    "x-api-key": process.env.TWELVELABS_API_KEY!,
    "Content-Type": "application/json",
  },
})