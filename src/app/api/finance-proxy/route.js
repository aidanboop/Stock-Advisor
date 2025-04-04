/**
 * API proxy to handle Yahoo Finance API requests
 * Place this file at: src/app/api/finance-proxy/route.js
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Mapping of endpoints to Yahoo Finance API paths
const YAHOO_FINANCE_ENDPOINTS = {
  'chart': 'v8/finance/chart',
  'quoteSummary': 'v8/finance/quoteSummary',
  'insights': 'v8/finance/insights'
};

// Alternative endpoints to try if primary fails
const ALTERNATIVE_ENDPOINTS = [
  'https://query1.finance.yahoo.com',
  'https://query2.finance.yahoo.com',
  'https://finance.yahoo.com'
];

/**
 * Enhanced fetch with detailed logging and multiple retry strategies
 */
async function fetchWithDetailedLogging(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        ...options.headers
      },
      timeout: options.timeout || 10000
    });

    // Log full response details for debugging
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    // Try to get response text first
    const responseText = await response.text();

    // Log full response text for debugging
    console.log('Full Response Text (first 2000 chars):', responseText.slice(0, 2000));

    // Try to parse as JSON
    let jsonData;
    try {
      jsonData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON Parsing Error:', parseError);
      throw new Error(`Failed to parse JSON. Response status: ${response.status}`);
    }

    return jsonData;
  } catch (error) {
    console.error('Fetch Error:', {
      url,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
    throw error;
  }
}

/**
 * Proxy for Yahoo Finance API requests to bypass CORS issues
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const symbol = searchParams.get('symbol');
  const modules = searchParams.get('modules');
  const interval = searchParams.get('interval') || '1d';
  const range = searchParams.get('range') || '1mo';
  const region = searchParams.get('region') || 'US';
  
  // Validate required parameters
  if (!endpoint || !symbol) {
    return NextResponse.json(
      {
        success: false,
        message: 'Missing required parameters: endpoint and symbol are required'
      },
      { status: 400 }
    );
  }
  
  // Validate endpoint
  if (!YAHOO_FINANCE_ENDPOINTS[endpoint]) {
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid endpoint. Must be one of: chart, quoteSummary, insights'
      },
      { status: 400 }
    );
  }
  
  // Detailed logging of incoming request
  console.log('Incoming Finance Proxy Request:', {
    endpoint,
    symbol,
    modules,
    interval,
    range,
    region
  });

  // Try multiple endpoint strategies
  const endpointPath = YAHOO_FINANCE_ENDPOINTS[endpoint];
  const baseUrls = ALTERNATIVE_ENDPOINTS;
  
  for (const baseUrl of baseUrls) {
    try {
      // Construct full URL with parameters
      let fullUrl = `${baseUrl}/${endpointPath}/${symbol}`;
      
      // Add query parameters for specific endpoints
      const queryParams = new URLSearchParams();
      
      switch (endpoint) {
        case 'chart':
          queryParams.set('region', region);
          queryParams.set('interval', interval);
          queryParams.set('range', range);
          break;
        case 'quoteSummary':
          queryParams.set('modules', modules);
          queryParams.set('region', region);
          break;
      }
      
      // Append query parameters if any
      if (queryParams.toString()) {
        fullUrl += `?${queryParams.toString()}`;
      }
      
      console.log(`Attempting to fetch from: ${fullUrl}`);
      
      // Attempt to fetch and parse data
      const data = await fetchWithDetailedLogging(fullUrl);
      
      // Additional validation of response data
      if (!data || (endpoint !== 'insights' && !data.chart && !data.quoteSummary)) {
        console.warn('Invalid data structure:', data);
        continue; // Try next endpoint
      }
      
      // Return successful response
      return NextResponse.json({
        success: true,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error with base URL ${baseUrl}:`, {
        symbol,
        endpoint,
        errorMessage: error.message
      });
      
      // If this is the last URL, throw the error
      if (baseUrl === baseUrls[baseUrls.length - 1]) {
        return NextResponse.json(
          {
            success: false,
            message: 'Failed to fetch data from Yahoo Finance',
            error: {
              name: error.name,
              message: error.message
            }
          },
          { status: 500 }
        );
      }
    }
  }
  
  // Fallback error response (shouldn't normally reach here)
  return NextResponse.json(
    {
      success: false,
      message: 'Exhausted all possible Yahoo Finance endpoints'
    },
    { status: 500 }
  );
}
