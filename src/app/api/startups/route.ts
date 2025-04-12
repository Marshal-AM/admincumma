import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('Cumma')
    
    console.log('Fetching startups from database...')
    const startups = await db.collection('Startups')
      .find({})
      .toArray()
    
    console.log(`Found ${startups.length} startups`)
    return NextResponse.json(startups)
  } catch (error) {
    console.error('Error fetching startups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch startups' },
      { status: 500 }
    )
  }
} 