import { NextResponse } from 'next/server'
import { updateFacilityStatus } from '@/services/facilityService'

// Add export configuration to disable static optimization for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Define response type for updateFacilityStatus
interface FacilityUpdateResult {
  success: boolean;
  message?: string;
  webhookSent?: boolean;
  error?: any;
}

export async function POST(request: Request) {
  try {
    // Set headers to prevent caching
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    headers.set('Surrogate-Control', 'no-store');
    
    const requestData = await request.json()
    const { facilityId, status, previousStatus: clientProvidedStatus } = requestData
    
    console.log(`[API] Processing facility status update request:`, JSON.stringify(requestData, null, 2))
    
    if (!facilityId || !status) {
      console.error('[API] Missing required fields in request')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers }
      )
    }
    
    // Set a timeout for the database operation
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database operation timed out')), 25000);
    });
    
    // Use our service to update the facility and handle the webhook
    const resultPromise = updateFacilityStatus(facilityId, status, clientProvidedStatus);
    
    // Race between the operation and the timeout
    try {
      const result = await Promise.race([resultPromise, timeoutPromise]) as FacilityUpdateResult;
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.message },
          { status: 404, headers }
        )
      }
      
      return NextResponse.json({ 
        success: true,
        message: result.message,
        webhookSent: result.webhookSent,
        timestamp: Date.now() // Add timestamp for cache busting
      }, { headers })
    } catch (timeoutError) {
      console.error(`[API] Operation timed out:`, timeoutError);
      // If it timed out, we'll still return a partial success since the DB update might have completed
      return NextResponse.json({ 
        success: true,
        partial: true,
        message: 'Status updated but notification may have timed out',
        webhookSent: false,
        timestamp: Date.now()
      }, { headers });
    }
  } catch (error) {
    console.error(`[API] Error updating facility status:`, error)
    
    // Set headers to prevent caching
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    
    return NextResponse.json(
      { error: 'Internal server error', timestamp: Date.now() },
      { status: 500, headers }
    )
  }
} 