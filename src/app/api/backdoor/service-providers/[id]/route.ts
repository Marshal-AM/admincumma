import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

interface Params {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = params
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid service provider ID' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('Cumma')
    
    const serviceProvider = await db.collection('Service Provider')
      .findOne({ _id: new ObjectId(id) })
    
    if (!serviceProvider) {
      return NextResponse.json(
        { error: 'Service provider not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(serviceProvider)
  } catch (error) {
    console.error('Error fetching service provider:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service provider' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = params
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid service provider ID' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('Cumma')
    
    // Get the current document first
    const currentServiceProvider = await db.collection('Service Provider')
      .findOne({ _id: new ObjectId(id) })
    
    if (!currentServiceProvider) {
      return NextResponse.json(
        { error: 'Service provider not found' },
        { status: 404 }
      )
    }
    
    // Get updated data from request body
    const updates = await request.json()
    
    // Preserve fields that shouldn't be modified
    const updatedServiceProvider = {
      ...currentServiceProvider,
      ...updates,
      _id: currentServiceProvider._id,
      userId: currentServiceProvider.userId,
      createdAt: currentServiceProvider.createdAt,
      updatedAt: new Date()
    }
    
    // Replace the document to ensure schema validation passes
    const result = await db.collection('Service Provider').replaceOne(
      { _id: new ObjectId(id) },
      updatedServiceProvider
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Service provider not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Service provider updated successfully',
      serviceProvider: updatedServiceProvider
    })
  } catch (error) {
    console.error('Error updating service provider:', error)
    return NextResponse.json(
      { error: 'Failed to update service provider' },
      { status: 500 }
    )
  }
} 