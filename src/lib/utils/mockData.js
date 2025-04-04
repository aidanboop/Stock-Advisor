/**
 * Mock data for stock recommendations to use as fallback when API calls fail
 * Place this file at: src/lib/utils/mockData.js
 */

// Mock tech stock recommendations
export const mockTechRecommendations = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    recommendation: 'STRONG_BUY',
    score: 82,
    keyReasons: [
      'Positive short-term outlook',
      'Strong earnings growth',
      'High institutional ownership',
      'New product launches expected',
      'Trading above 50-day moving average'
    ],
    analysis: {
      technical: { score: 85 },
      insider: { score: 78 },
      price: { 
        score: 84,
        dailyChange: 1.23
      }
    },
    metadata: {
      price: 182.52,
      exchange: 'NASDAQ'
    }
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    recommendation: 'BUY',
    score: 76,
    keyReasons: [
      'Cloud revenue growth',
      'AI integration across product lines',
      'Strong balance sheet',
      'Dividend growth',
      'Positive technical indicators'
    ],
    analysis: {
      technical: { score: 72 },
      insider: { score: 81 },
      price: { 
        score: 75,
        dailyChange: 0.87
      }
    },
    metadata: {
      price: 415.63,
      exchange: 'NASDAQ'
    }
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    recommendation: 'STRONG_BUY',
    score: 88,
    keyReasons: [
      'Leading AI chip provider',
      'Strong revenue growth',
      'Increased institutional buying',
      'Positive momentum',
      'Industry-leading position'
    ],
    analysis: {
      technical: { score: 92 },
      insider: { score: 80 },
      price: { 
        score: 85,
        dailyChange: 2.14
      }
    },
    metadata: {
      price: 892.16,
      exchange: 'NASDAQ'
    }
  },
  {
    symbol: 'AMD',
    name: 'Advanced Micro Devices, Inc.',
    recommendation: 'BUY',
    score: 74,
    keyReasons: [
      'Server market share gains',
      'Competitive chip performance',
      'Positive analyst revisions',
      'AI acceleration products',
      'Strong technical setup'
    ],
    analysis: {
      technical: { score: 77 },
      insider: { score: 68 },
      price: { 
        score: 75,
        dailyChange: 1.56
      }
    },
    metadata: {
      price: 166.40,
      exchange: 'NASDAQ'
    }
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    recommendation: 'BUY',
    score: 72,
    keyReasons: [
      'Search dominance',
      'YouTube growth',
      'AI integration',
      'Cloud revenue expansion',
      'Reasonable valuation'
    ],
    analysis: {
      technical: { score: 68 },
      insider: { score: 76 },
      price: { 
        score: 70,
        dailyChange: 0.52
      }
    },
    metadata: {
      price: 154.85,
      exchange: 'NASDAQ'
    }
  }
];

// Mock broader market recommendations
export const mockAllRecommendations = [
  ...mockTechRecommendations.slice(0, 2),
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    recommendation: 'BUY',
    score: 75,
    keyReasons: [
      'Interest rate environment',
      'Strong balance sheet',
      'Dividend growth',
      'Trading operations',
      'Investment banking recovery'
    ],
    analysis: {
      technical: { score: 70 },
      insider: { score: 79 },
      price: { 
        score: 77,
        dailyChange: 0.94
      }
    },
    metadata: {
      price: 186.37,
      exchange: 'NYSE'
    }
  },
  {
    symbol: 'JNJ',
    name: 'Johnson & Johnson',
    recommendation: 'BUY',
    score: 73,
    keyReasons: [
      'Defensive stock',
      'Stable dividend',
      'Healthcare sector stability',
      'Product pipeline',
      'Litigation resolutions'
    ],
    analysis: {
      technical: { score: 68 },
      insider: { score: 78 },
      price: { 
        score: 74,
        dailyChange: 0.32
      }
    },
    metadata: {
      price: 152.88,
      exchange: 'NYSE'
    }
  },
  {
    symbol: 'PG',
    name: 'Procter & Gamble Co.',
    recommendation: 'BUY',
    score: 71,
    keyReasons: [
      'Consumer staples leader',
      'Pricing power',
      'Stable cash flow',
      'Dividend aristocrat',
      'Global brand strength'
    ],
    analysis: {
      technical: { score: 65 },
      insider: { score: 77 },
      price: { 
        score: 73,
        dailyChange: 0.18
      }
    },
    metadata: {
      price: 166.92,
      exchange: 'NYSE'
    }
  }
];

// Mock market overview data
export const mockMarketOverview = {
  indices: [
    {
      symbol: '^GSPC',
      name: 'S&P 500',
      metadata: { price: 5,116.17 },
      analysis: { price: { dailyChange: 0.74 } }
    },
    {
      symbol: '^DJI',
      name: 'Dow Jones Industrial Average',
      metadata: { price: 38,143.33 },
      analysis: { price: { dailyChange: 0.56 } }
    },
    {
      symbol: '^IXIC',
      name: 'NASDAQ Composite',
      metadata: { price: 16,275.37 },
      analysis: { price: { dailyChange: 1.14 } }
    },
    {
      symbol: '^RUT',
      name: 'Russell 2000',
      metadata: { price: 2,053.14 },
      analysis: { price: { dailyChange: 0.82 } }
    },
    {
      symbol: '^VIX',
      name: 'CBOE Volatility Index',
      metadata: { price: 15.47 },
      analysis: { price: { dailyChange: -3.25 } }
    }
  ],
  sectors: [
    {
      symbol: 'XLK',
      name: 'Technology',
      metadata: { price: 212.45 },
      analysis: { price: { dailyChange: 1.37 } }
    },
    {
      symbol: 'XLF',
      name: 'Financial',
      metadata: { price: 40.13 },
      analysis: { price: { dailyChange: 0.82 } }
    },
    {
      symbol: 'XLV',
      name: 'Healthcare',
      metadata: { price: 150.28 },
      analysis: { price: { dailyChange: 0.41 } }
    },
    {
      symbol: 'XLE',
      name: 'Energy',
      metadata: { price: 93.16 },
      analysis: { price: { dailyChange: -0.28 } }
    },
    {
      symbol: 'XLY',
      name: 'Consumer Discretionary',
      metadata: { price: 186.57 },
      analysis: { price: { dailyChange: 0.93 } }
    }
  ],
  lastUpdated: new Date().toISOString()
};
