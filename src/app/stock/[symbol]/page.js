// src/app/stock/[symbol]/page.js
import { fetchStockData } from '../../../lib/utils/stockData';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export default async function StockDetail({ params }) {
  const { symbol } = params;
  
  // Fetch detailed stock data
  const stockData = await fetchStockData(symbol);
  
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {stockData.name} ({stockData.symbol})
              </h1>
              <p className="text-gray-500 mt-1">
                {stockData.metadata?.exchange || 'US Exchange'} • Based on end-of-day data
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {stockData.metadata?.price ? `$${stockData.metadata.price.toFixed(2)}` : 'N/A'}
              </div>
              <div className={`text-lg ${
                (stockData.analysis?.price?.dailyChange || 0) > 0 
                  ? 'text-green-600' 
                  : (stockData.analysis?.price?.dailyChange || 0) < 0 
                    ? 'text-red-600' 
                    : 'text-gray-500'
              }`}>
                {stockData.analysis?.price?.dailyChange 
                  ? `${stockData.analysis.price.dailyChange > 0 ? '+' : ''}${stockData.analysis.price.dailyChange.toFixed(2)}%` 
                  : '0.00%'
                }
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center">
            <span 
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                stockData.recommendation === 'STRONG_BUY' 
                  ? 'bg-green-100 text-green-800' 
                  : stockData.recommendation === 'BUY'
                    ? 'bg-blue-100 text-blue-800'
                    : stockData.recommendation === 'HOLD'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
              }`}
            >
              {stockData.recommendation.replace('_', ' ')}
            </span>
            <span className="ml-3 text-lg font-medium">
              Overall Score: {stockData.score}/100
            </span>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">
            <p><strong>Data update schedule:</strong> Our analysis is based on end-of-day stock data. Individual symbols are updated incrementally throughout the day to maintain API rate limits, with each symbol analyzed individually on a rotating schedule. This ensures fresh insights while respecting data provider constraints.</p>
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Technical Analysis */}
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb
