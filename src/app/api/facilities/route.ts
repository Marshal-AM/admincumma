import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('Cumma')
    
    console.log('Fetching facilities from database...')
    const facilities = await db.collection('Facilities')
      .find({})
      .toArray()
    
    console.log(`Found ${facilities.length} facilities`)
    return NextResponse.json(facilities)
  } catch (error) {
    console.error('Error fetching facilities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch facilities' },
      { status: 500 }
    )
  }
} 