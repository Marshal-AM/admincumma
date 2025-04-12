import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST() {
  try {
    const client = await clientPromise
    const db = client.db('Cumma')
    
    console.log('Updating Startups collection schema validation...')
    
    // The new schema validation
    const newSchema = {
      $jsonSchema: {
        bsonType: 'object',
        required: [
          'userId',
          'createdAt',
          'updatedAt'
        ],
        properties: {
          userId: {
            bsonType: 'objectId',
            description: 'Reference to the user ID in the Users collection - required'
          },
          startupName: {
            bsonType: [
              'string',
              'null'
            ],
            description: 'Name of the startup'
          },
          contactName: {
            bsonType: [
              'string',
              'null'
            ],
            description: 'Name of the contact person'
          },
          contactNumber: {
            bsonType: [
              'string',
              'null'
            ],
            description: 'Contact phone number'
          },
          founderName: {
            bsonType: [
              'string',
              'null'
            ],
            description: 'Name of the founder'
          },
          founderDesignation: {
            bsonType: [
              'string',
              'null'
            ],
            description: 'Designation of the founder'
          },
          entityType: {
            bsonType: [
              'string',
              'null'
            ],
            description: 'Type of entity'
          },
          teamSize: {
            bsonType: [
              'int',
              'null'
            ],
            minimum: 0,
            description: 'Size of the team'
          },
          dpiitNumber: {
            bsonType: [
              'string',
              'null'
            ],
            description: 'DPIIT registration number'
          },
          industry: {
            bsonType: [
              'string',
              'null'
            ],
            description: 'Industry of the startup'
          },
          sector: {
            bsonType: [
              'string',
              'null'
            ],
            description: 'Sector of the startup'
          },
          stagecompleted: {
            bsonType: [
              'string',
              'null'
            ],
            description: 'Stage completed by the startup'
          },
          startupMailId: {
            bsonType: [
              'string',
              'null'
            ],
            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
            description: 'Email address of the startup'
          },
          website: {
            bsonType: [
              'string',
              'null'
            ],
            description: 'Website URL of the startup'
          },
          linkedinStartupUrl: {
            bsonType: [
              'string',
              'null'
            ],
            description: 'LinkedIn URL of the startup'
          },
          linkedinFounderUrl: {
            bsonType: [
              'string',
              'null'
            ],
            description: 'LinkedIn URL of the founder'
          },
          lookingFor: {
            bsonType: 'array',
            description: 'What the startup is looking for'
          },
          address: {
            bsonType: [
              'string',
              'null'
            ],
            description: 'Address of the startup'
          },
          logoUrl: {
            bsonType: [
              'string',
              'null'
            ],
            description: 'URL of the startup logo'
          },
          createdAt: {
            bsonType: 'date',
            description: 'Timestamp when the record was created - required'
          },
          updatedAt: {
            bsonType: 'date',
            description: 'Timestamp when the record was last updated - required'
          }
        }
      }
    }

    // Check if the collection exists
    const collections = await db.listCollections({ name: 'Startups' }).toArray()
    
    if (collections.length > 0) {
      // Collection exists, update the schema validation
      console.log('Startups collection exists, updating schema validation...')
      
      try {
        await db.command({
          collMod: 'Startups',
          validator: newSchema,
          validationLevel: 'moderate',
          validationAction: 'error'
        })
        console.log('Successfully updated Startups collection schema validation')
      } catch (error) {
        console.error('Error updating schema validation:', error)
        return NextResponse.json(
          { error: 'Failed to update schema validation', details: error instanceof Error ? error.message : String(error) },
          { status: 500 }
        )
      }
    } else {
      // Collection doesn't exist, create it with the schema validation
      console.log('Startups collection does not exist, creating it with schema validation...')
      
      try {
        await db.createCollection('Startups', {
          validator: newSchema,
          validationLevel: 'moderate',
          validationAction: 'error'
        })
        console.log('Successfully created Startups collection with schema validation')
      } catch (error) {
        console.error('Error creating collection with schema validation:', error)
        return NextResponse.json(
          { error: 'Failed to create collection with schema validation', details: error instanceof Error ? error.message : String(error) },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Startups collection schema validation updated successfully'
    })
  } catch (error) {
    console.error('Error updating Startups collection schema validation:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 