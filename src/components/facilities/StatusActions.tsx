'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface StatusActionsProps {
  facilityId: string;
  status: 'pending' | 'active' | 'rejected';
  onStatusChange: () => Promise<void>;
}

export default function StatusActions({ facilityId, status: initialStatus, onStatusChange }: StatusActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [showSpinner, setShowSpinner] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // Store successful updates in localStorage to persist through refreshes
  useEffect(() => {
    // On first load, the localStorage should match whatever's in the database
    // Reset localStorage to match server-provided initialStatus
    if (initialStatus !== 'pending') {
      localStorage.setItem(`facility_status_${facilityId}`, initialStatus);
    } else {
      // If server says pending, remove any localStorage value that might be wrong
      localStorage.removeItem(`facility_status_${facilityId}`);
    }
    
    // Set component state to server state
    setCurrentStatus(initialStatus);
  }, [facilityId, initialStatus]);

  const handleStatusUpdate = async (newStatus: 'active' | 'rejected') => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Optimistically update UI first - but only for the current session
      setCurrentStatus(newStatus);
      setShowSpinner(true);
      
      // Clear any old localStorage values to ensure we don't have stale data
      localStorage.removeItem(`facility_status_${facilityId}`);
      
      const requestData = {
        facilityId,
        status: newStatus,
        previousStatus: initialStatus,
        timestamp: Date.now() // Add timestamp to ensure request is not cached
      }
      
      // Use fetch with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const res = await fetch(`/api/facilities/update-status?t=${Date.now()}`, {
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
      })
      
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const responseData = await res.json()
        console.log(`[StatusActions] Status update successful:`, responseData)
        
        // ONLY on confirmed success, store in localStorage
        if (responseData.success) {
          localStorage.setItem(`facility_status_${facilityId}`, newStatus);
        }
        
        // Use React useTransition for smoother UI updates
        startTransition(async () => {
          setShowSpinner(false);
          // Call the onStatusChange callback to refresh the UI
          await onStatusChange();
          // Force router to refetch data
          router.refresh();
        });
      } else {
        // Reset UI status on error - the database update failed
        setCurrentStatus(initialStatus);
        setShowSpinner(false);
        
        let errorMessage = 'Unknown error';
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || 'Unknown error';
        } catch (jsonError) {
          // If we can't parse JSON, just use the status text
          errorMessage = res.statusText || `Error ${res.status}`;
        }
        
        console.error(`[StatusActions] Status update failed:`, errorMessage);
        
        // For 504 timeouts, try once more with a server query
        if (res.status === 504) {
          alert('The server took too long to respond. Checking actual status...');
          
          // Forcefully refresh to get the true status from the server
          await onStatusChange();
          router.refresh();
        } else {
          alert(`Failed to update status: ${errorMessage}`);
        }
      }
    } catch (error: any) {
      console.error(`[StatusActions] Error updating status:`, error);
      
      // For network errors, don't assume success - we need to verify
      setCurrentStatus(initialStatus);
      
      // Handle timeout/abort specifically
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        alert('The request timed out. Checking actual status...');
        // Hard refresh to get the true status from the server
        window.location.reload();
      } else if (error.message?.includes('Failed to fetch') || !navigator.onLine) {
        alert('Network error. Please check your connection and try again when online.');
        setShowSpinner(false);
      } else {
        alert('An unexpected error occurred while updating the facility status.');
        setShowSpinner(false);
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (currentStatus !== 'pending') {
    return (
      <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-medium ${
        currentStatus === 'active' 
          ? 'bg-green-50 text-green-700'
          : 'bg-red-50 text-red-700'
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

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => handleStatusUpdate('active')}
        disabled={isLoading || isPending}
        className={`rounded-full ${isLoading || isPending ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} px-3 py-1 text-sm font-medium text-white transition-colors`}
      >
        {isLoading ? 'Processing...' : 'Approve'}
      </button>
      <button
        onClick={() => handleStatusUpdate('rejected')}
        disabled={isLoading || isPending}
        className={`rounded-full ${isLoading || isPending ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'} px-3 py-1 text-sm font-medium text-white transition-colors`}
      >
        {isLoading ? 'Processing...' : 'Reject'}
      </button>
    </div>
  )
} 
