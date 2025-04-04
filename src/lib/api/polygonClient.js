/**
 * Polygon.io API client for Stock Advisor application
 * Enhanced with better API key handling and URL construction
 */

// Store API key in environment variable for security
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

// Check if API key is available and valid
const validateApiKey = () => {
  if (!POLYGON_API_KEY) {
    console.error('POLYGON_API_KEY is not defined in environment variables');
    return false;
  }
  
  if (POLYGON_API_KEY === 'your_polygon_api_key_here') {
    console.error('POLYGON_API_KEY is set to the example value. Please set a valid API key.');
    return false;
  }
  
  // Basic format validation (Polygon keys are typically alphanumeric)
  if (!/^[a-zA-Z0-9_]+$/.test(POLYGON_API_KEY)) {
    console.error('POLYGON_API_KEY appears to be in an invalid format');
    return false;
  }
  
  return true;
};

// Validate API key on module load
const isApiKeyValid = validateApiKey();

// Helper to get base URL in different environments
const getBaseUrl = () => {
  // In browser environment
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // In server environment
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    return appUrl;
  }
  
  // Fallback for local development
  return 'http://localhost:3000';
};

/**
 * Get stock aggregates (candlestick) data
 * @param {string} symbol - Stock symbol
 * @param {string} multiplier - Time multiplier (e.g., 1, 5, 15)
 * @param {string} timespan - Time span (minute, hour, day, week, month, quarter, year)
 * @param {string} from - From date (YYYY-MM-DD)
 * @param {string} to - To date (YYYY-MM-DD)
 * @returns {Promise<Object>} Aggregates data
 */
export const getStockAggregates = async (symbol, multiplier = 1, timespan = 'day', from, to) => {
  try {
    // Check API key validity
    if (!isApiKeyValid) {
      throw new Error('Invalid Polygon.io API key. Please check your environment variables.');
    }
    
    // Normalize parameters
    const normalizedSymbol = symbol.toUpperCase();
    
    // Calculate default date range if not provided (30 days)
    if (!to) {
      to = new Date().toISOString().split('T')[0]; // Today
    }
    
    if (!from) {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30); // 30 days ago
      from = fromDate.toISOString().split('T')[0];
    }
    
    // Construct URL with base URL
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/polygon-proxy/aggregates/${normalizedSymbol}/${multiplier}/${timespan}/${from}/${to}`;
    
    // Make the request
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch aggregate data');
    }
    
    return data.data;
  } catch (error) {
    console.error(`Error fetching aggregates for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Get daily open/close data for a stock
 * @param {string} symbol - Stock symbol
 * @param {string} date - Date in 'YYYY-MM-DD' format
 * @returns {Promise<Object>} Daily open/close data
 */
export const getDailyOpenClose = async (symbol, date) => {
  try {
    // Check API key validity
    if (!isApiKeyValid) {
      throw new Error('Invalid Polygon.io API key. Please check your environment variables.');
    }
    
    // Normalize parameters
    const normalizedSymbol = symbol.toUpperCase();
    
    // Use today's date if not provided
    if (!date) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1); // Yesterday to ensure market has closed
      date = yesterday.toISOString().split('T')[0];
    }
    
    // Construct URL with base URL
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/polygon-proxy/daily-open-close/${normalizedSymbol}/${date}`;
    
    // Make the request
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch daily open/close data');
    }
    
    return data.data;
  } catch (error) {
    console.error(`Error fetching daily open/close for ${symbol} on ${date}:`, error);
    throw error;
  }
};

/**
 * Get previous close data for a stock
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object>} Previous close data
 */
export const getPreviousClose = async (symbol) => {
  try {
    // Check API key validity
    if (!isApiKeyValid) {
      throw new Error('Invalid Polygon.io API key. Please check your environment variables.');
    }
    
    // Normalize parameters
    const normalizedSymbol = symbol.toUpperCase();
    
    // Construct URL with base URL
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/polygon-proxy/previous-close/${normalizedSymbol}`;
    
    // Make the request
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch previous close data');
    }
    
    return data.data;
  } catch (error) {
    console.error(`Error fetching previous close for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Get company details for a stock
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object>} Company details
 */
export const getTickerDetails = async (symbol) => {
  try {
    // Check API key validity
    if (!isApiKeyValid) {
      throw new Error('Invalid Polygon.io API key. Please check your environment variables.');
    }
    
    // Normalize parameters
    const normalizedSymbol = symbol.toUpperCase();
    
    // Construct URL with base URL
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/polygon-proxy/ticker-details/${normalizedSymbol}`;
    
    // Make the request
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch ticker details');
    }
    
    return data.data;
  } catch (error) {
    console.error(`Error fetching ticker details for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Get insider transactions for a stock
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object>} Insider transactions
 */
export const getInsiderTransactions = async (symbol) => {
  try {
    // Check API key validity
    if (!isApiKeyValid) {
      throw new Error('Invalid Polygon.io API key. Please check your environment variables.');
    }
    
    // Normalize parameters
    const normalizedSymbol = symbol.toUpperCase();
    
    // Construct URL with base URL
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/polygon-proxy/insider-transactions/${normalizedSymbol}`;
    
    // Make the request
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch insider transactions');
    }
    
    return data.data;
  } catch (error) {
    console.error(`Error fetching insider transactions for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Get market status
 * @returns {Promise<Object>} Market status
 */
export const getMarketStatus = async () => {
  try {
    // Check API key validity
    if (!isApiKeyValid) {
      throw new Error('Invalid Polygon.io API key. Please check your environment variables.');
    }
    
    // Construct URL with base URL
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/polygon-proxy/market-status`;
    
    // Make the request
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch market status');
    }
    
    return data.data;
  } catch (error) {
    console.error(`Error fetching market status:`, error);
    throw error;
  }
};

