import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST() {
  try {
    const client = await clientPromise
    const db = client.db('Cumma')
    
    console.log('Updating existing startup documents to comply with the new schema...')
    
    // Get all startups
    const startups = await db.collection('Startups').find({}).toArray()
    console.log(`Found ${startups.length} startups to update`)
    
    let updatedCount = 0
    let errorCount = 0
    
    // Update each startup document
    for (const startup of startups) {
      try {
        // Ensure required fields exist
        const updates = {
          userId: startup.userId,
          createdAt: startup.createdAt || new Date(),
          updatedAt: new Date(),
          
          // Ensure other fields are present but can be null
          startupName: startup.startupName || null,
          contactName: startup.contactName || null,
          contactNumber: startup.contactNumber || null,
          founderName: startup.founderName || null,
          founderDesignation: startup.founderDesignation || null,
          entityType: startup.entityType || null,
          teamSize: typeof startup.teamSize === 'number' ? startup.teamSize : null,
          dpiitNumber: startup.dpiitNumber || null,
          industry: startup.industry || null,
          sector: startup.sector || null,
          stagecompleted: startup.stagecompleted || null,
          startupMailId: startup.startupMailId || null,
          website: startup.website || null,
          linkedinStartupUrl: startup.linkedinStartupUrl || null,
          linkedinFounderUrl: startup.linkedinFounderUrl || null,
          lookingFor: Array.isArray(startup.lookingFor) ? startup.lookingFor : [],
          address: startup.address || null,
          logoUrl: startup.logoUrl || null
        }
        
        // Update the document
        await db.collection('Startups').updateOne(
          { _id: startup._id },
          { $set: updates }
        )
        
        updatedCount++
      } catch (error) {
        console.error(`Error updating startup ${startup._id}:`, error)
        errorCount++
      }
    }
    
    console.log(`Updated ${updatedCount} startups, ${errorCount} errors`)
    
    return NextResponse.json({ 
      success: true,
      message: `Updated ${updatedCount} startups, ${errorCount} errors`
    })
  } catch (error) {
    console.error('Error updating startup documents:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 