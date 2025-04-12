import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

interface ServiceProvider {
  _id: ObjectId;
  userId: ObjectId;
  serviceName?: string | null;
  serviceProviderType?: string | null;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any; // For other properties
}

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('Cumma')
    
    console.log('Fetching all facility partners from database...')
    
    const providers = await db.collection<ServiceProvider>('Service Provider')
      .find({})
      .toArray()
    
    console.log(`Found ${providers.length} facility partners`)
    
    // Transform dates to ISO strings for JSON serialization
    const serializedProviders = providers.map(provider => ({
      ...provider,
      createdAt: provider.createdAt instanceof Date ? provider.createdAt.toISOString() : provider.createdAt,
      updatedAt: provider.updatedAt instanceof Date ? provider.updatedAt.toISOString() : provider.updatedAt
    }))
    
    // Debug: Log all provider names and types
    serializedProviders.forEach((provider, index) => {
      console.log(`Partner ${index + 1}:`, {
        name: provider.serviceName || 'Unnamed',
        type: provider.serviceProviderType || 'Not specified'
      })
    })
    
    return NextResponse.json(serializedProviders)
  } catch (error) {
    console.error('Error fetching facility partners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch facility partners' },
      { status: 500 }
    )
  }
} 