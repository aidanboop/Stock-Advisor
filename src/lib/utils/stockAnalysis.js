/**
 * Stock analysis utilities for evaluating buy recommendations
 * Updated to work with Polygon.io data
 */

/**
 * Analyze technical indicators from Polygon.io data
 * @param {Object} aggregatesData - Stock aggregates data from Polygon.io
 * @param {Object} technicalIndicators - Technical indicators data from Polygon.io
 * @returns {Object} Technical analysis results with scores and recommendations
 */
export const analyzeTechnicalIndicators = (aggregatesData, technicalIndicators = null) => {
  try {
    if (!aggregatesData || !aggregatesData.results) {
      return { score: 0, recommendation: 'NEUTRAL', reasons: ['Insufficient technical data'] };
    }

    const results = aggregatesData.results;
    
    // Need at least a few data points for analysis
    if (!results || results.length < 5) {
      return { score: 0, recommendation: 'NEUTRAL', reasons: ['Insufficient price history'] };
    }
    
    // Calculate short, intermediate, and long-term trends
    const shortTermPrices = results.slice(-5);
    const intermediateTermPrices = results.slice(-14);
    const longTermPrices = results.slice(-30);
    
    // Calculate trends (simple version: compare first and last price)
    const shortTermTrend = calculateTrend(shortTermPrices);
    const intermediateTermTrend = calculateTrend(intermediateTermPrices);
    const longTermTrend = calculateTrend(longTermPrices);
    
    // Calculate moving averages
    const latestClose = results[results.length - 1].c;
    const sma5 = calculateSMA(results, 5);
    const sma10 = calculateSMA(results, 10);
    const sma20 = calculateSMA(results, 20);
    
    // SMA cross signals
    const sma5Above20 = sma5 > sma20;
    const sma5Above10 = sma5 > sma10;
    const sma10Above20 = sma10 > sma20;
    const priceAboveSMA5 = latestClose > sma5;
    const priceAboveSMA20 = latestClose > sma20;
    
    // Calculate a score (0-100)
    let score = 50; // Neutral starting point
    
    // Short-term trend has highest weight
    if (shortTermTrend.direction === 'up') score += 10;
    else if (shortTermTrend.direction === 'down') score -= 10;
    
    // Intermediate-term trend
    if (intermediateTermTrend.direction === 'up') score += 7;
    else if (intermediateTermTrend.direction === 'down') score -= 7;
    
    // Long-term trend
    if (longTermTrend.direction === 'up') score += 5;
    else if (longTermTrend.direction === 'down') score -= 5;
    
    // SMA signals
    if (sma5Above20) score += 5;
    else score -= 5;
    
    if (sma5Above10) score += 3;
    else score -= 3;
    
    if (priceAboveSMA5) score += 5;
    else score -= 5;
    
    if (priceAboveSMA20) score += 5;
    else score -= 5;
    
    // Clamp score to 0-100
    score = Math.min(100, Math.max(0, score));
    
    // Determine recommendation based on score
    let recommendation = 'NEUTRAL';
    if (score >= 70) recommendation = 'STRONG_BUY';
    else if (score >= 60) recommendation = 'BUY';
    else if (score <= 30) recommendation = 'SELL';
    else if (score <= 40) recommendation = 'WEAK_HOLD';
    else recommendation = 'HOLD';
    
    // Collect reasons for recommendation
    const reasons = [];
    if (shortTermTrend.direction === 'up') reasons.push('Positive short-term price trend');
    if (shortTermTrend.direction === 'down') reasons.push('Negative short-term price trend');
    
    if (intermediateTermTrend.direction === 'up') reasons.push('Positive intermediate-term price trend');
    if (intermediateTermTrend.direction === 'down') reasons.push('Negative intermediate-term price trend');
    
    if (longTermTrend.direction === 'up') reasons.push('Positive long-term price trend');
    if (longTermTrend.direction === 'down') reasons.push('Negative long-term price trend');
    
    if (sma5Above20) reasons.push('Short-term moving average above long-term (bullish)');
    else reasons.push('Short-term moving average below long-term (bearish)');
    
    if (priceAboveSMA5 && priceAboveSMA20) reasons.push('Price above key moving averages');
    if (!priceAboveSMA5 && !priceAboveSMA20) reasons.push('Price below key moving averages');
    
    return {
      score,
      recommendation,
      reasons,
      details: {
        shortTerm: {
          direction: shortTermTrend.direction,
          score: normalizeScore(shortTermTrend.percentChange),
          description: `${shortTermTrend.percentChange > 0 ? '+' : ''}${shortTermTrend.percentChange.toFixed(2)}% over 5 days`
        },
        intermediateTerm: {
          direction: intermediateTermTrend.direction,
          score: normalizeScore(intermediateTermTrend.percentChange),
          description: `${intermediateTermTrend.percentChange > 0 ? '+' : ''}${intermediateTermTrend.percentChange.toFixed(2)}% over 14 days`
        },
        longTerm: {
          direction: longTermTrend.direction,
          score: normalizeScore(longTermTrend.percentChange),
          description: `${longTermTrend.percentChange > 0 ? '+' : ''}${longTermTrend.percentChange.toFixed(2)}% over 30 days`
        }
      }
    };
  } catch (error) {
    console.error('Error analyzing technical indicators:', error);
    return { score: 0, recommendation: 'NEUTRAL', reasons: ['Error analyzing technical data'] };
  }
};

