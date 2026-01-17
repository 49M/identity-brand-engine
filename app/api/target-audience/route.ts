import { getTargetAudience, getCreatorProfile } from '@/lib/memory/helpers'
import { NextResponse } from 'next/server'

export async function GET() {
  // Get target audience
  const targetAudience = await getTargetAudience()

  // Get full profile
  const profile = await getCreatorProfile()

  return NextResponse.json({
    targetAudience,
    creatorName: profile?.creator.name,
    niche: profile?.creator.background[0]
  })
}