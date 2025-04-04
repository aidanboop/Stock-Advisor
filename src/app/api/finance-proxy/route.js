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
const ALTERNATIVE_ENDPOINTS = {
  'chart': [
    'https://query2.finance.yahoo.com/v8/finance/chart',
    'https://query1.finance.yahoo.com/v8/finance/chart'
  ],
  'quoteSummary': [
    'https://query2.finance.yahoo.com/v8/finance/quoteSummary',
    'https://query1.finance.yahoo.com/v8/finance/quoteSummary'
  ],
  'insights': [
    'https://query2.finance.yahoo.com/v8/finance/insights',
    'https://query1.finance.yahoo.com/v8/finance/insights'
  ]
};

/**
 * Fetch data from Yahoo Finance with multiple endpoint attempts
 */
async function fetchYahooFinanceData(yahooFinanceUrl, endpoint, symbol) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json'
  };

  // Try primary URL first
  try {
    const response = await fetch(yahooFinanceUrl, { 
      headers, 
      timeout: 10000 
    });

    // If response is not JSON, try alternative endpoints
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const errorText = await response.text();
      console.warn(`Non-JSON response from ${yahooFinanceUrl}. Attempting alternative endpoints.`);
      console.warn('Response content:', errorText.slice(0, 500)); // Log first 500 chars
      
      // Try alternative endpoints
      for (const altUrl of ALTERNATIVE_ENDPOINTS[endpoint]) {
        try {
          const alternativeUrl = `${altUrl}/${symbol}${yahooFinanceUrl.includes('?') ? yahooFinanceUrl.slice(yahooFinanceUrl.indexOf('?')) : ''}`;
          const altResponse = await fetch(alternativeUrl, { 
            headers, 
            timeout: 10000 
          });

          const altContentType = altResponse.headers.get('content-type') || '';
          if (altContentType.includes('application/json')) {
            return await altResponse.json();
          }
        } catch (altError) {
          console.warn(`Alternative endpoint ${altUrl} failed:`, altError);
        }
      }

      // If all endpoints fail, throw an error
      throw new Error('No valid JSON response from any Yahoo Finance endpoint');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching data for ${symbol} from ${yahooFinanceUrl}:`, error);
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
  
  // Construct Yahoo Finance API URL based on endpoint
  let yahooFinanceUrl = `https://query1.finance.yahoo.com/${YAHOO_FINANCE_ENDPOINTS[endpoint]}/${symbol}`;
  
  // Add query parameters for specific endpoints
  switch (endpoint) {
    case 'chart':
      yahooFinanceUrl += `?region=${region}&interval=${interval}&range=${range}`;
      break;
    case 'quoteSummary':
      yahooFinanceUrl += `?modules=${modules}&region=${region}`;
      break;
    case 'insights':
      // No additional parameters needed
      break;
  }
  
  try {
    // Fetch data, with built-in fallback mechanism
    const data = await fetchYahooFinanceData(yahooFinanceUrl, endpoint, symbol);
    
    // Additional validation of response data
    if (!data || (endpoint !== 'insights' && !data.chart && !data.quoteSummary)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Received empty or invalid data from Yahoo Finance API',
          details: data
        },
        { status: 500 }
      );
    }
    
    // Return the data
    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error proxying request to Yahoo Finance for ${symbol}:`, error);
    
    // Return detailed error response
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
