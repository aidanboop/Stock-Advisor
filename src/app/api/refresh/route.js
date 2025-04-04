import { NextResponse } from 'next/server';
import { fetchMultipleStocks, TECH_STOCKS, SECTORS, STOCK_INDICES } from '../../../lib/utils/stockData';

export const dynamic = 'force-dynamic';

// Keep track of last refresh time to avoid too frequent updates
let lastRefreshTime = 0;
const MIN_REFRESH_INTERVAL = 5000; // Minimum 5 seconds between refreshes

/**
 * API route to refresh stock data in real-time
 */
export async function GET() {
  try {
    const now = Date.now();
    
    // Check if we've refreshed too recently (rate limiting)
    if (now - lastRefreshTime < MIN_REFRESH_INTERVAL) {
      return NextResponse.json({
        success: true,
        message: 'Refresh rate limited',
        refreshedAt: new Date(lastRefreshTime).toISOString(),
        timeTakenMs: 0,
        count: 0,
        rateLimited: true,
        nextRefreshAvailable: new Date(lastRefreshTime + MIN_REFRESH_INTERVAL).toISOString()
      });
    }
    
    // Update last refresh time
    lastRefreshTime = now;
    
    // Get current time in EST
    const estTime = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    });
    
    // Combine all symbols to refresh
    const allSymbols = [...new Set([...TECH_STOCKS, ...SECTORS, ...STOCK_INDICES])];
    
    // Start time for performance tracking
    const startTime = Date.now();
    
    // Force refresh of all data
    const results = await fetchMultipleStocks(allSymbols, true);
    
    // Calculate time taken
    const timeTaken = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      message: `Successfully refreshed data for ${results.length} stocks at ${estTime} EST`,
      refreshedAt: new Date().toISOString(),
      refreshedAtEst: estTime,
      timeTakenMs: timeTaken,
      count: results.length
    });
  } catch (error) {
    console.error('Error refreshing stock data:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to refresh stock data',
        error: error.message
      },
      { status: 500 }
    );
  }
}
