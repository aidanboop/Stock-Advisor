import { NextResponse } from 'next/server';
import { fetchMultipleStocks, TECH_STOCKS, SECTORS, STOCK_INDICES } from '../../../lib/utils/stockData';

export const dynamic = 'force-dynamic';

/**
 * API route to manually refresh stock data
 */
export async function GET() {
  try {
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
      message: `Successfully refreshed data for ${results.length} stocks`,
      refreshedAt: new Date().toISOString(),
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
