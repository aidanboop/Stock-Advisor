import { fetchMultipleStocks, TECH_STOCKS, SECTORS, STOCK_INDICES } from './stockData';

let refreshInterval = null;
let apiCallsInLastMinute = 0;
let lastApiCallReset = Date.now();
const MAX_CALLS_PER_MINUTE = 5; 
const REFRESH_INTERVAL = 60000; // Default is 60 seconds between symbol updates

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
 * Check if the market is closed (weekend or outside trading hours)
 * This helps us adjust refresh strategy
 * @returns {boolean} Whether the market is closed
 */
const isMarketClosed = () => {
  const now = new Date();
  const estOptions = { timeZone: 'America/New_York' };
  
  // Convert to EST
  const estTime = new Date(now.toLocaleString('en-US', estOptions));
  const day = estTime.getDay(); // 0 is Sunday, 6 is Saturday
  const hour = estTime.getHours();
  
  // Weekend check
  if (day === 0 || day === 6) {
    return true;
  }
  
  // Outside of trading hours (9:30 AM - 4:00 PM EST)
  if (hour < 9 || hour >= 16 || (hour === 9 && estTime.getMinutes() < 30)) {
    return true;
  }
  
  return false;
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
  
  return apiCallsInLastMinute < MAX_CALLS_PER_MINUTE;
};

/**
 * Record an API call to track rate limits
 */
const recordApiCall = () => {
  apiCallsInLastMinute++;
};

// Track the current symbol index to rotate through
let currentCycleIndex = 0;

/**
 * Get the next symbol(s) to refresh in the current cycle
 * We use a round-robin approach to refresh one symbol at a time
 * @returns {Array} Symbols to refresh in this cycle
 */
function getSymbolsForCurrentCycle() {
  const allSymbols = [...STOCK_INDICES, ...TECH_STOCKS, ...SECTORS];
  
  // Get just one symbol at a time to minimize API calls
  const symbolsToRefresh = [allSymbols[currentCycleIndex % allSymbols.length]];
  
  // Move to next symbol for next cycle
  currentCycleIndex++;
  
  return symbolsToRefresh;
}

/**
 * Start real-time data refresh with rate limiting
 * Uses end-of-day data as base with incremental updates
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
  
  // Function to refresh data for the next symbol in rotation
  const refreshNextSymbol = async () => {
    const estTime = getEstTimeString();
    const marketClosed = isMarketClosed();
    
    // Log info about refresh cycle
    console.log(`[${estTime} EST] Starting end-of-day data refresh cycle...`);
    
    if (marketClosed) {
      console.log(`[${estTime} EST] Market is currently closed, using end-of-day data`);
    }
    
    // Check if we can make an API call (rate limiting)
    if (!canMakeApiCall()) {
      console.warn(`[${getEstTimeString()} EST] Skipping refresh due to rate limiting`);
      
      // Execute callback with status if provided
      if (typeof onRefresh === 'function') {
        onRefresh({ 
          status: 'rate_limited', 
          message: 'Rate limit reached, using cached end-of-day data' 
        });
      }
      
      return;
    }
    
    try {
      // Record the API call
      recordApiCall();
      
      // Get the next symbol(s) to refresh in rotation
      const symbolsToRefresh = getSymbolsForCurrentCycle();
      
      // Force refresh of selected data
      await fetchMultipleStocks(symbolsToRefresh, true);
      
      console.log(`[${getEstTimeString()} EST] End-of-day data refresh completed for ${symbolsToRefresh.join(', ')}`);
      
      // Execute callback if provided
      if (typeof onRefresh === 'function') {
        onRefresh({ 
          status: 'success', 
          symbols: symbolsToRefresh,
          marketClosed: marketClosed
        });
      }
    } catch (error) {
      console.error(`[${getEstTimeString()} EST] Error during data refresh:`, error);
      
      // Execute callback with error if provided
      if (typeof onRefresh === 'function') {
        onRefresh({ 
          status: 'error', 
          error: error.message,
          marketClosed: marketClosed
        });
      }
    }
  };
  
  // Run initial refresh (don't need to wait since we'll return immediately)
  setTimeout(refreshNextSymbol, 100);
  
  // Set up refresh interval based on provided seconds
  refreshInterval = setInterval(refreshNextSymbol, intervalMs);
  
  // Return control object
  return {
    stop: () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
        console.log(`[${getEstTimeString()} EST] End-of-day data refresh stopped`);
      }
    },
    forceRefresh: async () => {
      // Only force refresh if we can make an API call
      if (canMakeApiCall()) {
        return await refreshNextSymbol();
      } else {
        console.warn(`[${getEstTimeString()} EST] Cannot force refresh due to rate limiting`);
        return { 
          status: 'rate_limited', 
          message: 'Rate limit reached, try again later',
          marketClosed: isMarketClosed()
        };
      }
    },
    getStatus: () => {
      return {
        active: refreshInterval !== null,
        apiCallsInLastMinute,
        nextReset: new Date(lastApiCallReset + 60000).toISOString(),
        canMakeApiCall: canMakeApiCall(),
        marketClosed: isMarketClosed()
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
  console.log('Using incremental end-of-day data updates instead of hourly refresh');
  return startRealTimeRefresh(onRefresh, 60);
};

/**
 * Stop all data refresh
 */
export const stopRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log(`[${getEstTimeString()} EST] End-of-day data refresh stopped`);
  }
};

/**
 * Check if refresh is active
 * @returns {boolean} True if refresh is active
 */
export const isRefreshActive = () => {
  return refreshInterval !== null;
};
