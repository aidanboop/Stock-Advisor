/**
 * API proxy to handle Polygon.io API requests
 * Place this file at: src/app/api/polygon-proxy/route.js
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
  'Expires': '0'
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
 * Get absolute URL for the current request
 * @param {Request} request - The incoming request
 * @returns {string} Base URL (protocol + hostname)
 */
function getBaseUrl(request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

/**
 * Fetch data from Polygon.io API
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Additional query parameters
 * @returns {Promise<Object>} API response
 */
async function fetchPolygonData(endpoint, params = {}) {
  try {
    // Build URL with query parameters
    let url = `${POLYGON_BASE_URL}${endpoint}`;
    
    // Add query parameters if provided
    if (Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      url += `?${queryParams.toString()}`;
    }
    
    // Add API key
    url = addApiKey(url);
    
    // Set request headers
    const headers = {
      'User-Agent': 'Stock-Advisor-App/1.0',
      'Accept': 'application/json'
    };
    
    // Make the request
    console.log(`Fetching from Polygon.io: ${endpoint}`);
    const response = await fetch(url, { 
      headers, 
      timeout: 10000 
    });
    
    // Check response
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    // Parse JSON response
    const data = await response.json();
    
    // Check for Polygon.io API error
    if (data.status === 'ERROR') {
      throw new Error(data.error || 'Polygon.io API returned an error');
    }
    
    return data;
  } catch (error) {
    console.error(`Polygon.io API error:`, error);
    throw error;
  }
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
      data = await fetchPolygonData(`/v2${endpoint}`, params);
    }
    else if (endpoint.startsWith('/daily-open-close')) {
      // Format: /daily-open-close/{symbol}/{date}
      const parts = endpoint.split('/').filter(p => p);
      if (parts.length >= 3) {
        polygonEndpoint = `/v1/open-close/${parts[1]}/${parts[2]}`;
        data = await fetchPolygonData(polygonEndpoint, params);
      } else {
        throw new Error('Invalid daily-open-close endpoint format');
      }
    }
    else if (endpoint.startsWith('/previous-close')) {
      // Format: /previous-close/{symbol}
      const parts = endpoint.split('/').filter(p => p);
      if (parts.length >= 2) {
        polygonEndpoint = `/v2/aggs/ticker/${parts[1]}/prev`;
        data = await fetchPolygonData(polygonEndpoint, params);
      } else {
        throw new Error('Invalid previous-close endpoint format');
      }
    }
    else if (endpoint.startsWith('/ticker-details')) {
      // Format: /ticker-details/{symbol}
      const parts = endpoint.split('/').filter(p => p);
      if (parts.length >= 2) {
        polygonEndpoint = `/v3/reference/tickers/${parts[1]}`;
        data = await fetchPolygonData(polygonEndpoint, params);
      } else {
        throw new Error('Invalid ticker-details endpoint format');
      }
    }
    else if (endpoint.startsWith('/insider-transactions')) {
      // Format: /insider-transactions/{symbol}
      const parts = endpoint.split('/').filter(p => p);
      if (parts.length >= 2) {
        polygonEndpoint = `/v2/reference/insiders/${parts[1]}`;
        data = await fetchPolygonData(polygonEndpoint, params);
      } else {
        throw new Error('Invalid insider-transactions endpoint format');
      }
    }
    else if (endpoint.startsWith('/market-status')) {
      // Format: /market-status
      polygonEndpoint = '/v1/marketstatus/now';
      data = await fetchPolygonData(polygonEndpoint, params);
    }
    else if (endpoint.startsWith('/indicators')) {
      // Format: /indicators/{indicator}/{symbol}
      const parts = endpoint.split('/').filter(p => p);
      if (parts.length >= 3) {
        polygonEndpoint = `/v1/indicators/${parts[1]}/${parts[2]}`;
        data = await fetchPolygonData(polygonEndpoint, params);
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
