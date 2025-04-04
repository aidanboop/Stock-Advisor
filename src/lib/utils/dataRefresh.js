/**
 * Scheduled data refresh functionality
 */

import { fetchMultipleStocks, TECH_STOCKS, SECTORS, STOCK_INDICES } from './stockData';

// Track the refresh interval
let refreshInterval = null;

/**
 * Start hourly data refresh
 * @param {Function} onRefresh - Callback function to execute after each refresh
 * @returns {Object} Control object with stop function
 */
export const startHourlyRefresh = (onRefresh) => {
  // Clear any existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  
  // Function to refresh all stock data
  const refreshAllData = async () => {
    console.log(`[${new Date().toISOString()}] Starting scheduled data refresh...`);
    
    try {
      // Combine all symbols to refresh
      const allSymbols = [...new Set([...TECH_STOCKS, ...SECTORS, ...STOCK_INDICES])];
      
      // Force refresh of all data
      await fetchMultipleStocks(allSymbols, true);
      
      console.log(`[${new Date().toISOString()}] Data refresh completed successfully`);
      
      // Execute callback if provided
      if (typeof onRefresh === 'function') {
        onRefresh();
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error during scheduled refresh:`, error);
    }
  };
  
  // Run initial refresh
  refreshAllData();
  
  // Set up hourly interval (3600000 ms = 1 hour)
  refreshInterval = setInterval(refreshAllData, 3600000);
  
  // Return control object
  return {
    stop: () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
        console.log(`[${new Date().toISOString()}] Scheduled data refresh stopped`);
      }
    },
    forceRefresh: refreshAllData
  };
};

/**
 * Stop hourly data refresh
 */
export const stopHourlyRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log(`[${new Date().toISOString()}] Scheduled data refresh stopped`);
  }
};

/**
 * Check if hourly refresh is active
 * @returns {boolean} True if refresh is active
 */
export const isRefreshActive = () => {
  return refreshInterval !== null;
};
