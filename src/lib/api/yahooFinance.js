/**
 * Yahoo Finance API client for fetching stock data
 */

// Helper function to create API client
const createApiClient = async () => {
  try {
    // For Vercel deployment, we'll use fetch directly
    return {
      call_api: async (apiName, params) => {
        // This is a simplified implementation for demonstration
        // In a production environment, you would use a proper API key and authentication
        
        const baseUrl = 'https://query1.finance.yahoo.com/v8';
        let endpoint = '';
        
        if (apiName === 'YahooFinance/get_stock_chart') {
          endpoint = '/chart/' + params.query.symbol;
          const queryParams = new URLSearchParams({
            region: params.query.region || 'US',
            interval: params.query.interval || '1d',
            range: params.query.range || '1mo',
          });
          return fetch(`${baseUrl}${endpoint}?${queryParams}`).then(res => res.json());
        }
        
        if (apiName === 'YahooFinance/get_stock_holders') {
          endpoint = '/finance/quoteSummary/' + params.query.symbol;
          const queryParams = new URLSearchParams({
            modules: 'insiderHolders',
            region: params.query.region || 'US',
          });
          return fetch(`${baseUrl}${endpoint}?${queryParams}`).then(res => res.json());
        }
        
        if (apiName === 'YahooFinance/get_stock_insights') {
          endpoint = '/finance/insights/' + params.query.symbol;
          return fetch(`${baseUrl}${endpoint}`).then(res => res.json());
        }
        
        throw new Error(`Unknown API: ${apiName}`);
      }
    };
  } catch (error) {
    console.error('Error creating API client:', error);
    throw new Error('Failed to initialize API client');
  }
};

/**
 * Fetch stock chart data
 * @param {string} symbol - Stock symbol
 * @param {string} interval - Data interval (1d, 1h, etc.)
 * @param {string} range - Data range (1d, 5d, 1mo, etc.)
 */
export const getStockChart = async (symbol, interval = '1h', range = '1d') => {
  try {
    const client = await createApiClient();
    const data = await client.call_api('YahooFinance/get_stock_chart', {
      query: {
        symbol,
        region: 'US',
        interval,
        range,
        includePrePost: false,
        includeAdjustedClose: true,
      }
    });
    return data;
  } catch (error) {
    console.error(`Error fetching chart data for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Fetch stock insider trading information
 * @param {string} symbol - Stock symbol
 */
export const getStockHolders = async (symbol) => {
  try {
    const client = await createApiClient();
    const data = await client.call_api('YahooFinance/get_stock_holders', {
      query: {
        symbol,
        region: 'US',
        lang: 'en-US',
      }
    });
    return data;
  } catch (error) {
    console.error(`Error fetching holders data for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Fetch stock technical insights and analysis
 * @param {string} symbol - Stock symbol
 */
export const getStockInsights = async (symbol) => {
  try {
    const client = await createApiClient();
    const data = await client.call_api('YahooFinance/get_stock_insights', {
      query: {
        symbol,
      }
    });
    return data;
  } catch (error) {
    console.error(`Error fetching insights data for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Fetch comprehensive stock data (chart, holders, insights)
 * @param {string} symbol - Stock symbol
 */
export const getComprehensiveStockData = async (symbol) => {
  try {
    const [chartData, holdersData, insightsData] = await Promise.all([
      getStockChart(symbol, '1d', '1mo'),
      getStockHolders(symbol),
      getStockInsights(symbol),
    ]);
    
    return {
      symbol,
      chartData,
      holdersData,
      insightsData,
    };
  } catch (error) {
    console.error(`Error fetching comprehensive data for ${symbol}:`, error);
    throw error;
  }
};
