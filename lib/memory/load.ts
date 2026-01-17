import fs from "fs"
import path from "path"

export function loadJSON(file: string) {
  const fullPath = path.join(process.cwd(), "memory", file)
  if (!fs.existsSync(fullPath)) return null
  return JSON.parse(fs.readFileSync(fullPath, "utf-8"))
}