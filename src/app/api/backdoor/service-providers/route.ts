import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('Cumma')
    
    console.log('Fetching service providers from database...')
    const serviceProviders = await db.collection('Service Provider')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()
    
    console.log(`Found ${serviceProviders.length} service providers`)
    return NextResponse.json(serviceProviders)
  } catch (error) {
    console.error('Error fetching service providers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service providers' },
      { status: 500 }
    )
  }
} 