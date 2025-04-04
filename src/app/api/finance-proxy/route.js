/**
 * API proxy to handle Yahoo Finance API requests
 * Place this file at: src/app/api/finance-proxy/route.js
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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
  
  // Determine Yahoo Finance API URL based on endpoint
  let yahooFinanceUrl = '';
  
  switch (endpoint) {
    case 'chart':
      yahooFinanceUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?region=${region}&interval=${interval}&range=${range}`;
      break;
    case 'quoteSummary':
      yahooFinanceUrl = `https://query1.finance.yahoo.com/v8/finance/quoteSummary/${symbol}?modules=${modules}&region=${region}`;
      break;
    case 'insights':
      yahooFinanceUrl = `https://query1.finance.yahoo.com/v8/finance/insights/${symbol}`;
      break;
    default:
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid endpoint. Must be one of: chart, quoteSummary, insights'
        },
        { status: 400 }
      );
  }
  
  try {
    // Fetch data from Yahoo Finance with enhanced error handling
    const response = await fetch(yahooFinanceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
      },
      timeout: 10000 // 10-second timeout
    });
    
    // Check if response is OK
    if (!response.ok) {
      // Try to extract error details
      const errorText = await response.text();
      console.error(`Yahoo Finance API error: ${response.status} - ${errorText}`);
      
      return NextResponse.json(
        {
          success: false,
          message: `Failed to fetch data from Yahoo Finance. Status: ${response.status}`,
          details: errorText
        },
        { status: response.status }
      );
    }
    
    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const errorText = await response.text();
      console.error(`Unexpected content type: ${contentType}. Response: ${errorText}`);
      
      return NextResponse.json(
        {
          success: false,
          message: 'Received non-JSON response from Yahoo Finance API',
          details: errorText
        },
        { status: 500 }
      );
    }
    
    // Get the data from the response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      const errorText = await response.text();
      
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to parse JSON response',
          details: errorText
        },
        { status: 500 }
      );
    }
    
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
          message: error.message,
          stack: error.stack
        }
      },
      { status: 500 }
    );
  }
}
