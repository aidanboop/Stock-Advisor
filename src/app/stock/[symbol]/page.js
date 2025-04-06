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
          </section>
          
          {/* Insider Trading Analysis */}
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">Insider Trading</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                (stockData.analysis?.insider?.score || 0) > 60 
                  ? 'bg-green-100 text-green-800' 
                  : (stockData.analysis?.insider?.score || 0) < 40 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-yellow-100 text-yellow-800'
              }`}>
                {stockData.analysis?.insider?.score || 0}/100
              </span>
            </h2>
            
            <div className="space-y-4">
              {stockData.analysis?.insider?.details ? (
                <>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-500">Insider Sentiment</div>
                    <div className="font-medium mt-1">
                      <span className={
                        stockData.analysis.insider.sentiment === 'VERY_BULLISH' || stockData.analysis.insider.sentiment === 'BULLISH'
                          ? 'text-green-600'
                          : stockData.analysis.insider.sentiment === 'VERY_BEARISH' || stockData.analysis.insider.sentiment === 'BEARISH'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                      }>
                        {stockData.analysis.insider.sentiment.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-500">Recent Buys</div>
                      <div className="font-medium mt-1 text-green-600">
                        {stockData.analysis.insider.details.buyCount || 0}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-500">Recent Sells</div>
                      <div className="font-medium mt-1 text-red-600">
                        {stockData.analysis.insider.details.sellCount || 0}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Recent Transactions:</h3>
                    {stockData.analysis.insider.details.recentTransactions?.length > 0 ? (
                      <div className="text-sm">
                        {stockData.analysis.insider.details.recentTransactions.map((transaction, idx) => (
                          <div key={idx} className="border-b border-gray-100 py-2 last:border-b-0 last:pb-0">
                            <div className="flex justify-between">
                              <span className="font-medium">{transaction.name}</span>
                              <span className={transaction.type === 'BUY' ? 'text-green-600' : transaction.type === 'SELL' ? 'text-red-600' : 'text-gray-600'}>
                                {transaction.type}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {transaction.relation} • {transaction.date}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">No recent transactions</div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-gray-500 italic">Insider trading data not available</div>
              )}
            </div>
          </section>
          
          {/* Price Analysis */}
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">Price Analysis</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                (stockData.analysis?.price?.score || 0) > 60 
                  ? 'bg-green-100 text-green-800' 
                  : (stockData.analysis?.price?.score || 0) < 40 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-yellow-100 text-yellow-800'
              }`}>
                {stockData.analysis?.price?.score || 0}/100
              </span>
            </h2>
            
            <div className="space-y-4">
              {stockData.analysis?.price?.details ? (
                <>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-500">Price Trend</div>
                    <div className="font-medium mt-1">
                      <span className={
                        stockData.analysis.price.trend === 'STRONG_UPTREND' || stockData.analysis.price.trend === 'UPTREND'
                          ? 'text-green-600'
                          : stockData.analysis.price.trend === 'STRONG_DOWNTREND' || stockData.analysis.price.trend === 'DOWNTREND'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                      }>
                        {stockData.analysis.price.trend.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-500">Daily Change</div>
                      <div className={`font-medium mt-1 ${
                        stockData.analysis.price.details.dailyChange > 0
                          ? 'text-green-600'
                          : stockData.analysis.price.details.dailyChange < 0
                            ? 'text-red-600'
                            : 'text-gray-600'
                      }`}>
                        {stockData.analysis.price.details.dailyChange > 0 ? '+' : ''}
                        {stockData.analysis.price.details.dailyChange.toFixed(2)}%
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-500">Weekly Change</div>
                      <div className={`font-medium mt-1 ${
                        stockData.analysis.price.details.weeklyChange > 0
                          ? 'text-green-600'
                          : stockData.analysis.price.details.weeklyChange < 0
                            ? 'text-red-600'
                            : 'text-gray-600'
                      }`}>
                        {stockData.analysis.price.details.weeklyChange > 0 ? '+' : ''}
                        {stockData.analysis.price.details.weeklyChange.toFixed(2)}%
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-500">Monthly Change</div>
                      <div className={`font-medium mt-1 ${
                        stockData.analysis.price.details.monthlyChange > 0
                          ? 'text-green-600'
                          : stockData.analysis.price.details.monthlyChange < 0
                            ? 'text-red-600'
                            : 'text-gray-600'
                      }`}>
                        {stockData.analysis.price.details.monthlyChange > 0 ? '+' : ''}
                        {stockData.analysis.price.details.monthlyChange.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-500">5-Day SMA</div>
                      <div className="font-medium mt-1">
                        ${stockData.analysis.price.details.sma5?.toFixed(2) || 'N/A'}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-500">20-Day SMA</div>
                      <div className="font-medium mt-1">
                        ${stockData.analysis.price.details.sma20?.toFixed(2) || 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Price Indicators:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {stockData.analysis.price.reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-purple-500 mr-1.5">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 italic">Price analysis data not available</div>
              )}
            </div>
          </section>
        </div>
        
        {/* Summary and Key Reasons */}
        <section className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recommendation Summary
          </h2>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-gray-900 mb-2">Key Reasons for {stockData.recommendation.replace('_', ' ')}:</h3>
              <ul className="text-gray-600 space-y-2">
                {stockData.keyReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>This recommendation is based on technical indicators, insider trading patterns, and price trend analysis using end-of-day stock data. Each symbol is updated incrementally due to API rate limits.</p>
              <p className="mt-2">
                <strong>Data timing:</strong> End-of-day data with selective updates
              </p>
              <p className="mt-2">
                <strong>Last updated:</strong> {new Date(stockData.lastUpdated).toLocaleString('en-US', {timeZone: 'America/New_York'})} EST
              </p>
            </div>
          </div>
        </section>
        
        <div className="mt-6 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to All Recommendations
          </a>
        </div>
      </div>
    </main>
  );
}
