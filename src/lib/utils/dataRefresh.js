/**
 * Real-time data refresh functionality
 */

import { fetchMultipleStocks, TECH_STOCKS, SECTORS, STOCK_INDICES } from './stockData';

// Track the refresh interval
let refreshInterval = null;

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
 * Start real-time data refresh
 * @param {Function} onRefresh - Callback function to execute after each refresh
 * @param {number} intervalSeconds - Seconds between refreshes (default: 30 seconds)
 * @returns {Object} Control object with stop function
 */
export const startRealTimeRefresh = (onRefresh, intervalSeconds = 30) => {
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
    
    try {
      // Combine all symbols to refresh
      const allSymbols = [...new Set([...TECH_STOCKS, ...SECTORS, ...STOCK_INDICES])];
      
      // Force refresh of all data
      await fetchMultipleStocks(allSymbols, true);
      
      console.log(`[${getEstTimeString()} EST] Data refresh completed successfully`);
      
      // Execute callback if provided
      if (typeof onRefresh === 'function') {
        onRefresh();
      }
    } catch (error) {
      console.error(`[${getEstTimeString()} EST] Error during real-time refresh:`, error);
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
    forceRefresh: refreshAllData
  };
};

/**
 * Start hourly data refresh (legacy support)
 * @param {Function} onRefresh - Callback function to execute after each refresh
 * @returns {Object} Control object with stop function
 */
export const startHourlyRefresh = (onRefresh) => {
  // For backward compatibility, call startRealTimeRefresh with 30 seconds
  console.log('Using real-time refresh instead of hourly refresh');
  return startRealTimeRefresh(onRefresh, 30);
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
