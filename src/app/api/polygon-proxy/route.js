/**
 * API proxy to handle Polygon.io API requests
 * Enhanced with improved error handling and response validation
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Polygon.io API base URL
const POLYGON_BASE_URL = 'https://api.polygon.io';

// Get API key from environment variable
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

// Define response headers
const RESPONSE_HEADERS = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Content-Type': 'application/json'
};

/**
 * Add API key to URL
 * @param {string} url - API URL
 * @returns {string} URL with API key
 */
function addApiKey(url) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}apiKey=${POLYGON_API_KEY}`;
}

/**
 * Enhanced fetch with better error handling
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - JSON response or error
 */
async function enhancedFetch(url, options = {}) {
  // Set up AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
  
  try {
    // Log request
    console.log(`Fetching from Polygon.io: ${url}`);
    
    // Set default fetch options
    const fetchOptions = {
      headers: {
        'User-Agent': 'Stock-Advisor-App/1.0',
        'Accept': 'application/json'
      },
      timeout: 10000,
      ...options,
      signal: controller.signal
    };
    
    // Make the request
    const response = await fetch(url, fetchOptions);
    
    // Clear timeout
    clearTimeout(timeoutId);
    
    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error from Polygon.io! Status: ${response.status}, Response: ${errorText.substring(0, 200)}...`);
      throw new Error(`HTTP error! Status: ${response.status}, message: ${errorText.substring(0, 100)}...`);
    }
    
    // Parse JSON response
    const text = await response.text();
    if (!text.trim()) {
      throw new Error('Polygon.io API returned empty response');
    }
    
    try {
      const data = JSON.parse(text);
      
      // Check for Polygon.io API error
      if (data.status === 'ERROR') {
        throw new Error(data.error || 'Polygon.io API returned an error');
      }
      
      return data;
    } catch (parseError) {
      console.error('Failed to parse Polygon.io response as JSON:', parseError);
      throw new Error(`Invalid JSON response from Polygon.io: ${text.substring(0, 100)}...`);
    }
  } catch (error) {
    // Clear timeout
    clearTimeout(timeoutId);
    
    // Handle AbortController timeout
    if (error.name === 'AbortError') {
      throw new Error('Polygon.io API request timed out after 10 seconds');
    }
    
    // Re-throw the error
    throw error;
  }
}

/**
 * Special handling for ETF and index symbols that don't have insider data
 * @param {string} symbol - Stock symbol
 * @returns {boolean} - Whether symbol is an ETF/index
 */
function isEtfOrIndex(symbol) {
  const etfAndIndices = ['SPY', 'QQQ', 'DIA', 'IWM', 'VIX', 'XLK', 'XLF', 'XLV', 'XLE', 'XLY', 'XLP', 'XLI', 'XLB', 'XLU', 'XLRE'];
  return etfAndIndices.includes(symbol.toUpperCase());
}

/**
 * Handle GET requests
 */
