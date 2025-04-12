import { format } from 'date-fns'
import clientPromise from '@/lib/mongodb'
import Image from 'next/image'
import { ObjectId } from 'mongodb'
import StatusActions from '@/components/bookings/StatusActions'

// Force dynamic rendering to prevent data fetching at build time
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface Startup {
  _id: ObjectId;
  startupName: string;
  logoUrl: string | null;
}

interface Facility {
  _id: ObjectId;
  facilityType: 'individual-cabin' | 'coworking-spaces' | 'meeting-rooms' | 'bio-allied-labs' | 
    'manufacturing-labs' | 'prototyping-labs' | 'software' | 'saas-allied' | 'raw-space-office' | 'raw-space-lab';
  details: {
    name: string;
    description: string;
    images: string[];
  };
}

interface Booking {
  _id: ObjectId;
  facilityId: ObjectId;
  startupId: ObjectId;
  incubatorId: ObjectId;
  rentalPlan: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
  amount: number;
  baseAmount: number;
  gstAmount: number;
  startDate: Date;
  endDate: Date;
  whatsappNumber?: string;
  unitCount?: number;
  requestedAt?: Date;
  processedAt?: Date;
  expiresAt?: Date | null;
  razorpayOrderId?: string;
  paymentDetails?: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    verifiedAt: Date;
    method?: string;
    currency?: string;
    status?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  _id: ObjectId;
  name: string;
  email: string;
  [key: string]: any;
}

interface BookingWithRelations extends Booking {
  startup?: Startup;
  facility?: Facility;
}

