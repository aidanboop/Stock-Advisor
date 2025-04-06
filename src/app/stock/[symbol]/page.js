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
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">Technical Analysis</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                (stockData.analysis?.technical?.score || 0) > 60 
                  ? 'bg-green-100 text-green-800' 
                  : (stockData.analysis?.technical?.score || 0) < 40 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-yellow-100 text-yellow-800'
              }`}>
                {stockData.analysis?.technical?.score || 0}/100
              </span>
            </h2>
            
            <div className="space-y-4">
              {stockData.analysis?.technical?.details ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-500">Short Term</div>
                      <div className="font-medium mt-1 flex items-center">
                        <span className={
                          stockData.analysis.technical.details.shortTerm.direction === 'up'
                            ? 'text-green-600'
                            : stockData.analysis.technical.details.shortTerm.direction === 'down'
                              ? 'text-red-600'
                              : 'text-yellow-600'
                        }>
                          {stockData.analysis.technical.details.shortTerm.direction === 'up'
                            ? '↑ Bullish'
                            : stockData.analysis.technical.details.shortTerm.direction === 'down'
                              ? '↓ Bearish'
                              : '→ Neutral'
                          }
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({stockData.analysis.technical.details.shortTerm.score || 0})
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-500">Intermediate Term</div>
                      <div className="font-medium mt-1 flex items-center">
                        <span className={
                          stockData.analysis.technical.details.intermediateTerm.direction === 'up'
                            ? 'text-green-600'
                            : stockData.analysis.technical.details.intermediateTerm.direction === 'down'
                              ? 'text-red-600'
                              : 'text-yellow-600'
                        }>
                          {stockData.analysis.technical.details.intermediateTerm.direction === 'up'
                            ? '↑ Bullish'
                            : stockData.analysis.technical.details.intermediateTerm.direction === 'down'
                              ? '↓ Bearish'
                              : '→ Neutral'
                          }
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({stockData.analysis.technical.details.intermediateTerm.score || 0})
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-500">Long Term</div>
                      <div className="font-medium mt-1 flex items-center">
                        <span className={
                          stockData.analysis.technical.details.longTerm.direction === 'up'
                            ? 'text-green-600'
                            : stockData.analysis.technical.details.longTerm.direction === 'down'
                              ? 'text-red-600'
                              : 'text-yellow-600'
                        }>
                          {stockData.analysis.technical.details.longTerm.direction === 'up'
                            ? '↑ Bullish'
                            : stockData.analysis.technical.details.longTerm.direction === 'down'
                              ? '↓ Bearish'
                              : '→ Neutral'
                          }
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({stockData.analysis.technical.details.longTerm.score || 0})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Key Technical Factors:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {stockData.analysis.technical.reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-blue-500 mr-1.5">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 italic">Technical analysis data not available</div>
              )}
            </div>
