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

// Alternative query domains
const QUERY_DOMAINS = [
  'query1.finance.yahoo.com',
  'query2.finance.yahoo.com',
  'finance.yahoo.com'
];

/**
 * Check if response is likely to be HTML (error page)
 */
function isHtmlResponse(contentType, text) {
  return (
    (contentType && contentType.includes('text/html')) || 
    (text && text.includes('<!DOCTYPE html>')) ||
    (text && text.includes('<html'))
  );
}

/**
 * Fetch data with multiple strategies
 */
async function fetchYahooFinanceData(url, symbol, endpoint) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json'
  };

  try {
    const response = await fetch(url, { 
      headers, 
      timeout: 10000 
    });

    // Log response details for debugging
    const contentType = response.headers.get('content-type') || '';
    const responseText = await response.text();

    // Detailed logging for troubleshooting
    console.log(`Fetch for ${symbol} (${endpoint}):`, {
      status: response.status,
      contentType,
      responseTextLength: responseText.length,
      isHtml: isHtmlResponse(contentType, responseText)
    });

    // If HTML or error status, log more details
    if (isHtmlResponse(contentType, responseText)) {
      console.warn(`Received HTML response for ${symbol}:`, responseText.slice(0, 1000));
      throw new Error('Received HTML instead of JSON');
    }

    // Try to parse JSON
    let jsonData;
    try {
      jsonData = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`JSON Parsing Error for ${symbol}:`, {
        parseError,
        contentType,
        responseTextStart: responseText.slice(0, 500)
      });
      throw new Error('Failed to parse JSON response');
    }

    // Validate response structure
    if (!jsonData || (endpoint !== 'insights' && !jsonData.chart && !jsonData.quoteSummary)) {
      console.warn(`Invalid data structure for ${symbol}:`, jsonData);
      throw new Error('Invalid response structure');
    }

    return jsonData;
  } catch (error) {
    console.error(`Fetch Error for ${symbol}:`, {
      url,
      endpoint,
      errorName: error.name,
      errorMessage: error.message
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

  // Prepare query parameters
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

  // Try multiple domains
  for (const domain of QUERY_DOMAINS) {
    try {
      // Construct full URL
      const fullUrl = `https://${domain}/${YAHOO_FINANCE_ENDPOINTS[endpoint]}/${symbol}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

      console.log(`Attempting to fetch ${symbol} from ${fullUrl}`);

      // Attempt to fetch data
      const data = await fetchYahooFinanceData(fullUrl, symbol, endpoint);
      
      // Return successful response
      return NextResponse.json({
        success: true,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error fetching ${symbol} from ${domain}:`, error.message);
      
      // If this is the last domain, return final error
      if (domain === QUERY_DOMAINS[QUERY_DOMAINS.length - 1]) {
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
