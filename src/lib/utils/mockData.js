/**
 * Mock data for stock recommendations to use as fallback when API calls fail
 * Updated with April 2025 market conditions
 */

// Mock tech stock recommendations
export const mockTechRecommendations = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    recommendation: 'HOLD',
    score: 58,
    keyReasons: [
      'Tariff impact on China manufacturing',
      'Potential for higher iPhone prices',
      'Strong cash position',
      'Solid product ecosystem',
      'Trading near technical support levels'
    ],
    analysis: {
      technical: { score: 52 },
      insider: { score: 67 },
      price: { 
        score: 55,
        dailyChange: -7.30
      }
    },
    metadata: {
      price: 205.09,
      exchange: 'NASDAQ'
    },
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    recommendation: 'BUY',
    score: 72,
    keyReasons: [
      'Cloud business resilience',
      'Strong AI integration',
      'Lower tariff exposure than peers',
      'Solid dividend growth',
      'Better positioned for economic uncertainty'
    ],
    analysis: {
      technical: { score: 68 },
      insider: { score: 74 },
      price: { 
        score: 73,
        dailyChange: -3.60
      }
    },
    metadata: {
      price: 397.41,
      exchange: 'NASDAQ'
    },
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    recommendation: 'HOLD',
    score: 65,
    keyReasons: [
      'AI chip demand remains strong',
      'Tariff and trade war concerns',
      'Potential supply chain disruptions',
      'Trading at elevated valuations',
      'Recent stock split completed'
    ],
    analysis: {
      technical: { score: 61 },
      insider: { score: 72 },
      price: { 
        score: 63,
        dailyChange: -7.50
      }
    },
    metadata: {
      price: 93.42,
      exchange: 'NASDAQ'
    },
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'AMD',
    name: 'Advanced Micro Devices, Inc.',
    recommendation: 'BUY',
    score: 71,
    keyReasons: [
      'Server market share gains',
      'AI acceleration products',
      'Lower China exposure than peers',
      'Competitive chip performance',
      'Reasonable valuation metrics'
    ],
    analysis: {
      technical: { score: 67 },
      insider: { score: 76 },
      price: { 
        score: 71,
        dailyChange: -6.20
      }
    },
    metadata: {
      price: 157.83,
      exchange: 'NASDAQ'
    },
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    recommendation: 'BUY',
    score: 69,
    keyReasons: [
      'Search dominance',
      'YouTube growth',
      'Diversified revenue streams',
      'Lower trade war impact',
      'Reasonable valuation'
    ],
    analysis: {
      technical: { score: 64 },
      insider: { score: 73 },
      price: { 
        score: 70,
        dailyChange: -4.50
      }
    },
    metadata: {
      price: 147.85,
      exchange: 'NASDAQ'
    },
    lastUpdated: new Date().toISOString()
  }
];

// Mock broader market recommendations
export const mockAllRecommendations = [
  ...mockTechRecommendations.slice(0, 2),
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    recommendation: 'HOLD',
    score: 60,
    keyReasons: [
      'Financial market uncertainty',
      'Potential recession concerns',
      'Solid balance sheet',
      'Dividend growth potential',
      'Trading operations volatility'
    ],
    analysis: {
      technical: { score: 53 },
      insider: { score: 64 },
      price: { 
        score: 63,
        dailyChange: -5.80
      }
    },
    metadata: {
      price: 175.24,
      exchange: 'NYSE'
    },
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'JNJ',
    name: 'Johnson & Johnson',
    recommendation: 'BUY',
    score: 67,
    keyReasons: [
      'Defensive stock in market uncertainty',
      'Stable dividend',
      'Lower tariff exposure',
      'Healthcare sector stability',
      'Recent product portfolio improvements'
    ],
    analysis: {
      technical: { score: 62 },
      insider: { score: 68 },
      price: { 
        score: 67,
        dailyChange: -2.10
      }
    },
    metadata: {
      price: 148.76,
      exchange: 'NYSE'
    },
    lastUpdated: new Date().toISOString()
  },
  {
    symbol: 'META',
    name: 'Meta Platforms, Inc.',
    recommendation: 'HOLD',
    score: 63,
    keyReasons: [
      'Digital advertising resilience',
      'Metaverse investment concerns',
      'Regulatory scrutiny ongoing',
      'Cost-cutting measures',
      'Trade war indirect effects'
    ],
    analysis: {
      technical: { score: 59 },
      insider: { score: 65 },
      price: { 
        score: 64,
        dailyChange: -6.40
      }
    },
    metadata: {
      price: 487.32,
      exchange: 'NASDAQ'
    },
    lastUpdated: new Date().toISOString()
  }
];

// Mock market overview data
export const mockMarketOverview = {
  indices: [
    {
      symbol: 'SPY',
      name: 'S&P 500',
      metadata: { price: 507.41 },
      analysis: { price: { dailyChange: -5.97 } }
    },
    {
      symbol: 'DIA',
      name: 'Dow Jones Industrial Average',
      metadata: { price: 383.15 },
      analysis: { price: { dailyChange: -5.50 } }
    },
    {
      symbol: 'QQQ',
      name: 'NASDAQ-100',
      metadata: { price: 399.54 },
      analysis: { price: { dailyChange: -6.20 } }
    },
    {
      symbol: 'IWM',
      name: 'Russell 2000',
      metadata: { price: 187.42 },
      analysis: { price: { dailyChange: -7.30 } }
    },
    {
      symbol: 'VIX',
      name: 'CBOE Volatility Index',
      metadata: { price: 32.75 },
      analysis: { price: { dailyChange: 48.35 } }
    }
  ],
  sectors: [
    {
      symbol: 'XLK',
      name: 'Technology',
      metadata: { price: 196.73 },
      analysis: { price: { dailyChange: -6.45 } }
    },
    {
      symbol: 'XLF',
      name: 'Financial',
      metadata: { price: 37.82 },
      analysis: { price: { dailyChange: -5.98 } }
    },
    {
      symbol: 'XLV',
      name: 'Healthcare',
      metadata: { price: 146.57 },
      analysis: { price: { dailyChange: -3.82 } }
    },
    {
      symbol: 'XLE',
      name: 'Energy',
      metadata: { price: 86.45 },
      analysis: { price: { dailyChange: -8.60 } }
    },
    {
      symbol: 'XLY',
      name: 'Consumer Discretionary',
      metadata: { price: 172.36 },
      analysis: { price: { dailyChange: -7.15 } }
    }
  ],
  lastUpdated: new Date().toISOString()
};
