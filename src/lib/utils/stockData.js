/**
 * Stock data management utilities using Polygon.io API
 * Enhanced with better fallback mechanisms
 */

import { getComprehensiveStockData } from '../api/polygonClient';
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
  'SPY',  // S&P 500 ETF
  'DIA',  // Dow Jones Industrial Average ETF
  'QQQ',  // NASDAQ-100 ETF
  'IWM',  // Russell 2000 ETF
  'VIX',  // Volatility Index
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
const CACHE_EXPIRY_MS = 30 * 1000; // 30 seconds to match refresh interval

// Control whether to use mock data
let useMockData = false;

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
 * Try to fetch data from API, fall back to mock if needed
 * @param {string} symbol - Stock symbol
 * @returns {Object} Stock data
 */
const getDataWithFallback = async (symbol) => {
  // If explicitly using mock data, return it immediately
  if (useMockData) {
    const mockStock = getMockStockData(symbol);
    if (mockStock) return mockStock;
  }
  
  try {
    // Try to fetch real data from API
    const stockData = await getComprehensiveStockData(symbol);
    
    // Check if we got any actual data back
    const hasData = stockData && (
      stockData.aggregatesData || 
      stockData.tickerDetailsData || 
      stockData.insiderTransactionsData
    );
    
    // If we didn't get any data, fall back to mock
    if (!hasData) {
      console.warn(`No data returned for ${symbol}, falling back to mock data`);
      const mockStock = getMockStockData(symbol);
      if (mockStock) return mockStock;
    }
    
    // Generate recommendation from whatever data we have
    const recommendation = generateBuyRecommendation(stockData);
    
    return recommendation;
  } catch (error) {
    console.error(`API error for ${symbol}, falling back to mock data:`, error);
    
    // Fall back to mock data
    const mockStock = getMockStockData(symbol);
    if (mockStock) return mockStock;
    
    // If no mock data available, return minimal data
    return createMinimalStockData(symbol);
  }
};

/**
 * Create minimal stock data when all else fails
 * @param {string} symbol - Stock symbol
 * @returns {Object} Minimal stock data
 */
const createMinimalStockData = (symbol) => {
  return {
    symbol,
    name: getReadableName(symbol),
    score: 50,
    recommendation: 'HOLD',
    lastUpdated: new Date().toISOString(),
    keyReasons: ['Insufficient data available for a strong recommendation'],
    analysis: {
      technical: { score: 50, reasons: ['Insufficient price data'] },
      insider: { score: 50, reasons: ['No insider trading data available'] },
      price: { score: 50, reasons: ['Insufficient price history'] }
    },
    metadata: {
      price: null,
      currency: 'USD',
      exchange: 'Unknown'
    }
  };
};

/**
 * Get a readable name from a stock symbol
 * @param {string} symbol - Stock symbol
 * @returns {string} Readable name
 */
const getReadableName = (symbol) => {
  // ETFs and indices
  const etfNames = {
    'SPY': 'S&P 500 ETF',
    'QQQ': 'NASDAQ-100 ETF',
    'DIA': 'Dow Jones Industrial Average ETF',
    'IWM': 'Russell 2000 ETF',
    'VIX': 'CBOE Volatility Index',
    'XLK': 'Technology Sector ETF',
    'XLF': 'Financial Sector ETF',
    'XLV': 'Healthcare Sector ETF',
    'XLE': 'Energy Sector ETF',
    'XLY': 'Consumer Discretionary Sector ETF',
    'XLP': 'Consumer Staples Sector ETF',
    'XLI': 'Industrial Sector ETF',
    'XLB': 'Materials Sector ETF',
    'XLU': 'Utilities Sector ETF',
    'XLRE': 'Real Estate Sector ETF'
  };
  
  // Common stocks
  const stockNames = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'META': 'Meta Platforms Inc.',
    'NVDA': 'NVIDIA Corporation',
    'TSLA': 'Tesla Inc.',
    'INTC': 'Intel Corporation',
    'AMD': 'Advanced Micro Devices Inc.',
    'CRM': 'Salesforce Inc.',
    'ADBE': 'Adobe Inc.',
    'ORCL': 'Oracle Corporation',
    'CSCO': 'Cisco Systems Inc.',
    'IBM': 'International Business Machines',
    'PYPL': 'PayPal Holdings Inc.',
    'NFLX': 'Netflix Inc.',
    'QCOM': 'Qualcomm Inc.',
    'TXN': 'Texas Instruments Inc.',
    'MU': 'Micron Technology Inc.',
    'AMAT': 'Applied Materials Inc.'
  };
  
  // Check ETF/index first, then stock
  const name = etfNames[symbol] || stockNames[symbol];
  
  // If we don't have a name, generate one
  if (!name) {
    return `${symbol} Inc.`;
  }
  
  return name;
};