export async function GET(request) {
  try {
    // Get the path from the request URL
    const { pathname, searchParams } = new URL(request.url);
    
    // Extract the endpoint from the pathname
    // Path format: /api/polygon-proxy/{endpoint}
    const endpoint = pathname.replace('/api/polygon-proxy', '');
    
    // Handle different endpoints
    let polygonEndpoint = '';
    let data = null;
    
    // Convert search parameters to object
    const params = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    // Route to appropriate Polygon endpoint based on our endpoint
    if (endpoint.startsWith('/aggregates')) {
      // Format: /aggregates/{symbol}/{multiplier}/{timespan}/{from}/{to}
      try {
        data = await enhancedFetch(addApiKey(`${POLYGON_BASE_URL}/v2${endpoint}`), {});
      } catch (error) {
        // For some symbols, we'll return an empty result set rather than failing
        console.warn(`Aggregates error for ${endpoint}, returning empty result:`, error.message);
        
        // Extract symbol from path
        const pathParts = endpoint.split('/').filter(Boolean);
        if (pathParts.length >= 1) {
          const symbol = pathParts[0];
          
          // Return standardized empty result
          return NextResponse.json({
            success: true,
            data: {
              adjusted: true,
              queryCount: 0,
              request_id: "empty_result",
              results: [],
              ticker: symbol,
              resultsCount: 0,
              status: "OK",
              next_url: null
            },
            timestamp: new Date().toISOString()
          }, { headers: RESPONSE_HEADERS });
        }
        
        throw error;
      }
    }
    else if (endpoint.startsWith('/daily-open-close')) {
      // Format: /daily-open-close/{symbol}/{date}
      const parts = endpoint.split('/').filter(p => p);
      if (parts.length >= 3) {
        polygonEndpoint = `/v1/open-close/${parts[1]}/${parts[2]}`;
        data = await enhancedFetch(addApiKey(`${POLYGON_BASE_URL}${polygonEndpoint}`), {});
      } else {
        throw new Error('Invalid daily-open-close endpoint format');
      }
    }
    else if (endpoint.startsWith('/previous-close')) {
      // Format: /previous-close/{symbol}
      const parts = endpoint.split('/').filter(p => p);
      if (parts.length >= 2) {
        polygonEndpoint = `/v2/aggs/ticker/${parts[1]}/prev`;
        data = await enhancedFetch(addApiKey(`${POLYGON_BASE_URL}${polygonEndpoint}`), {});
      } else {
        throw new Error('Invalid previous-close endpoint format');
      }
    }
    else if (endpoint.startsWith('/ticker-details')) {
      // Format: /ticker-details/{symbol}
      const parts = endpoint.split('/').filter(p => p);
      if (parts.length >= 2) {
        const symbol = parts[1];
        
        try {
          polygonEndpoint = `/v3/reference/tickers/${symbol}`;
          data = await enhancedFetch(addApiKey(`${POLYGON_BASE_URL}${polygonEndpoint}`), {});
        } catch (error) {
          // For ETFs and indices, create minimal ticker data
          if (isEtfOrIndex(symbol)) {
            console.warn(`Ticker details error for ${symbol}, returning minimal data:`, error.message);
            
            // Return standardized minimal data
            return NextResponse.json({
              success: true,
              data: {
                results: {
                  ticker: symbol,
                  name: getEtfOrIndexName(symbol),
                  market: "stocks",
                  locale: "us",
                  primary_exchange: "ETF/INDEX",
                  type: isEtfOrIndex(symbol) ? "ETF" : "STOCK",
                  active: true,
                  currency_name: "usd",
                  cik: null,
                  composite_figi: null,
                  share_class_figi: null,
                  description: `${getEtfOrIndexName(symbol)} (${symbol})`
                },
                status: "OK"
              },
              timestamp: new Date().toISOString()
            }, { headers: RESPONSE_HEADERS });
          }
          
          throw error;
        }
      } else {
        throw new Error('Invalid ticker-details endpoint format');
      }
    }
    else if (endpoint.startsWith('/insider-transactions')) {
      // Format: /insider-transactions/{symbol}
      const parts = endpoint.split('/').filter(p => p);
      if (parts.length >= 2) {
        const symbol = parts[1];
        
        // ETFs and indices don't have insider transactions, return empty
        if (isEtfOrIndex(symbol)) {
          console.log(`Skipping insider transactions for ETF/Index ${symbol}`);
          
          // Return standardized empty data
          return NextResponse.json({
            success: true,
            data: {
              results: [],
              status: "OK",
              next_url: null
            },
            timestamp: new Date().toISOString()
          }, { headers: RESPONSE_HEADERS });
        }
        
        // Regular stock, fetch insider data
        polygonEndpoint = `/v2/reference/insiders/${symbol}`;
        data = await enhancedFetch(addApiKey(`${POLYGON_BASE_URL}${polygonEndpoint}`), {});
      } else {
        throw new Error('Invalid insider-transactions endpoint format');
      }
    }
    else if (endpoint.startsWith('/market-status')) {
      // Format: /market-status
      polygonEndpoint = '/v1/marketstatus/now';
      data = await enhancedFetch(addApiKey(`${POLYGON_BASE_URL}${polygonEndpoint}`), {});
    }
    else if (endpoint.startsWith('/indicators')) {
      // Format: /indicators/{indicator}/{symbol}
      const parts = endpoint.split('/').filter(p => p);
      if (parts.length >= 3) {
        polygonEndpoint = `/v1/indicators/${parts[1]}/${parts[2]}`;
        data = await enhancedFetch(addApiKey(`${POLYGON_BASE_URL}${polygonEndpoint}`), {});
      } else {
        throw new Error('Invalid indicators endpoint format');
      }
    }
    else {
      return NextResponse.json(
        {
          success: false,
          message: 'Unknown endpoint'
        },
        { status: 400, headers: RESPONSE_HEADERS }
      );
    }
    
    // Return successful response
    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    }, { headers: RESPONSE_HEADERS });
    
  } catch (error) {
    console.error('Polygon proxy error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch data from Polygon.io',
        error: {
          name: error.name,
          message: error.message
        }
      },
      { status: 500, headers: RESPONSE_HEADERS }
    );
  }
}

/**
 * Get friendly name for ETF or index
 * @param {string} symbol - ETF or index symbol
 * @returns {string} - Friendly name
 */
function getEtfOrIndexName(symbol) {
  const symbolMap = {
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
  
  return symbolMap[symbol.toUpperCase()] || `${symbol} ETF/Index`;
}
