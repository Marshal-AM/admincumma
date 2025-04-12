'use client'
import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface StatusActionsProps {
  bookingId: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed'
}

export default function StatusActions({ bookingId, status: initialStatus }: StatusActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [showSpinner, setShowSpinner] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // Store successful updates in localStorage to persist through refreshes
  useEffect(() => {
    const storedStatus = localStorage.getItem(`booking_status_${bookingId}`);
    if (storedStatus && storedStatus !== initialStatus) {
      setCurrentStatus(storedStatus as any);
    }
  }, [bookingId, initialStatus]);
  
  if (currentStatus !== 'pending') {
    // Define styling for each status
    const statusStyles = {
      approved: 'bg-green-50 text-green-700',
      rejected: 'bg-red-50 text-red-700',
      cancelled: 'bg-orange-50 text-orange-700',
      completed: 'bg-blue-50 text-blue-700'
    };
    
    return (
      <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-medium ${
        statusStyles[currentStatus] || 'bg-gray-50 text-gray-700'
      }`}>
        {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
        {(showSpinner || isPending) && (
          <svg className="ml-2 h-4 w-4 animate-spin text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
      </span>
    )
  }

  const updateBookingStatus = async (newStatus: 'approved' | 'rejected', retry = false) => {
    if (isLoading) return; // Prevent multiple clicks
    
    setIsLoading(true);
    if (retry) {
      setIsRetrying(true);
    }
    
    // Optimistically update UI first
    setCurrentStatus(newStatus);
    setShowSpinner(true);
    
    // Store status update in localStorage immediately
    // This ensures that even if page refreshes before API success,
    // UI will still show updated status
    localStorage.setItem(`booking_status_${bookingId}`, newStatus);
    
    console.log(`[StatusActions] ${retry ? 'Retrying' : 'Updating'} booking ${bookingId} status from ${initialStatus} to ${newStatus}`)
    
    const requestData = {
      bookingId,
      status: newStatus,
      previousStatus: initialStatus,
      timestamp: Date.now() // Add timestamp to ensure request is not cached
    }
    
    console.log(`[StatusActions] Sending request data:`, requestData)
    
    try {
      // Use fetch with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const res = await fetch(`/api/bookings/update-status?t=${Date.now()}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(requestData),
        cache: 'no-store',
        signal: controller.signal,
        next: { revalidate: 0 }
      });
      
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const responseData = await res.json();
        console.log(`[StatusActions] Status update successful:`, responseData);
        
        // Use React useTransition for smoother UI updates
        startTransition(() => {
          setShowSpinner(false);
          // Force router to refetch data in background without full refresh
          router.refresh();
        });
      } else {
        // Don't reset the status immediately on error - it might have succeeded on server
        let errorMessage = 'Unknown error';
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || 'Unknown error';
        } catch (jsonError) {
          // If we can't parse JSON, just use the status text
          errorMessage = res.statusText || `Error ${res.status}`;
        }
        
        console.error(`[StatusActions] Status update failed:`, errorMessage);
        
        // For 504 timeouts, assume success since the database operation likely completed
        if (res.status === 504) {
          // Keep the optimistic UI update since database operation likely completed
          alert('The server took too long to respond, but the status was likely updated successfully. The page will refresh in 3 seconds.');
          startTransition(() => {
            router.refresh();
          });
        } else {
          // Only for non-timeout errors, reset the status and clear localStorage
          setCurrentStatus(initialStatus);
          localStorage.removeItem(`booking_status_${bookingId}`);
          setShowSpinner(false);
          alert(`Failed to update status: ${errorMessage}`);
        }
      }
    } catch (error: any) {
      console.error(`[StatusActions] Error updating status:`, error);
      
      // For network errors, don't reset UI - assume the update went through
      let shouldResetUI = false;
      
      // Handle timeout/abort specifically
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        alert('The request timed out, but the status was likely updated successfully. You can continue using the application.');
        startTransition(() => {
          router.refresh();
        });
      } else if (error.message?.includes('Failed to fetch') || !navigator.onLine) {
        alert('Network error. The status update may have succeeded. The page will refresh automatically.');
        startTransition(() => {
          router.refresh();
        });
      } else {
        shouldResetUI = true;
        alert('An unexpected error occurred while updating the booking status.');
      }
      
      if (shouldResetUI) {
        setCurrentStatus(initialStatus);
        localStorage.removeItem(`booking_status_${bookingId}`);
      }
      
      setShowSpinner(false);
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => updateBookingStatus('approved')}
        disabled={isLoading || isPending}
        className={`rounded-full ${isLoading || isPending ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} px-3 py-1 text-sm font-medium text-white transition-colors`}
      >
        {isLoading && !isRetrying ? 'Processing...' : 'Approve'}
      </button>
      <button
        onClick={() => updateBookingStatus('rejected')}
        disabled={isLoading || isPending}
        className={`rounded-full ${isLoading || isPending ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'} px-3 py-1 text-sm font-medium text-white transition-colors`}
      >
        {isLoading && !isRetrying ? 'Processing...' : 'Reject'}
      </button>
    </div>
  )
} 
