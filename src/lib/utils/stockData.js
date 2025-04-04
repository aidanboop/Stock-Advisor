/**
 * Stock data management utilities
 */

import { getComprehensiveStockData } from '../api/yahooFinance';
import { generateBuyRecommendation } from './stockAnalysis';

// List of major US tech stocks to track
export const TECH_STOCKS = [
  'AAPL',  // Apple
  'MSFT',  // Microsoft
  'GOOGL', // Alphabet (Google)
  'AMZN',  // Amazon
  'META',  // Meta (Facebook)
  'NVDA',  // NVIDIA
  'TSLA',  // Tesla
  'INTC',  // Intel
  'AMD',   // Advanced Micro Devices
  'CRM',   // Salesforce
  'ADBE',  // Adobe
  'ORCL',  // Oracle
  'CSCO',  // Cisco
  'IBM',   // IBM
  'PYPL',  // PayPal
  'NFLX',  // Netflix
  'QCOM',  // Qualcomm
  'TXN',   // Texas Instruments
  'MU',    // Micron Technology
  'AMAT',  // Applied Materials
];

// List of major US stock indices
export const STOCK_INDICES = [
  '^GSPC', // S&P 500
  '^DJI',  // Dow Jones Industrial Average
  '^IXIC', // NASDAQ Composite
  '^RUT',  // Russell 2000
  '^VIX',  // CBOE Volatility Index
];

// List of major US sectors
export const SECTORS = [
  'XLK',   // Technology
  'XLF',   // Financial
  'XLV',   // Healthcare
  'XLE',   // Energy
  'XLY',   // Consumer Discretionary
  'XLP',   // Consumer Staples
  'XLI',   // Industrial
  'XLB',   // Materials
  'XLU',   // Utilities
  'XLRE',  // Real Estate
];

// Cache for stock data to minimize API calls
let stockDataCache = {};
let lastCacheRefresh = null;
const CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour cache expiry

/**
 * Fetch data for a single stock
 * @param {string} symbol - Stock symbol
 * @param {boolean} forceRefresh - Force refresh data even if cached
 * @returns {Promise<Object>} Stock data with recommendation
 */
export const fetchStockData = async (symbol, forceRefresh = false) => {
  const now = new Date();
  const cacheKey = symbol.toUpperCase();
  
  // Check if we have valid cached data
  if (
    !forceRefresh && 
    stockDataCache[cacheKey] && 
    lastCacheRefresh && 
    (now.getTime() - lastCacheRefresh.getTime() < CACHE_EXPIRY_MS)
  ) {
    return stockDataCache[cacheKey];
  }
  
  try {
    // Fetch fresh data
    const stockData = await getComprehensiveStockData(symbol);
    const recommendation = generateBuyRecommendation(stockData);
    
    // Update cache
    stockDataCache[cacheKey] = recommendation;
    lastCacheRefresh = now;
    
    return recommendation;
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Fetch data for multiple stocks
 * @param {Array<string>} symbols - Array of stock symbols
 * @param {boolean} forceRefresh - Force refresh data even if cached
 * @returns {Promise<Array<Object>>} Array of stock data with recommendations
 */
export const fetchMultipleStocks = async (symbols, forceRefresh = false) => {
  try {
    // Process in batches to avoid overwhelming the API
    const batchSize = 5;
    const results = [];
    
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      const batchPromises = batch.map(symbol => fetchStockData(symbol, forceRefresh));
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Filter out rejected promises and add fulfilled ones to results
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`Failed to fetch data for ${batch[index]}:`, result.reason);
        }
      });
    }
    
    return results;
  } catch (error) {
    console.error('Error fetching multiple stocks:', error);
    throw error;
  }
};

/**
 * Get top stock recommendations
 * @param {number} limit - Maximum number of recommendations to return
 * @param {boolean} techOnly - Whether to only include tech stocks
 * @returns {Promise<Array<Object>>} Array of top stock recommendations
 */
export const getTopRecommendations = async (limit = 5, techOnly = false) => {
  try {
    // Determine which stocks to analyze
    const symbolsToAnalyze = techOnly ? TECH_STOCKS : [...TECH_STOCKS, ...SECTORS];
    
    // Fetch data for all stocks
    const stockData = await fetchMultipleStocks(symbolsToAnalyze);
    
    // Sort by recommendation score (highest first)
    const sortedStocks = stockData.sort((a, b) => b.score - a.score);
    
    // Filter to only include BUY or STRONG_BUY recommendations
    const buyRecommendations = sortedStocks.filter(stock => 
      stock.recommendation === 'BUY' || stock.recommendation === 'STRONG_BUY'
    );
    
    // Return top N recommendations
    return buyRecommendations.slice(0, limit);
  } catch (error) {
    console.error('Error getting top recommendations:', error);
    throw error;
  }
};

/**
 * Get market overview data
 * @returns {Promise<Object>} Market overview data
 */
export const getMarketOverview = async () => {
  try {
    // Fetch data for major indices
    const indicesData = await fetchMultipleStocks(STOCK_INDICES);
    
    // Fetch data for major sectors
    const sectorsData = await fetchMultipleStocks(SECTORS);
    
    return {
      indices: indicesData,
      sectors: sectorsData,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting market overview:', error);
    throw error;
  }
};
