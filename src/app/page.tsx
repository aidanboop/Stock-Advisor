import { getTopRecommendations, getMarketOverview } from '../lib/utils/stockData';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

// Define interfaces for our data structures
interface StockAnalysis {
  technical?: {
    score?: number;
  };
  insider?: {
    score?: number;
  };
  price?: {
    score?: number;
    dailyChange?: number;
  };
}

interface StockMetadata {
  price?: number;
  exchange?: string;
}

interface StockData {
  symbol: string;
  name: string;
  recommendation: string;
  score: number;
  keyReasons: string[];
  analysis?: StockAnalysis;
  metadata?: StockMetadata;
}

interface MarketOverview {
  indices?: StockData[];
  sectors?: StockData[];
  lastUpdated: string;
}

export default async function Home() {
  // Get top stock recommendations (focus on tech stocks)
  // Using type assertion to tell TypeScript this is a StockData[] array
  const techRecommendations = await getTopRecommendations(5, true) as StockData[];
  
  // Get broader market recommendations
  const allRecommendations = await getTopRecommendations(5, false) as StockData[];
  
  // Get market overview data
  const marketOverview = await getMarketOverview() as MarketOverview;
  
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Stock Advisor</h1>
          <p className="text-gray-500 mt-2">
            Real-time stock recommendations updated hourly
          </p>
          <p className="text-sm text-gray-400">
            Last updated: {new Date().toLocaleString()}
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tech Stock Recommendations */}
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Top Tech Stock Recommendations
            </h2>
            
            <div className="space-y-4">
              {techRecommendations.length > 0 ? (
                techRecommendations.map((stock) => (
                  <div key={stock.symbol} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {stock.name} ({stock.symbol})
                        </h3>
                        <div className="mt-1 flex items-center">
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              stock.recommendation === 'STRONG_BUY' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {stock.recommendation.replace('_', ' ')}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            Score: {stock.score}/100
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {stock.metadata?.price ? `$${stock.metadata.price.toFixed(2)}` : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {stock.metadata?.exchange || 'US Exchange'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-900">Key Reasons:</h4>
                      <ul className="mt-1 text-sm text-gray-600 space-y-1">
                        {stock.keyReasons.map((reason, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-green-500 mr-1.5">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="font-medium">Technical</div>
                        <div className={`mt-1 ${
                          (stock.analysis?.technical?.score || 0) > 60 
                            ? 'text-green-600' 
                            : (stock.analysis?.technical?.score || 0) < 40 
                              ? 'text-red-600' 
                              : 'text-yellow-600'
                        }`}>
                          {stock.analysis?.technical?.score || 'N/A'}/100
                        </div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="font-medium">Insider</div>
                        <div className={`mt-1 ${
                          (stock.analysis?.insider?.score || 0) > 60 
                            ? 'text-green-600' 
                            : (stock.analysis?.insider?.score || 0) < 40 
                              ? 'text-red-600' 
                              : 'text-yellow-600'
                        }`}>
                          {stock.analysis?.insider?.score || 'N/A'}/100
                        </div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="font-medium">Price</div>
                        <div className={`mt-1 ${
                          (stock.analysis?.price?.score || 0) > 60 
                            ? 'text-green-600' 
                            : (stock.analysis?.price?.score || 0) < 40 
                              ? 'text-red-600' 
                              : 'text-yellow-600'
                        }`}>
                          {stock.analysis?.price?.score || 'N/A'}/100
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 italic">No recommendations available</div>
              )}
            </div>
          </section>
          
          {/* All Stock Recommendations */}
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Top Overall Recommendations
            </h2>
            
            <div className="space-y-4">
              {allRecommendations.length > 0 ? (
                allRecommendations.map((stock) => (
                  <div key={stock.symbol} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {stock.name} ({stock.symbol})
                        </h3>
                        <div className="mt-1 flex items-center">
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              stock.recommendation === 'STRONG_BUY' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {stock.recommendation.replace('_', ' ')}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            Score: {stock.score}/100
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {stock.metadata?.price ? `$${stock.metadata.price.toFixed(2)}` : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {stock.metadata?.exchange || 'US Exchange'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-900">Key Reasons:</h4>
                      <ul className="mt-1 text-sm text-gray-600 space-y-1">
                        {stock.keyReasons.map((reason, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-green-500 mr-1.5">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="font-medium">Technical</div>
                        <div className={`mt-1 ${
                          (stock.analysis?.technical?.score || 0) > 60 
                            ? 'text-green-600' 
                            : (stock.analysis?.technical?.score || 0) < 40 
                              ? 'text-red-600' 
                              : 'text-yellow-600'
                        }`}>
                          {stock.analysis?.technical?.score || 'N/A'}/100
                        </div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="font-medium">Insider</div>
                        <div className={`mt-1 ${
                          (stock.analysis?.insider?.score || 0) > 60 
                            ? 'text-green-600' 
                            : (stock.analysis?.insider?.score || 0) < 40 
                              ? 'text-red-600' 
                              : 'text-yellow-600'
                        }`}>
                          {stock.analysis?.insider?.score || 'N/A'}/100
                        </div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="font-medium">Price</div>
                        <div className={`mt-1 ${
                          (stock.analysis?.price?.score || 0) > 60 
                            ? 'text-green-600' 
                            : (stock.analysis?.price?.score || 0) < 40 
                              ? 'text-red-600' 
                              : 'text-yellow-600'
                        }`}>
                          {stock.analysis?.price?.score || 'N/A'}/100
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 italic">No recommendations available</div>
              )}
            </div>
          </section>
        </div>
        
        {/* Market Overview */}
        <section className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Market Overview
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Market Indices */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Major Indices</h3>
              <div className="space-y-3">
                {marketOverview.indices?.map((index) => (
                  <div key={index.symbol} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{index.name}</div>
                      <div className="text-sm text-gray-500">{index.symbol}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {index.metadata?.price ? index.metadata.price.toFixed(2) : 'N/A'}
                      </div>
                      <div className={`text-sm ${
                        (index.analysis?.price?.dailyChange || 0) > 0 
                          ? 'text-green-600' 
                          : (index.analysis?.price?.dailyChange || 0) < 0 
                            ? 'text-red-600' 
                            : 'text-gray-500'
                      }`}>
                        {index.analysis?.price?.dailyChange 
                          ? `${index.analysis.price.dailyChange > 0 ? '+' : ''}${index.analysis.price.dailyChange.toFixed(2)}%` 
                          : '0.00%'
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Sectors */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Sectors</h3>
              <div className="space-y-3">
                {marketOverview.sectors?.map((sector) => (
                  <div key={sector.symbol} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{sector.name}</div>
                      <div className="text-sm text-gray-500">{sector.symbol}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {sector.metadata?.price ? `$${sector.metadata.price.toFixed(2)}` : 'N/A'}
                      </div>
                      <div className={`text-sm ${
                        (sector.analysis?.price?.dailyChange || 0) > 0 
                          ? 'text-green-600' 
                          : (sector.analysis?.price?.dailyChange || 0) < 0 
                            ? 'text-red-600' 
                            : 'text-gray-500'
                      }`}>
                        {sector.analysis?.price?.dailyChange 
                          ? `${sector.analysis.price.dailyChange > 0 ? '+' : ''}${sector.analysis.price.dailyChange.toFixed(2)}%` 
                          : '0.00%'
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
