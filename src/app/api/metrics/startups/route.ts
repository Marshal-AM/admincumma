import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'

interface FacilityType {
  type: string;
  count: number;
}

export async function GET() {
  try {
    const db = await connectToDatabase()
    console.log('Connected to database for startups metrics')

    // Get startups data for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    console.log('Fetching data since:', sixMonthsAgo)

    // Get monthly data for facilities and earnings
    const monthlyData = await db.collection('Facilities')
      .aggregate([
        {
          $match: {
            status: "active",
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
              type: "$facilityType"
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: {
              month: "$_id.month",
              year: "$_id.year"
            },
            types: {
              $push: {
                type: "$_id.type",
                count: "$count"
              }
            }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]).toArray()

    // Get monthly earnings data
    const monthlyEarnings = await db.collection('bookings')
      .aggregate([
        {
          $match: {
            status: "approved",
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" }
            },
            monthlyEarnings: { $sum: "$amount" }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]).toArray()

    console.log('Raw startups data:', monthlyData)
    console.log('Monthly earnings data:', monthlyEarnings)

    // Transform the data into the required format
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    const formattedData = monthlyData.map(item => {
      const monthStr = monthNames[item._id.month - 1]
      const yearStr = String(item._id.year).slice(2)
      
      // Find corresponding earnings for this month
      const earnings = monthlyEarnings.find(
        e => e._id.year === item._id.year && e._id.month === item._id.month
      )

      const data = {
        month: `${monthStr} ${yearStr}`,
        labs: 0,
        meetingRoom: 0,
        trainingHalls: 0,
        monthlyEarnings: earnings?.monthlyEarnings || 0,
        totalStartups: 0
      }

      item.types.forEach((type: FacilityType) => {
        // Using exact facility types from the schema
        if (['bio-allied-labs', 'manufacturing-labs', 'prototyping-labs', 'raw-space-lab'].includes(type.type)) {
          data.labs += type.count
        } else if (['individual-cabin', 'coworking-spaces', 'meeting-rooms', 'raw-space-office'].includes(type.type)) {
          data.meetingRoom += type.count
        } else if (['software', 'saas-allied'].includes(type.type)) {
          data.trainingHalls += type.count
        }
        data.totalStartups += type.count
      })

      return data
    })

    console.log('Formatted data:', formattedData)
    return NextResponse.json(formattedData)

  } catch (error) {
    console.error('Error fetching startup metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch startup metrics' },
      { status: 500 }
    )
  }
} 