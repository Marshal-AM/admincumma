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
  // Set headers to prevent caching
  const headers = new Headers();
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  headers.set('Surrogate-Control', 'no-store');
  
  try {
    const requestData = await request.json();
    const { facilityId, status, previousStatus: clientProvidedStatus } = requestData;
    
    // Add a duplicate timestamp in case the query param one is stripped
    const timestamp = Date.now();
    
    console.log(`[API] Processing facility status update request at ${timestamp}:`, JSON.stringify(requestData, null, 2));
    
    if (!facilityId || !status) {
      console.error('[API] Missing required fields in request');
      return NextResponse.json(
        { error: 'Missing required fields', timestamp },
        { status: 400, headers }
      );
    }
    
    // If the client is older than 20 seconds, we might have issues with stale requests
    const clientTimestamp = requestData.timestamp || 0;
    const serverTimestamp = Date.now();
    const timeDiff = serverTimestamp - clientTimestamp;
    
    if (timeDiff > 20000) {
      console.warn(`[API] Received old request (${timeDiff}ms old)`);
    }
    
    // Set a timeout for the database operation
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database operation timed out')), 5000); // Reduce to 5 seconds for Vercel
    });
    
    // Use our service to update the facility and handle the webhook
    const resultPromise = updateFacilityStatus(facilityId, status, clientProvidedStatus);
    
    // Race between the operation and the timeout
    try {
      const result = await Promise.race([resultPromise, timeoutPromise]) as FacilityUpdateResult;
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.message, timestamp },
          { status: 404, headers }
        );
      }
      
      return NextResponse.json({ 
        success: true,
        message: result.message,
        webhookSent: result.webhookSent,
        timestamp
      }, { headers });
    } catch (timeoutError) {
      console.error(`[API] Operation timed out:`);
      
      // Make an effort to still update the database
      // This will fire and forget - client will handle assuming success
      updateFacilityStatus(facilityId, status, clientProvidedStatus)
        .then(result => {
          console.log(`[API] Async update finished after timeout:`, result);
        })
        .catch(error => {
          console.error(`[API] Async update failed after timeout:`, error);
        });
      
      // If it timed out, we'll still return a partial success since we're attempting the DB update
      return NextResponse.json({ 
        success: true,
        partial: true,
        message: 'Status update started but not confirmed - client should assume success',
        webhookSent: false,
        timestamp
      }, { headers, status: 202 }); // 202 Accepted indicates processing started but not complete
    }
  } catch (error) {
    console.error(`[API] Error updating facility status:`, error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now() 
      },
      { status: 500, headers }
    );
  }
} 