/**
 * Calculate trend direction and percent change
 * @param {Array} prices - Array of price data
 * @returns {Object} Trend information
 */
function calculateTrend(prices) {
  if (!prices || prices.length < 2) {
    return { direction: 'neutral', percentChange: 0 };
  }
  
  const firstPrice = prices[0].c;
  const lastPrice = prices[prices.length - 1].c;
  const percentChange = ((lastPrice - firstPrice) / firstPrice) * 100;
  
  let direction = 'neutral';
  if (percentChange > 1) direction = 'up';
  else if (percentChange < -1) direction = 'down';
  
  return { direction, percentChange };
}

/**
 * Normalize trend score to 0-100 scale
 * @param {Number} percentChange - Percent change
 * @returns {Number} Normalized score
 */
function normalizeScore(percentChange) {
  // Scale: -10% to +10% mapped to 0-100
  const score = 50 + (percentChange * 5);
  return Math.min(100, Math.max(0, score));
}

/**
 * Analyze insider trading activity from Polygon.io data
 * @param {Object} insiderTransactionsData - Insider transactions data from Polygon.io
 * @returns {Object} Insider trading analysis with score and insights
 */
export const analyzeInsiderTrading = (insiderTransactionsData) => {
  try {
    if (!insiderTransactionsData || !insiderTransactionsData.results) {
      return { score: 50, sentiment: 'NEUTRAL', reasons: ['No recent insider trading data'] };
    }

    const transactions = insiderTransactionsData.results;
    
    // Calculate insider trading score based on recent transactions
    let buyCount = 0;
    let sellCount = 0;
    let totalShares = 0;
    let buyShares = 0;
    let sellShares = 0;
    const recentTransactions = [];
    
    // Process each transaction (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    transactions.forEach(transaction => {
      // Filter for recent transactions
      const transactionDate = new Date(transaction.filing_date);
      if (transactionDate < thirtyDaysAgo) return;
      
      const transactionData = {
        name: transaction.insider_name || 'Unknown',
        relation: transaction.insider_title || 'Insider',
        date: transaction.filing_date,
        description: transaction.transaction_type || '',
        shares: transaction.share_count || 0
      };
      
      // Categorize transaction
      if (transaction.transaction_type === 'P' || // Purchase
          transaction.transaction_type === 'A') { // Acquisition
        buyCount++;
        buyShares += transaction.share_count || 0;
        transactionData.type = 'BUY';
      } 
      else if (transaction.transaction_type === 'S' || // Sale
               transaction.transaction_type === 'D') { // Disposition
        sellCount++;
        sellShares += transaction.share_count || 0;
        transactionData.type = 'SELL';
      } 
      else {
        transactionData.type = 'OTHER';
      }
      
      totalShares += transaction.share_count || 0;
      recentTransactions.push(transactionData);
    });
    
    // Calculate insider sentiment score (0-100)
    let insiderScore = 50; // Neutral starting point
    
    if (buyCount > 0 || sellCount > 0) {
      // Transaction count ratio
      const transactionRatio = buyCount / (buyCount + sellCount) || 0.5;
      
      // Share volume ratio (if available)
      const volumeRatio = buyShares / (buyShares + sellShares) || 0.5;
      
      // Combined score (weighted more toward volume than count)
      insiderScore = Math.round((volumeRatio * 0.7 + transactionRatio * 0.3) * 100);
    }
    
    // Determine sentiment based on score
    let sentiment = 'NEUTRAL';
    if (insiderScore >= 70) sentiment = 'VERY_BULLISH';
    else if (insiderScore >= 60) sentiment = 'BULLISH';
    else if (insiderScore <= 30) sentiment = 'VERY_BEARISH';
    else if (insiderScore <= 40) sentiment = 'BEARISH';
    
    // Generate reasons
    const reasons = [];
    if (buyCount > sellCount) {
      reasons.push(`More insider buys (${buyCount}) than sells (${sellCount})`);
    } else if (sellCount > buyCount) {
      reasons.push(`More insider sells (${sellCount}) than buys (${buyCount})`);
    }
    
    if (buyShares > sellShares) {
      reasons.push('Higher volume of shares bought than sold by insiders');
    } else if (sellShares > buyShares) {
      reasons.push('Higher volume of shares sold than bought by insiders');
    }
    
    if (reasons.length === 0) {
      reasons.push('Limited or balanced insider trading activity');
    }
    
    return {
      score: insiderScore,
      sentiment,
      reasons,
      details: {
        buyCount,
        sellCount,
        buyShares,
        sellShares,
        recentTransactions: recentTransactions.slice(0, 5) // Limit to 5 most recent
      }
    };
  } catch (error) {
    console.error('Error analyzing insider trading:', error);
    return { score: 50, sentiment: 'NEUTRAL', reasons: ['Error analyzing insider trading data'] };
  }
};