/**
 * Get mock data for a stock symbol
 * @param {string} symbol - Stock symbol
 * @returns {Object|null} Mock stock data or null if not found
 */
const getMockStockData = (symbol) => {
  // Find in mock data
  const mockStock = [...mockTechRecommendations, ...mockAllRecommendations].find(
    stock => stock.symbol === symbol
  );
  
  if (mockStock) return mockStock;
  
  // For indices
  if (STOCK_INDICES.includes(symbol)) {
    const mockIndex = mockMarketOverview.indices.find(i => i.symbol === symbol);
    if (mockIndex) return mockIndex;
  }
  
  // For sectors
  if (SECTORS.includes(symbol)) {
    const mockSector = mockMarketOverview.sectors.find(s => s.symbol === symbol);
    if (mockSector) return mockSector;
  }
  
  // Generic mock data for unknown symbols
  return {
    symbol,
    name: getReadableName(symbol),
    score: Math.floor(Math.random() * 30) + 50, // Random score between 50-80
    recommendation: 'HOLD',
    lastUpdated: new Date().toISOString(),
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
};

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
    // Get data with fallback
    const stockData = await getDataWithFallback(symbol);
    
    // Update cache
    stockDataCache[cacheKey] = stockData;
    lastCacheRefresh = now;
    
    return stockData;
  } catch (error) {
    console.error(`Failed to fetch data for ${symbol}:`, error);
    
    // Try to return cached data even if expired
    if (stockDataCache[cacheKey]) {
      console.warn(`Returning expired cached data for ${symbol}`);
      return stockDataCache[cacheKey];
    }
    
    // Last resort: return mock data
    return getMockStockData(symbol);
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
    const batchSize = 3; // Reduced batch size to avoid rate limits
    const results = [];
    
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      
      // Use Promise.all instead of allSettled to catch individual errors
      const batchPromises = batch.map(symbol => 
        fetchStockData(symbol, forceRefresh)
          .catch(error => {
            console.error(`Error fetching data for ${symbol}:`, error);
            // Return mock data on error
            return getMockStockData(symbol);
          })
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add a larger delay between batches to avoid rate limiting
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error fetching multiple stocks:', error);
    
    // Handle different fallbacks based on what we're fetching
    if (symbols.some(symbol => STOCK_INDICES.includes(symbol))) {
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
 * Get top stock recommendations
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
    const symbolsToAnalyze = techOnly ? TECH_STOCKS.slice(0, 10) : [...TECH_STOCKS.slice(0, 5), ...SECTORS.slice(0, 5)];
    
    // Fetch data for all stocks
    const stockData = await fetchMultipleStocks(symbolsToAnalyze);
    
    // Sort by recommendation score (highest first)
    const sortedStocks = stockData.sort((a, b) => b.score - a.score);
    
    // Filter to only include BUY or STRONG_BUY recommendations
    const buyRecommendations = sortedStocks.filter(stock => 
      stock.recommendation === 'BUY' || stock.recommendation === 'STRONG_BUY'
    );
    
    // Return top N recommendations or all recommendations if fewer than limit
    return buyRecommendations.length > 0
      ? buyRecommendations.slice(0, limit)
      : sortedStocks.slice(0, limit); // If no BUY recommendations, return the highest scored stocks
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
 * Get market overview data
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
    
    // Fetch data for major indices (use a subset to avoid rate limits)
    const indicesData = await fetchMultipleStocks(STOCK_INDICES.slice(0, 3));
    
    // Fetch data for major sectors (use a subset to avoid rate limits)
    const sectorsData = await fetchMultipleStocks(SECTORS.slice(0, 5));
    
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
