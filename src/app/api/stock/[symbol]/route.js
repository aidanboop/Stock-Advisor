import { NextResponse } from 'next/server';
import { fetchStockData } from '../../../../lib/utils/stockData';

export const dynamic = 'force-dynamic';

/**
 * API route to get detailed data for a specific stock
 */
export async function GET(request, { params }) {
  try {
    const { symbol } = params;
    
    if (!symbol) {
      return NextResponse.json(
        {
          success: false,
          message: 'Stock symbol is required'
        },
        { status: 400 }
      );
    }
    
    // Get stock data
    const stockData = await fetchStockData(symbol, true);
    
    return NextResponse.json({
      success: true,
      data: stockData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error fetching data for ${params.symbol}:`, error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to fetch data for ${params.symbol}`,
        error: error.message
      },
      { status: 500 }
    );
  }
}