/**
 * Analyze price trends from Polygon.io aggregates data
 * @param {Object} aggregatesData - Stock aggregates data from Polygon.io
 * @returns {Object} Price trend analysis with momentum indicators
 */
export const analyzePriceTrends = (aggregatesData) => {
  try {
    if (!aggregatesData || !aggregatesData.results) {
      return { score: 50, trend: 'NEUTRAL', reasons: ['Insufficient price data'] };
    }

    const results = aggregatesData.results;
    
    // Ensure we have enough data points
    if (results.length < 10) {
      return { score: 50, trend: 'NEUTRAL', reasons: ['Insufficient price history'] };
    }
    
    // Extract price data
    const closes = results.map(result => result.c);
    const volumes = results.map(result => result.v);
    
    // Calculate simple moving averages
    const sma5 = calculateSMA(results, 5);
    const sma10 = calculateSMA(results, 10);
    const sma20 = calculateSMA(results, 20);
    
    // Calculate price momentum (% change)
    const latestClose = closes[closes.length - 1];
    const prevClose = closes[closes.length - 2];
    const weekAgoIndex = Math.max(0, closes.length - 6);
    const monthAgoIndex = Math.max(0, closes.length - 21);
    const weekAgoClose = closes[weekAgoIndex];
    const monthAgoClose = closes[monthAgoIndex];
    
    const dailyChange = ((latestClose - prevClose) / prevClose) * 100;
    const weeklyChange = ((latestClose - weekAgoClose) / weekAgoClose) * 100;
    const monthlyChange = ((latestClose - monthAgoClose) / monthAgoClose) * 100;
    
    // Volume trend analysis
    const recentVolumes = volumes.slice(-5).filter(v => v !== null);
    const avgVolume = recentVolumes.reduce((sum, vol) => sum + vol, 0) / recentVolumes.length;
    const latestVolume = volumes[volumes.length - 1];
    const volumeRatio = latestVolume / avgVolume;
    
    // Calculate trend score (0-100)
    let momentumScore = 50; // Neutral starting point
    
    // Daily momentum has highest weight
    momentumScore += dailyChange * 2;
    
    // Weekly and monthly trends
    momentumScore += weeklyChange * 1;
    momentumScore += monthlyChange * 0.5;
    
    // SMA crossovers
    if (sma5 > sma20) {
      momentumScore += 5; // Bullish when short-term SMA above long-term
    } else {
      momentumScore -= 5; // Bearish when short-term SMA below long-term
    }
    
    // Volume confirmation
    if (dailyChange > 0 && volumeRatio > 1.2) {
      momentumScore += 5; // Strong up move with above-average volume
    } else if (dailyChange < 0 && volumeRatio > 1.2) {
      momentumScore -= 5; // Strong down move with above-average volume
    }
    
    // Normalize score to 0-100 range
    momentumScore = Math.min(100, Math.max(0, momentumScore));
    
    // Determine trend based on score
    let trend = 'NEUTRAL';
    if (momentumScore >= 70) trend = 'STRONG_UPTREND';
    else if (momentumScore >= 60) trend = 'UPTREND';
    else if (momentumScore <= 30) trend = 'STRONG_DOWNTREND';
    else if (momentumScore <= 40) trend = 'DOWNTREND';
    
    // Generate reasons
    const reasons = [];
    if (dailyChange > 1) reasons.push(`Strong daily gain of ${dailyChange.toFixed(2)}%`);
    else if (dailyChange < -1) reasons.push(`Significant daily loss of ${dailyChange.toFixed(2)}%`);
    
    if (weeklyChange > 5) reasons.push(`Strong weekly gain of ${weeklyChange.toFixed(2)}%`);
    else if (weeklyChange < -5) reasons.push(`Significant weekly loss of ${weeklyChange.toFixed(2)}%`);
    
    if (sma5 > sma20) {
      reasons.push('Short-term moving average above long-term (bullish)');
    } else {
      reasons.push('Short-term moving average below long-term (bearish)');
    }
    
    if (volumeRatio > 1.2) reasons.push('Trading on above-average volume');
    else if (volumeRatio < 0.8) reasons.push('Trading on below-average volume');
    
    return {
      score: momentumScore,
      trend,
      reasons,
      details: {
        dailyChange,
        weeklyChange,
        monthlyChange,
        latestClose,
        volumeRatio,
        sma5,
        sma20
      }
    };
  } catch (error) {
    console.error('Error analyzing price trends:', error);
    return { score: 50, trend: 'NEUTRAL', reasons: ['Error analyzing price data'] };
  }
};

