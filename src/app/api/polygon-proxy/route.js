/**
 * Simplified API proxy to handle Polygon.io API requests
 * Uses the official Polygon.io client library
 */

import { NextResponse } from 'next/server';
import {
  getStockAggregates,
  getTickerDetails,
  getPreviousClose,
  getInsiderTransactions,
  getMarketStatus,
  getTechnicalIndicators
} from '../../../lib/api/polygonClient';

export const dynamic = 'force-dynamic';

// Define response headers
const RESPONSE_HEADERS = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Content-Type': 'application/json'
};

/**
 * Handle GET requests
 */
export async function GET(request) {
  try {
    // Get the path from the request URL
    const { pathname, searchParams } = new URL(request.url);

    // Extract the endpoint from the pathname
    const endpoint = pathname.replace('/api/polygon-proxy', '');

    // Convert search parameters to object
    const params = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // Route to appropriate Polygon client method based on our endpoint
    let data = null;

    if (endpoint.startsWith('/aggregates')) {
      // Format: /aggregates/{symbol}/{multiplier}/{timespan}/{from}/{to}
      const pathParts = endpoint.split('/').filter(Boolean);

      if (pathParts.length >= 5) {
        const symbol = pathParts[1];
        const multiplier = parseInt(pathParts[2], 10);
        const timespan = pathParts[3];
        const from = pathParts[4];
        const to = pathParts[5] || new Date().toISOString().split('T')[0];

        data = await getStockAggregates(symbol, {
          multiplier,
          timespan,
          from,
          to,
          ...params
        });
      } else {
        throw new Error('Invalid aggregates endpoint format');
      }
    }
    else if (endpoint.startsWith('/daily-open-close')) {
      // Format: /daily-open-close/{symbol}/{date}
      const parts = endpoint.split('/').filter(p => p);

      if (parts.length >= 3) {
        // Note: The official client doesn't have a direct equivalent,
        // so we use aggregates with a single day range
        const symbol = parts[1];
        const date = parts[2];

        data = await getStockAggregates(symbol, {
          multiplier: 1,
          timespan: 'day',
          from: date,
          to: date
        });
      } else {
        throw new Error('Invalid daily-open-close endpoint format');
      }
    }
    else if (endpoint.startsWith('/previous-close')) {
      // Format: /previous-close/{symbol}
      const parts = endpoint.split('/').filter(p => p);

      if (parts.length >= 2) {
        const symbol = parts[1];
        data = await getPreviousClose(symbol);
      } else {
        throw new Error('Invalid previous-close endpoint format');
      }
    }
    else if (endpoint.startsWith('/ticker-details')) {
      // Format: /ticker-details/{symbol}
      const parts = endpoint.split('/').filter(p => p);

      if (parts.length >= 2) {
        const symbol = parts[1];
        data = await getTickerDetails(symbol);
      } else {
        throw new Error('Invalid ticker-details endpoint format');
      }
    }
    else if (endpoint.startsWith('/insider-transactions')) {
      // Format: /insider-transactions/{symbol}
      const parts = endpoint.split('/').filter(p => p);

      if (parts.length >= 2) {
        const symbol = parts[1];

        // Skip for ETFs and indices
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
        data = await getInsiderTransactions(symbol);
      } else {
        throw new Error('Invalid insider-transactions endpoint format');
      }
    }
    else if (endpoint.startsWith('/market-status')) {
      // Format: /market-status
      data = await getMarketStatus();
    }
    else if (endpoint.startsWith('/indicators')) {
      // Format: /indicators/{indicator}/{symbol}
      const parts = endpoint.split('/').filter(p => p);

      if (parts.length >= 3) {
        const indicator = parts[1];
        const symbol = parts[2];

        // Parse additional parameters
        const indicatorParams = {};
        if (params.window) indicatorParams.window = parseInt(params.window, 10);
        if (params.timespan) indicatorParams.timespan = params.timespan;
        if (params.adjusted) indicatorParams.adjusted = params.adjusted === 'true';

        data = await getTechnicalIndicators(symbol, indicator, indicatorParams);
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
 * Check if a symbol is an ETF or index
 * @param {string} symbol - Stock symbol
 * @returns {boolean} - Whether symbol is an ETF/index
 */
function isEtfOrIndex(symbol) {
  const etfAndIndices = ['SPY', 'QQQ', 'DIA', 'IWM', 'VIX', 'XLK', 'XLF', 'XLV', 'XLE', 'XLY', 'XLP', 'XLI', 'XLB', 'XLU', 'XLRE'];
  return etfAndIndices.includes(symbol.toUpperCase());
}