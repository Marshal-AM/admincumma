import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')
    
    const client = await clientPromise
    const db = client.db('Cumma')
    
    console.log('Fetching bookings from database...')
    
    // Build the query
    const query: any = {}
    
    // Apply status filter if provided
    if (statusFilter) {
      query.status = statusFilter
    }
    
    // Fetch bookings
    const bookings = await db.collection('bookings')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()
    
    console.log(`Found ${bookings.length} bookings`)
    
    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
} 