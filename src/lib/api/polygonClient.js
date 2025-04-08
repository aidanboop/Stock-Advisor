/**
 * Polygon.io API client using the official client library
 * Enhanced with better error handling and fallback mechanisms
 */

import { restClient } from '@polygon.io/client-js';

// API key from environment variables
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

// Initialize the REST client
const polygonClient = restClient(POLYGON_API_KEY);

// Cache for API responses to minimize API calls
const responseCache = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds cache time

/**
 * Check if API key is available and valid
 * @returns {boolean} Whether API key is valid
 */
export const validateApiKey = () => {
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

/**
 * Wrapper for API calls with caching and error handling
 * @param {Function} apiCall - Function that calls Polygon API
 * @param {string} cacheKey - Key for caching
 * @param {boolean} forceRefresh - Whether to bypass cache
 * @returns {Promise<Object>} API response
 */
const callWithCache = async (apiCall, cacheKey, forceRefresh = false) => {
  // Check cache first
  if (!forceRefresh && responseCache.has(cacheKey)) {
    const cachedData = responseCache.get(cacheKey);
    if (Date.now() < cachedData.expiry) {
      return cachedData.data;
    }
    responseCache.delete(cacheKey);
  }

  try {
    // Call the API
    const response = await apiCall();

    // Store in cache with expiry
    responseCache.set(cacheKey, {
      data: response,
      expiry: Date.now() + CACHE_TTL
    });

    return response;
  } catch (error) {
    console.error(`Polygon API error for ${cacheKey}:`, error);
    throw error;
  }
};

/**
 * Get stock aggregates (candlestick) data
 * @param {string} symbol - Stock symbol
 * @param {Object} options - Options for aggregates
 * @param {boolean} forceRefresh - Whether to bypass cache
 * @returns {Promise<Object>} Aggregates data
 */
export const getStockAggregates = async (symbol, options = {}, forceRefresh = false) => {
  const defaultOptions = {
    multiplier: 1,
    timespan: 'day',
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    to: new Date().toISOString().split('T')[0], // Today
    adjusted: true,
    sort: 'asc',
    limit: 120
  };

  const params = { ...defaultOptions, ...options };
  const cacheKey = `aggs-${symbol}-${params.multiplier}-${params.timespan}-${params.from}-${params.to}`;

  return callWithCache(
      () => polygonClient.stocks.aggregates(symbol, params.multiplier, params.timespan, params.from, params.to, params),
      cacheKey,
      forceRefresh
  );
};

/**
 * Get previous day close for a stock
 * @param {string} symbol - Stock symbol
 * @param {boolean} forceRefresh - Whether to bypass cache
 * @returns {Promise<Object>} Previous close data
 */
export const getPreviousClose = async (symbol, forceRefresh = false) => {
  const cacheKey = `prevclose-${symbol}`;

  return callWithCache(
      () => polygonClient.stocks.previousClose(symbol),
      cacheKey,
      forceRefresh
  );
};

/**
 * Get ticker details
 * @param {string} symbol - Stock symbol
 * @param {boolean} forceRefresh - Whether to bypass cache
 * @returns {Promise<Object>} Ticker details
 */
export const getTickerDetails = async (symbol, forceRefresh = false) => {
  const cacheKey = `ticker-${symbol}`;

  return callWithCache(
      () => polygonClient.reference.tickerDetails(symbol),
      cacheKey,
      forceRefresh
  );
};

/**
 * Get insider transactions for a stock
 * @param {string} symbol - Stock symbol
 * @param {boolean} forceRefresh - Whether to bypass cache
 * @returns {Promise<Object>} Insider transactions
 */
export const getInsiderTransactions = async (symbol, forceRefresh = false) => {
  const cacheKey = `insider-${symbol}`;

  return callWithCache(
      () => polygonClient.reference.stockInsiderTransactions({ ticker: symbol, limit: 50 }),
      cacheKey,
      forceRefresh
  );
};

/**
 * Get current market status
 * @param {boolean} forceRefresh - Whether to bypass cache
 * @returns {Promise<Object>} Market status
 */
export const getMarketStatus = async (forceRefresh = false) => {
  const cacheKey = 'market-status';

  return callWithCache(
      () => polygonClient.reference.marketStatus(),
      cacheKey,
      forceRefresh
  );
};

/**
 * Get technical indicators for a stock
 * @param {string} symbol - Stock symbol
 * @param {string} indicator - Indicator type (sma, ema, rsi, macd)
 * @param {Object} params - Parameters for the indicator
 * @param {boolean} forceRefresh - Whether to bypass cache
 * @returns {Promise<Object>} Technical indicator data
 */
export const getTechnicalIndicators = async (symbol, indicator = 'sma', params = {}, forceRefresh = false) => {
  // Default parameters
  const defaultParams = {
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    timespan: 'day',
    adjusted: true,
    window: 14,
    series_type: 'close'
  };

  const finalParams = { ...defaultParams, ...params, stockTicker: symbol };
  const cacheKey = `indicator-${symbol}-${indicator}-${JSON.stringify(finalParams)}`;

  // Map to the corresponding indicator method
  let apiCall;
  switch (indicator.toLowerCase()) {
    case 'sma':
      apiCall = () => polygonClient.indicators.sma(finalParams);
      break;
    case 'ema':
      apiCall = () => polygonClient.indicators.ema(finalParams);
      break;
    case 'rsi':
      apiCall = () => polygonClient.indicators.rsi(finalParams);
      break;
    case 'macd':
      apiCall = () => polygonClient.indicators.macd(finalParams);
      break;
    default:
      throw new Error(`Unsupported indicator: ${indicator}`);
  }

  return callWithCache(apiCall, cacheKey, forceRefresh);
};

/**
 * Fetch comprehensive stock data (combines multiple API calls)
 * @param {string} symbol - Stock symbol
 * @param {boolean} forceRefresh - Whether to bypass cache
 * @returns {Promise<Object>} Comprehensive stock data
 */
export const getComprehensiveStockData = async (symbol, forceRefresh = false) => {
  try {
    // Check if symbol is a market index or ETF (which may not have insider transactions)
    const isEtfOrIndex = ['SPY', 'QQQ', 'DIA', 'IWM', 'VIX', 'XLK', 'XLF', 'XLV', 'XLE', 'XLY', 'XLP', 'XLI', 'XLB', 'XLU', 'XLRE'].includes(symbol.toUpperCase());

    // Use Promise.allSettled to get as much data as possible, even if some calls fail
    const apiCalls = [
      getStockAggregates(symbol, {}, forceRefresh).catch(err => {
        console.error(`Error fetching aggregates for ${symbol}:`, err);
        return null;
      }),
      getTickerDetails(symbol, forceRefresh).catch(err => {
        console.error(`Error fetching ticker details for ${symbol}:`, err);
        return null;
      })
    ];

    // Only add insider transactions call for regular stocks (not ETFs or indices)
    if (!isEtfOrIndex) {
      apiCalls.push(
          getInsiderTransactions(symbol, forceRefresh).catch(err => {
            console.error(`Error fetching insider transactions for ${symbol}:`, err);
            return null;
          })
      );
    }

    // Add a technical indicator call (SMA)
    apiCalls.push(
        getTechnicalIndicators(symbol, 'sma', { window: 20 }, forceRefresh).catch(err => {
          console.error(`Error fetching SMA indicator for ${symbol}:`, err);
          return null;
        })
    );

    const results = await Promise.all(apiCalls);

    // Extract values
    const aggregatesData = results[0];
    const tickerDetailsData = results[1];
    const insiderTransactionsData = isEtfOrIndex ? null : results[2];
    const technicalIndicatorData = results[isEtfOrIndex ? 2 : 3];

    return {
      symbol,
      aggregatesData,
      tickerDetailsData,
      insiderTransactionsData,
      technicalIndicatorData
    };
  } catch (error) {
    console.error(`Error fetching comprehensive data for ${symbol}:`, error);
    throw error;
  }
};