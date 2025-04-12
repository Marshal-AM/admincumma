import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'

export async function GET() {
  try {
    const db = await connectToDatabase()
    console.log('Connected to database for metrics')

    // Total Active Facilities
    const totalFacilities = await db.collection('Facilities')
      .countDocuments({ 
        status: "active",
      })
    console.log('Total Active Facilities:', totalFacilities)

    // New Facilities (This Month)
    const currentDate = new Date()
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const currentMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    const newFacilities = await db.collection('Facilities')
      .countDocuments({
        status: "active",
        createdAt: { 
          $gte: currentMonthStart,
          $lte: currentMonthEnd
        }
      })
    console.log('New Facilities this month:', newFacilities)

    // Total Bookings (Approved)
    const totalBookings = await db.collection('bookings')
      .countDocuments({ 
        status: "approved"
      })
    console.log('Total Approved Bookings:', totalBookings)

    // Monthly Earnings from approved bookings
    const monthlyEarningsResult = await db.collection('bookings')
      .aggregate([
        {
          $match: {
            status: "approved",
            createdAt: {
              $gte: currentMonthStart,
              $lte: currentMonthEnd
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" }
          }
        }
      ]).toArray()

    const monthlyEarnings = monthlyEarningsResult[0]?.total || 0
    console.log('Monthly Earnings:', monthlyEarnings)

    // Total Earnings from all approved bookings
    const totalEarningsResult = await db.collection('bookings')
      .aggregate([
        {
          $match: {
            status: "approved"
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" }
          }
        }
      ]).toArray()

    const totalEarnings = totalEarningsResult[0]?.total || 0
    console.log('Total Earnings:', totalEarnings)

    // Previous Month Earnings from approved bookings
    const previousMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    const previousMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)

    const previousMonthEarningsResult = await db.collection('bookings')
      .aggregate([
        {
          $match: {
            status: "approved",
            createdAt: {
              $gte: previousMonthStart,
              $lte: previousMonthEnd
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" }
          }
        }
      ]).toArray()

    const previousMonthEarnings = previousMonthEarningsResult[0]?.total || 0
    console.log('Previous Month Earnings:', previousMonthEarnings)
    
    const earningsChange = previousMonthEarnings === 0 ? 0 :
      ((monthlyEarnings - previousMonthEarnings) / previousMonthEarnings) * 100

    // Log the final response
    const response = {
      totalFacilities,
      newFacilities,
      totalBookings,
      monthlyEarnings,
      totalEarnings,
      earningsChange
    }
    console.log('Final Response:', response)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
} 