/**
 * Get technical indicators for a stock
 * @param {string} symbol - Stock symbol
 * @param {string} indicator - Technical indicator type (e.g., sma, ema, macd)
 * @param {Object} params - Additional parameters
 * @returns {Promise<Object>} Technical indicator data
 */
export const getTechnicalIndicators = async (symbol, indicator, params = {}) => {
  try {
    // Check API key validity
    if (!isApiKeyValid) {
      throw new Error('Invalid Polygon.io API key. Please check your environment variables.');
    }
    
    // Normalize parameters
    const normalizedSymbol = symbol.toUpperCase();
    
    // Construct URL with base URL
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/polygon-proxy/indicators/${indicator}/${normalizedSymbol}`;
    
    // Add additional parameters
    const queryParams = new URLSearchParams(params);
    
    // Make the request
    const response = await fetch(`${url}?${queryParams.toString()}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch technical indicators');
    }
    
    return data.data;
  } catch (error) {
    console.error(`Error fetching ${indicator} for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Fetch comprehensive stock data (combines multiple API calls)
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object>} Comprehensive stock data
 */
export const getComprehensiveStockData = async (symbol) => {
  try {
    // Check API key validity
    if (!isApiKeyValid) {
      throw new Error('Invalid Polygon.io API key. Please check your environment variables.');
    }
    
    // Since we might hit rate limits or have other issues, use Promise.allSettled
    // to get as much data as possible, even if some requests fail
    const [aggregatesResult, tickerDetailsResult, insiderTransactionsResult] = await Promise.allSettled([
      getStockAggregates(symbol),
      getTickerDetails(symbol),
      getInsiderTransactions(symbol),
    ]);
    
    // Extract values or null for each result
    const aggregatesData = aggregatesResult.status === 'fulfilled' ? aggregatesResult.value : null;
    const tickerDetailsData = tickerDetailsResult.status === 'fulfilled' ? tickerDetailsResult.value : null;
    const insiderTransactionsData = insiderTransactionsResult.status === 'fulfilled' ? insiderTransactionsResult.value : null;
    
    // Return whatever data we have
    return {
      symbol,
      aggregatesData,
      tickerDetailsData,
      insiderTransactionsData,
    };
  } catch (error) {
    console.error(`Error fetching comprehensive data for ${symbol}:`, error);
    throw error;
  }
};