async function getBookings(): Promise<BookingWithRelations[]> {
  // Skip data fetching during build time to prevent MongoDB queries during build
  if (process.env.NODE_ENV === 'production' && typeof window === 'undefined' && !process.env.VERCEL_URL) {
    console.log('Skipping data fetch during build time');
    return [];
  }

  try {
    const client = await clientPromise
    const db = client.db('Cumma')
    
    console.log('Fetching bookings from database...')
    const bookings = await db.collection<Booking>('bookings')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    console.log(`Found ${bookings.length} bookings`)
    
    // Only do the detailed logging in development
    if (process.env.NODE_ENV === 'development') {
      // Log startup IDs for debugging
      console.log('Startup IDs to find:', bookings.map(b => b.startupId.toString()))
    }

    // Fetch startup details for all bookings
    const startupIds = bookings.map(booking => new ObjectId(booking.startupId))
    const startups = await db.collection<Startup>('Startups')
      .find({ _id: { $in: startupIds } })
      .toArray()
      
    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`Found ${startups.length} startups out of ${startupIds.length} IDs`)
    
      // Check which startupIds weren't found
      const foundStartupIds = new Set(startups.map(s => s._id.toString()))
      const missingStartupIds = startupIds.filter(id => !foundStartupIds.has(id.toString()))
      
      if (missingStartupIds.length > 0) {
        console.log(`Missing ${missingStartupIds.length} startups. First few missing IDs:`, 
          missingStartupIds.slice(0, 3).map(id => id.toString()))
      }
    }

    // Fetch facility details for all bookings
    const facilityIds = bookings.map(booking => new ObjectId(booking.facilityId))
    const facilities = await db.collection<Facility>('Facilities')
      .find({ _id: { $in: facilityIds } })
      .toArray()

    // Create maps for quick lookups
    const startupMap = new Map(startups.map(startup => [startup._id.toString(), startup]))
    const facilityMap = new Map(facilities.map(facility => [facility._id.toString(), facility]))
    
    // If we have missing startups, try getting them by userId (this is the issue!)
    const missingStartupIds = bookings
      .filter(booking => !startupMap.has(booking.startupId.toString()))
      .map(booking => booking.startupId)
    
    if (missingStartupIds.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Some startups not found. Trying alternatives...')
      }
      
      // Get all startups in one query for efficiency
      const allStartups = await db.collection('Startups').find({}).toArray()
      const startupsByUserId = new Map()
      
      // Create a map of userId -> startup
      allStartups.forEach(startup => {
        if (startup.userId) {
          startupsByUserId.set(startup.userId.toString(), startup)
        }
      })
      
      // Now check each missing startup
      for (const missingId of missingStartupIds) {
        const missingIdStr = missingId.toString()
        const startupByUserId = startupsByUserId.get(missingIdStr)
        
        if (startupByUserId) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Found startup for user ${missingIdStr}`)
          }
          startupMap.set(missingIdStr, startupByUserId)
        }
      }
    }

    // Combine booking data with startup and facility details
    const bookingsWithDetails = bookings.map(booking => {
      const startupId = booking.startupId.toString()
      let startup = startupMap.get(startupId)
      
      // Add debug info only in dev
      if (!startup && process.env.NODE_ENV === 'development') {
        console.log(`No startup found for ID: ${startupId}`)
      }
      
      return {
        ...booking,
        startup,
        facility: facilityMap.get(booking.facilityId.toString())
      }
    })
    
    return bookingsWithDetails
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return []
  }
}

// Helper function to format facility type
function formatFacilityType(type: string): string {
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to safely format dates
function formatDate(date: Date | string | undefined | null): string {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'dd.MM.yyyy');
  } catch (e) {
    return 'Invalid Date';
  }
}

/**
 * This component renders startup details from the booking when the startup cannot be found
 */
function FallbackStartupDetails({ booking }: { booking: BookingWithRelations }) {
  const phoneNumber = booking.whatsappNumber || 'No phone available';
  const firstLetter = phoneNumber.charAt(0);
  
  return (
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
        <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-400">
          {firstLetter || '?'}
        </div>
      </div>
      <div>
        <div className="font-medium text-gray-900">
          Startup ID: {booking.startupId.toString().substring(0, 8)}...
        </div>
        <div className="mt-0.5 text-xs text-gray-500">
          Phone: {phoneNumber}
        </div>
        <div className="mt-0.5 text-sm text-gray-500">
          Requested For: {booking.facility?.details?.name || 'Unknown Facility'}
          <span className="ml-1 text-xs text-gray-400">
            ({formatFacilityType(booking.facility?.facilityType || '')})
          </span>
        </div>
        <div className="mt-1.5 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-sm text-gray-600">
          ₹{booking.amount.toLocaleString('en-IN')} /{booking.rentalPlan.toLowerCase().replace('ly', '')}
        </div>
      </div>
    </div>
  );
}

export default async function BookingsPage() {
  const bookings = await getBookings()

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">View all booking status</h1>
        <p className="text-sm text-gray-500">We are glad to see you again</p>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="whitespace-nowrap px-6 py-5 text-left text-sm font-medium text-gray-600">
                  Startup Details
                </th>
                <th className="whitespace-nowrap px-6 py-5 text-left text-sm font-medium text-gray-600">
                  Start Date
                </th>
                <th className="whitespace-nowrap px-6 py-5 text-left text-sm font-medium text-gray-600">
                  End Date
                </th>
                <th className="whitespace-nowrap px-6 py-5 text-left text-sm font-medium text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking._id.toString()} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      {booking.startup ? (
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                            {booking.startup.logoUrl ? (
                              <Image
                                src={booking.startup.logoUrl}
                                alt={`${booking.startup.startupName} logo`}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-400">
                                {booking.startup.startupName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {booking.startup.startupName}
                            </div>
                            <div className="mt-0.5 text-sm text-gray-500">
                              Requested For: {booking.facility?.details.name || 'Unknown Facility'}
                              <span className="ml-1 text-xs text-gray-400">
                                ({formatFacilityType(booking.facility?.facilityType || '')})
                              </span>
                            </div>
                            <div className="mt-1.5 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-sm text-gray-600">
                              ₹{booking.amount.toLocaleString('en-IN')} /{booking.rentalPlan.toLowerCase().replace('ly', '')}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <FallbackStartupDetails booking={booking} />
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {formatDate(booking.startDate)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {formatDate(booking.endDate)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusActions 
                        bookingId={booking._id.toString()} 
                        status={booking.status as 'pending' | 'approved' | 'rejected'}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}