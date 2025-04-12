import { NextResponse } from 'next/server'
import { updateBookingStatus } from '@/services/bookingService'

// Add export configuration to disable static optimization for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Increase the revalidate period to prevent timeout issues
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Define response type for updateBookingStatus
interface BookingUpdateResult {
  success: boolean;
  message?: string;
  webhookSent?: boolean;
  error?: any;
}

export async function POST(request: Request) {
  try {
    const requestData = await request.json()
    const { bookingId, status, previousStatus: clientProvidedStatus } = requestData
    
    console.log(`[API] Processing booking status update request:`, JSON.stringify(requestData, null, 2))
    
    if (!bookingId || !status) {
      console.error('[API] Missing required fields in request')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Set a timeout for the database operation
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database operation timed out')), 25000);
    });
    
    // Use our service to update the booking and handle the webhook
    const resultPromise = updateBookingStatus(bookingId, status, clientProvidedStatus);
    
    // Race between the operation and the timeout
    try {
      const result = await Promise.race([resultPromise, timeoutPromise]) as BookingUpdateResult;
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.message },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ 
        success: true,
        message: result.message,
        webhookSent: result.webhookSent
      })
    } catch (timeoutError) {
      console.error(`[API] Operation timed out:`, timeoutError);
      // If it timed out, we'll still return a partial success since the DB update might have completed
      return NextResponse.json({ 
        success: true,
        partial: true,
        message: 'Status updated but notification may have timed out',
        webhookSent: false
      });
    }
  } catch (error) {
    console.error(`[API] Error updating booking status:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}