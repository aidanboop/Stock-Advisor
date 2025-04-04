/**
 * Real-time data refresh functionality with rate limiting
 */

import { fetchMultipleStocks, TECH_STOCKS, SECTORS, STOCK_INDICES } from './stockData';

// Track the refresh interval
let refreshInterval = null;

// Track API calls to prevent rate limiting
let apiCallsInLastMinute = 0;
let lastApiCallReset = Date.now();
const MAX_CALLS_PER_MINUTE = 5; // Conservative limit for free Polygon.io tier

/**
 * Get current time in EST formatted string
 * @returns {string} Current EST time string
 */
const getEstTimeString = () => {
  const now = new Date();
  return now.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  });
};

/**
 * Check and reset API call counter if needed
 * @returns {boolean} Whether we can make another API call
 */
const canMakeApiCall = () => {
  const now = Date.now();
  
  // Reset counter if a minute has passed
  if (now - lastApiCallReset > 60000) {
    apiCallsInLastMinute = 0;
    lastApiCallReset = now;
  }
  
  // Check if we're under the limit
  return apiCallsInLastMinute < MAX_CALLS_PER_MINUTE;
};

/**
 * Record an API call
 */
const recordApiCall = () => {
  apiCallsInLastMinute++;
};

/**
 * Start real-time data refresh with rate limiting
 * @param {Function} onRefresh - Callback function to execute after each refresh
 * @param {number} intervalSeconds - Seconds between refreshes (default: 60 seconds)
 * @returns {Object} Control object with stop function
 */
export const startRealTimeRefresh = (onRefresh, intervalSeconds = 60) => {
  // Clear any existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  
  // Convert interval to milliseconds
  const intervalMs = intervalSeconds * 1000;
  
  // Function to refresh all stock data
  const refreshAllData = async () => {
    const estTime = getEstTimeString();
    console.log(`[${estTime} EST] Starting real-time data refresh...`);
    
    // Check if we can make an API call (rate limiting)
    if (!canMakeApiCall()) {
      console.warn(`[${getEstTimeString()} EST] Skipping refresh due to rate limiting`);
      
      // Execute callback with status if provided
      if (typeof onRefresh === 'function') {
        onRefresh({ status: 'rate_limited', message: 'Rate limit reached, using cached data' });
      }
      
      return;
    }
    
    try {
      // Record the API call
      recordApiCall();
      
      // Split symbols into smaller batches for better rate limiting
      // Only refresh indices and a subset of stocks each time
      const allSymbols = [...STOCK_INDICES]; // Always refresh indices
      
      // Alternate between tech stocks and sectors
      const isEvenMinute = Math.floor(Date.now() / 60000) % 2 === 0;
      const additionalSymbols = isEvenMinute ? 
        TECH_STOCKS.slice(0, 5) : // First 5 tech stocks on even minutes
        [...SECTORS.slice(0, 3), ...TECH_STOCKS.slice(5, 7)]; // Sectors and more tech stocks on odd minutes
      
      // Combine symbols for this refresh
      const symbolsToRefresh = [...allSymbols, ...additionalSymbols];
      
      // Force refresh of selected data
      await fetchMultipleStocks(symbolsToRefresh, true);
      
      console.log(`[${getEstTimeString()} EST] Data refresh completed successfully`);
      
      // Execute callback if provided
      if (typeof onRefresh === 'function') {
        onRefresh({ status: 'success', symbols: symbolsToRefresh });
      }
    } catch (error) {
      console.error(`[${getEstTimeString()} EST] Error during real-time refresh:`, error);
      
      // Execute callback with error if provided
      if (typeof onRefresh === 'function') {
        onRefresh({ status: 'error', error: error.message });
      }
    }
  };
  
  // Run initial refresh (don't need to wait since we'll return immediately)
  setTimeout(refreshAllData, 100);
  
  // Set up refresh interval based on provided seconds
  refreshInterval = setInterval(refreshAllData, intervalMs);
  
  // Return control object
  return {
    stop: () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
        console.log(`[${getEstTimeString()} EST] Real-time data refresh stopped`);
      }
    },
    forceRefresh: async () => {
      // Only force refresh if we can make an API call
      if (canMakeApiCall()) {
        return await refreshAllData();
      } else {
        console.warn(`[${getEstTimeString()} EST] Cannot force refresh due to rate limiting`);
        return { status: 'rate_limited', message: 'Rate limit reached, try again later' };
      }
    },
    getStatus: () => {
      return {
        active: refreshInterval !== null,
        apiCallsInLastMinute,
        nextReset: new Date(lastApiCallReset + 60000).toISOString(),
        canMakeApiCall: canMakeApiCall()
      };
    }
  };
};

/**
 * Start hourly data refresh (legacy support)
 * @param {Function} onRefresh - Callback function to execute after each refresh
 * @returns {Object} Control object with stop function
 */
export const startHourlyRefresh = (onRefresh) => {
  // For backward compatibility, call startRealTimeRefresh with 60 seconds
  console.log('Using real-time refresh instead of hourly refresh');
  return startRealTimeRefresh(onRefresh, 60);
};

/**
 * Stop all data refresh
 */
export const stopRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log(`[${getEstTimeString()} EST] Real-time data refresh stopped`);
  }
};

/**
 * Check if refresh is active
 * @returns {boolean} True if refresh is active
 */
export const isRefreshActive = () => {
  return refreshInterval !== null;
};
