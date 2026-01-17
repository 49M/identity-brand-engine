import fs from "fs"
import path from "path"

export function saveJSON(file: string, data: any) {
  const fullPath = path.join(process.cwd(), "memory", file)
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2))
}

export function appendJSON(file: string, entry: any) {
  const fullPath = path.join(process.cwd(), "memory", file)
  const existing = fs.existsSync(fullPath)
    ? JSON.parse(fs.readFileSync(fullPath, "utf-8"))
    : []
  existing.push(entry)
  saveJSON(file, existing)
}