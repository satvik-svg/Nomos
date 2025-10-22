/**
 * Simple cache for creator status
 * Since we've verified the address is registered, we can cache this
 */

export function setCreatorStatusCache(accountId: string, evmAddress: string, isCreator: boolean): void {
  if (typeof window === 'undefined') return;
  
  const cacheKey = `creator_status_${accountId}_${evmAddress}`;
  localStorage.setItem(cacheKey, JSON.stringify({
    isCreator,
    timestamp: Date.now(),
    evmAddress,
  }));
  
  console.log('Creator status cached:', { accountId, evmAddress, isCreator });
}

export function getCreatorStatusCache(accountId: string, evmAddress: string): boolean | null {
  if (typeof window === 'undefined') return null;
  
  const cacheKey = `creator_status_${accountId}_${evmAddress}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (!cached) return null;
  
  try {
    const data = JSON.parse(cached);
    // Cache is valid for 24 hours
    const isValid = Date.now() - data.timestamp < 24 * 60 * 60 * 1000;
    
    if (isValid) {
      console.log('Using cached creator status:', data);
      return data.isCreator;
    }
  } catch (error) {
    console.error('Error reading creator status cache:', error);
  }
  
  return null;
}

export function clearCreatorStatusCache(accountId: string): void {
  if (typeof window === 'undefined') return;
  
  // Clear all cache entries for this account
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(`creator_status_${accountId}_`)) {
      localStorage.removeItem(key);
    }
  });
  
  console.log('Creator status cache cleared for:', accountId);
}
