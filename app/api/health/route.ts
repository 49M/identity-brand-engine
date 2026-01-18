import { NextResponse } from 'next/server'

/**
 * GET /api/health
 * Check if required environment variables are configured
 */
export async function GET() {
  const requiredEnvVars = {
    BACKBOARD_API_KEY: process.env.BACKBOARD_API_KEY,
    TWELVE_LABS_API_KEY: process.env.TWELVE_LABS_API_KEY,
    XAI_API_KEY: process.env.XAI_API_KEY
  }

  const missing = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  const configured = Object.entries(requiredEnvVars)
    .filter(([_, value]) => value)
    .map(([key]) => key)

  return NextResponse.json({
    success: missing.length === 0,
    configured,
    missing,
    message: missing.length === 0
      ? 'All required environment variables are configured'
      : `Missing environment variables: ${missing.join(', ')}`
  })
}