/**
 * Calculate Simple Moving Average
 * @param {Array} data - Array of price data
 * @param {Number} period - Period for SMA calculation
 * @returns {Number} SMA value
 */
const calculateSMA = (data, period) => {
  if (!data || data.length < period) {
    return null;
  }
  
  // Get the closing prices for the last 'period' days
  const closingPrices = data.slice(-period).map(item => item.c);
  
  // Calculate the sum
  const sum = closingPrices.reduce((total, price) => total + price, 0);
  
  // Return the average
  return sum / period;
};

/**
 * Generate comprehensive buy recommendation using Polygon.io data
 * @param {Object} stockData - Comprehensive stock data from Polygon.io
 * @returns {Object} Buy recommendation with score and detailed analysis
 */
export const generateBuyRecommendation = (stockData) => {
  try {
    const { symbol, aggregatesData, tickerDetailsData, insiderTransactionsData } = stockData;
    
    // Run individual analyses
    const technicalAnalysis = analyzeTechnicalIndicators(aggregatesData);
    const insiderAnalysis = analyzeInsiderTrading(insiderTransactionsData);
    const priceAnalysis = analyzePriceTrends(aggregatesData);
    
    // Calculate weighted buy score (0-100)
    // Technical indicators: 40%, Insider trading: 40%, Price trends: 20%
    const buyScore = (
      (technicalAnalysis.score * 0.4) +
      (insiderAnalysis.score * 0.4) +
      (priceAnalysis.score * 0.2)
    );
    
    // Determine recommendation
    let recommendation = 'HOLD';
    if (buyScore >= 75) recommendation = 'STRONG_BUY';
    else if (buyScore >= 65) recommendation = 'BUY';
    else if (buyScore <= 35) recommendation = 'STRONG_SELL';
    else if (buyScore <= 45) recommendation = 'SELL';
    else recommendation = 'HOLD';
    
    // Get stock metadata
    const stockName = tickerDetailsData?.results?.name || symbol;
    
    // Get last price
    const lastPrice = aggregatesData?.results ? 
      aggregatesData.results[aggregatesData.results.length - 1].c : 
      null;
    
    // Get exchange
    const exchange = tickerDetailsData?.results?.primary_exchange || 'Unknown';
    
    // Compile key reasons for recommendation
    const allReasons = [
      ...technicalAnalysis.reasons,
      ...insiderAnalysis.reasons,
      ...priceAnalysis.reasons
    ];
    
    // Select top reasons (prioritize strongest signals)
    const keyReasons = allReasons
      .filter(reason => !reason.includes('Error') && !reason.includes('Insufficient'))
      .slice(0, 5);
    
    if (keyReasons.length === 0) {
      keyReasons.push('Insufficient data for strong recommendation');
    }
    
    return {
      symbol,
      name: stockName,
      score: Math.round(buyScore),
      recommendation,
      lastUpdated: new Date().toISOString(),
      keyReasons,
      analysis: {
        technical: technicalAnalysis,
        insider: insiderAnalysis,
        price: priceAnalysis
      },
      metadata: {
        price: lastPrice,
        currency: 'USD',
        exchange: exchange
      }
    };
  } catch (error) {
    console.error(`Error generating buy recommendation for ${stockData.symbol}:`, error);
    return {
      symbol: stockData.symbol,
      score: 50,
      recommendation: 'NEUTRAL',
      lastUpdated: new Date().toISOString(),
      keyReasons: ['Error generating recommendation'],
      analysis: {}
    };
  }
};
