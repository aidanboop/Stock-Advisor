/**
 * Updated Yahoo Finance API client that uses our proxy endpoint
 * Place this file at: src/lib/api/yahooFinance.js (replacing the existing file)
 */

// Helper function to create API client
const createApiClient = async () => {
  try {
    // Use our proxy API route to avoid CORS issues
    return {
      call_api: async (apiName, params) => {
        const baseUrl = '/api/finance-proxy';
        let endpoint = '';
        let queryParams = new URLSearchParams();
        
        if (apiName === 'YahooFinance/get_stock_chart') {
          endpoint = 'chart';
          queryParams.append('endpoint', endpoint);
          queryParams.append('symbol', params.query.symbol);
          queryParams.append('region', params.query.region || 'US');
          queryParams.append('interval', params.query.interval || '1d');
          queryParams.append('range', params.query.range || '1mo');
          
          return fetch(`${baseUrl}?${queryParams.toString()}`).then(res => res.json());
        }
        
        if (apiName === 'YahooFinance/get_stock_holders') {
          endpoint = 'quoteSummary';
          queryParams.append('endpoint', endpoint);
          queryParams.append('symbol', params.query.symbol);
          queryParams.append('modules', 'insiderHolders');
          queryParams.append('region', params.query.region || 'US');
          
          return fetch(`${baseUrl}?${queryParams.toString()}`).then(res => res.json());
        }
        
        if (apiName === 'YahooFinance/get_stock_insights') {
          endpoint = 'insights';
          queryParams.append('endpoint', endpoint);
          queryParams.append('symbol', params.query.symbol);
          
          return fetch(`${baseUrl}?${queryParams.toString()}`).then(res => res.json());
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
    const response = await client.call_api('YahooFinance/get_stock_chart', {
      query: {
        symbol,
        region: 'US',
        interval,
        range,
        includePrePost: false,
        includeAdjustedClose: true,
      }
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch chart data');
    }
    
    return response.data;
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
    const response = await client.call_api('YahooFinance/get_stock_holders', {
      query: {
        symbol,
        region: 'US',
        lang: 'en-US',
      }
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch holders data');
    }
    
    return response.data;
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
    const response = await client.call_api('YahooFinance/get_stock_insights', {
      query: {
        symbol,
      }
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch insights data');
    }
    
    return response.data;
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
    // Since we might hit rate limits or have other issues, use Promise.allSettled
    // to get as much data as possible, even if some requests fail
    const [chartResult, holdersResult, insightsResult] = await Promise.allSettled([
      getStockChart(symbol, '1d', '1mo'),
      getStockHolders(symbol),
      getStockInsights(symbol),
    ]);
    
    // Extract values or null for each result
    const chartData = chartResult.status === 'fulfilled' ? chartResult.value : null;
    const holdersData = holdersResult.status === 'fulfilled' ? holdersResult.value : null;
    const insightsData = insightsResult.status === 'fulfilled' ? insightsResult.value : null;
    
    // Return whatever data we have
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
