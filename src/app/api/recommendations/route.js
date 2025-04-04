import { NextResponse } from 'next/server';
import { getTopRecommendations } from '../../../lib/utils/stockData';

export const dynamic = 'force-dynamic';

/**
 * API route to get top stock recommendations
 */
export async function GET(request) {
  try {
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5', 10);
    const techOnly = searchParams.get('techOnly') === 'true';
    
    // Get recommendations
    const recommendations = await getTopRecommendations(limit, techOnly);
    
    return NextResponse.json({
      success: true,
      count: recommendations.length,
      recommendations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch recommendations',
        error: error.message
      },
      { status: 500 }
    );
  }
}
