/**
 * Updated stock data management utilities with mock data fallback
 * Place this file at: src/lib/utils/stockData.js (replacing the existing file)
 */

import { getComprehensiveStockData } from '../api/yahooFinance';
import { generateBuyRecommendation } from './stockAnalysis';
import { mockTechRecommendations, mockAllRecommendations, mockMarketOverview } from './mockData';

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

// Flag to determine if we should use mock data (for development or when API fails)
let useMockData = process.env.NODE_ENV === 'production'; // Default to using mock data in production

/**
 * Toggle between real and mock data
 * @param {boolean} useMock - Whether to use mock data
 */
export const setUseMockData = (useMock) => {
  useMockData = useMock;
  console.log(`Stock Advisor now using ${useMock ? 'mock' : 'real'} data`);
};

/**
 * Check if we're using mock data
 * @returns {boolean} Whether we're using mock data
 */
export const isUsingMockData = () => {
  return useMockData;
};

/**
 * Fetch data for a single stock with fallback to mock data
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
    // If using mock data, return it instead of calling the API
    if (useMockData) {
      // Find the symbol in mock data
      const mockData = [...mockTechRecommendations, ...mockAllRecommendations].find(
        stock => stock.symbol === symbol
      );
      
      if (mockData) {
        // Update cache
        stockDataCache[cacheKey] = mockData;
        lastCacheRefresh = now;
        return mockData;
      } else {
        // If symbol not found in mock data, return a generic mock
        const genericMock = {
          symbol,
          name: `${symbol} Inc.`,
          score: Math.floor(Math.random() * 30) + 50, // Random score between 50-80
          recommendation: 'HOLD',
          lastUpdated: now.toISOString(),
          keyReasons: ['Mock data - symbol not found in predefined mocks'],
          analysis: {
            technical: { score: 60 },
            insider: { score: 60 },
            price: { score: 60, dailyChange: 0 }
          },
          metadata: {
            price: 100.00,
            currency: 'USD',
            exchange: 'NYSE'
          }
        };
        
        stockDataCache[cacheKey] = genericMock;
        lastCacheRefresh = now;
        return genericMock;
      }
    }
    
    // Fetch fresh data from API
    const stockData = await getComprehensiveStockData(symbol);
    const recommendation = generateBuyRecommendation(stockData);
    
    // Update cache
    stockDataCache[cacheKey] = recommendation;
    lastCacheRefresh = now;
    
    return recommendation;
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    
    // On error, fall back to mock data if available
    const mockData = [...mockTechRecommendations, ...mockAllRecommendations].find(
      stock => stock.symbol === symbol
    );
    
    if (mockData) {
      console.warn(`Falling back to mock data for ${symbol}`);
      return mockData;
    }
    
    // If no mock data for this symbol, throw the error
    throw error;
  }
};

/**
 * Fetch data for multiple stocks with fallback to mock data
 * @param {Array<string>} symbols - Array of stock symbols
 * @param {boolean} forceRefresh - Force refresh data even if cached
 * @returns {Promise<Array<Object>>} Array of stock data with recommendations
 */
export const fetchMultipleStocks = async (symbols, forceRefresh = false) => {
  try {
    // If using mock data, return it directly
    if (useMockData) {
      const results = [];
      
      for (const symbol of symbols) {
        const mockData = [...mockTechRecommendations, ...mockAllRecommendations].find(
          stock => stock.symbol === symbol
        );
        
        if (mockData) {
          results.push(mockData);
        }
      }
      
      return results;
    }
    
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
    
    // Fall back to mock data on API failure
    if (symbols.some(symbol => symbol.startsWith('^'))) {
      // If fetching indices, return mock indices
      return mockMarketOverview.indices;
    } else if (symbols.some(symbol => SECTORS.includes(symbol))) {
      // If fetching sectors, return mock sectors
      return mockMarketOverview.sectors;
    } else if (symbols.some(symbol => TECH_STOCKS.includes(symbol))) {
      // If fetching tech stocks, return mock tech recommendations
      return mockTechRecommendations;
    } else {
      // For other symbols, return general recommendations
      return mockAllRecommendations;
    }
  }
};

/**
 * Get top stock recommendations with fallback to mock data
 * @param {number} limit - Maximum number of recommendations to return
 * @param {boolean} techOnly - Whether to only include tech stocks
 * @returns {Promise<Array<Object>>} Array of top stock recommendations
 */
export const getTopRecommendations = async (limit = 5, techOnly = false) => {
  try {
    // If using mock data, return it directly
    if (useMockData) {
      return techOnly 
        ? mockTechRecommendations.slice(0, limit)
        : mockAllRecommendations.slice(0, limit);
    }
    
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
    
    // Fall back to mock data
    console.warn('Falling back to mock data for recommendations');
    return techOnly 
      ? mockTechRecommendations.slice(0, limit)
      : mockAllRecommendations.slice(0, limit);
  }
};

/**
 * Get market overview data with fallback to mock data
 * @returns {Promise<Object>} Market overview data
 */
export const getMarketOverview = async () => {
  try {
    // If using mock data, return it directly
    if (useMockData) {
      return {
        ...mockMarketOverview,
        lastUpdated: new Date().toISOString()
      };
    }
    
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
    
    // Fall back to mock data
    console.warn('Falling back to mock data for market overview');
    return {
      ...mockMarketOverview,
      lastUpdated: new Date().toISOString()
    };
  }
};
