/**
 * Utility functions for managing cache in Next.js
 */

/**
 * Marks all pages as unstable (requiring revalidation) by adding a
 * timestamp to the routeCache. This is a hacky workaround but effective.
 */
export async function revalidateAllPages() {
  try {
    // Try using the API route method first, as it's more reliable in production
    const res = await fetch(`/api/revalidate-cache?secret=${process.env.REVALIDATION_SECRET}&path=*&t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
    });
    
    if (res.ok) {
      console.log('Successfully revalidated all pages via API route');
      return true;
    }
    
    console.warn('API route revalidation failed, falling back to client-side method');
    return false;
  } catch (error) {
    console.error('Error revalidating pages:', error);
    return false;
  }
}

/**
 * Clears browser cache for the application - only applies to client-side cache
 */
export function clearBrowserCache() {
  if (typeof window !== 'undefined') {
    // Attempt to clear the navigation cache
    if ('navigation' in window && 'clearPrefetchCache' in window.navigation) {
      // @ts-ignore - This is a new API not fully typed yet
      window.navigation.clearPrefetchCache();
    }
    
    // Force a refresh of the page with cache busting
    window.location.href = `${window.location.pathname}?t=${Date.now()}`;
  }
}

/**
 * Clears memory cache on the server - useful for development
 * Note: This doesn't impact production Vercel deployments but helps in development
 */
export function clearMemoryCache() {
  // This only works if running inside Next.js and with the appropriate version
  try {
    if (
      typeof global !== 'undefined' &&
      global.__NEXT_DATA__ &&
      global.__NEXT_DATA__.cache
    ) {
      global.__NEXT_DATA__.cache.reset();
      console.log('Memory cache cleared');
      return true;
    }
  } catch (e) {
    console.error('Error clearing memory cache:', e);
  }
  
  return false;
} 