/**
 * Stock analysis utilities for evaluating buy recommendations
 */

/**
 * Analyze technical indicators from stock insights data
 * @param {Object} insightsData - Stock insights data from Yahoo Finance API
 * @returns {Object} Technical analysis results with scores and recommendations
 */
export const analyzeTechnicalIndicators = (insightsData) => {
  try {
    if (!insightsData?.finance?.result?.instrumentInfo?.technicalEvents) {
      return { score: 0, recommendation: 'NEUTRAL', reasons: ['Insufficient technical data'] };
    }

    const technicalEvents = insightsData.finance.result.instrumentInfo.technicalEvents;
    const shortTerm = technicalEvents.shortTermOutlook || {};
    const intermediateTerm = technicalEvents.intermediateTermOutlook || {};
    const longTerm = technicalEvents.longTermOutlook || {};
    
    // Calculate weighted score (short term has highest weight)
    const shortTermScore = shortTerm.score || 0;
    const intermediateTermScore = intermediateTerm.score || 0;
    const longTermScore = longTerm.score || 0;
    
    // Weight factors (short term is most important for daily recommendations)
    const weightedScore = (
      (shortTermScore * 0.5) + 
      (intermediateTermScore * 0.3) + 
      (longTermScore * 0.2)
    );
    
    // Normalize to 0-100 scale
    const normalizedScore = Math.min(100, Math.max(0, weightedScore * 10));
    
    // Determine recommendation based on score
    let recommendation = 'NEUTRAL';
    if (normalizedScore >= 70) recommendation = 'STRONG_BUY';
    else if (normalizedScore >= 60) recommendation = 'BUY';
    else if (normalizedScore <= 30) recommendation = 'SELL';
    else if (normalizedScore <= 40) recommendation = 'WEAK_HOLD';
    else recommendation = 'HOLD';
    
    // Collect reasons for recommendation
    const reasons = [];
    if (shortTerm.direction === 'up') reasons.push('Positive short-term outlook');
    if (shortTerm.direction === 'down') reasons.push('Negative short-term outlook');
    if (intermediateTerm.direction === 'up') reasons.push('Positive intermediate-term outlook');
    if (intermediateTerm.direction === 'down') reasons.push('Negative intermediate-term outlook');
    if (longTerm.direction === 'up') reasons.push('Positive long-term outlook');
    if (longTerm.direction === 'down') reasons.push('Negative long-term outlook');
    
    return {
      score: normalizedScore,
      recommendation,
      reasons,
      details: {
        shortTerm: {
          direction: shortTerm.direction,
          score: shortTerm.score,
          description: shortTerm.scoreDescription
        },
        intermediateTerm: {
          direction: intermediateTerm.direction,
          score: intermediateTerm.score,
          description: intermediateTerm.scoreDescription
        },
        longTerm: {
          direction: longTerm.direction,
          score: longTerm.score,
          description: longTerm.scoreDescription
        }
      }
    };
  } catch (error) {
    console.error('Error analyzing technical indicators:', error);
    return { score: 0, recommendation: 'NEUTRAL', reasons: ['Error analyzing technical data'] };
  }
};

/**
 * Analyze insider trading activity
 * @param {Object} holdersData - Stock holders data from Yahoo Finance API
 * @returns {Object} Insider trading analysis with score and insights
 */
export const analyzeInsiderTrading = (holdersData) => {
  try {
    if (!holdersData?.quoteSummary?.result?.[0]?.insiderHolders?.holders) {
      return { score: 50, sentiment: 'NEUTRAL', reasons: ['No recent insider trading data'] };
    }

    const holders = holdersData.quoteSummary.result[0].insiderHolders.holders;
    
    // Calculate insider trading score based on recent transactions
    let buyCount = 0;
    let sellCount = 0;
    let totalShares = 0;
    let buyShares = 0;
    let sellShares = 0;
    const recentTransactions = [];
    
    // Process each insider's transactions
    holders.forEach(holder => {
      if (!holder.transactionDescription || !holder.latestTransDate) return;
      
      const transaction = {
        name: holder.name,
        relation: holder.relation,
        date: holder.latestTransDate.fmt,
        description: holder.transactionDescription,
        shares: holder.positionDirect?.raw || 0
      };
      
      // Add to transaction count based on description
      const desc = holder.transactionDescription.toLowerCase();
      if (desc.includes('buy') || desc.includes('purchase') || desc.includes('acquire')) {
        buyCount++;
        buyShares += holder.positionDirect?.raw || 0;
        transaction.type = 'BUY';
      } else if (desc.includes('sell') || desc.includes('dispose')) {
        sellCount++;
        sellShares += holder.positionDirect?.raw || 0;
        transaction.type = 'SELL';
      } else {
        transaction.type = 'OTHER';
      }
      
      totalShares += holder.positionDirect?.raw || 0;
      recentTransactions.push(transaction);
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
 * Analyze price trends from chart data
 * @param {Object} chartData - Stock chart data from Yahoo Finance API
 * @returns {Object} Price trend analysis with momentum indicators
 */
export const analyzePriceTrends = (chartData) => {
  try {
    if (!chartData?.chart?.result?.[0]?.indicators?.quote?.[0]) {
      return { score: 50, trend: 'NEUTRAL', reasons: ['Insufficient price data'] };
    }

    const result = chartData.chart.result[0];
    const quote = result.indicators.quote[0];
    const timestamps = result.timestamp || [];
    const closes = quote.close || [];
    const volumes = quote.volume || [];
    
    // Ensure we have enough data points
    if (closes.length < 10 || timestamps.length < 10) {
      return { score: 50, trend: 'NEUTRAL', reasons: ['Insufficient price history'] };
    }
    
    // Calculate simple moving averages
    const sma5 = calculateSMA(closes, 5);
    const sma10 = calculateSMA(closes, 10);
    const sma20 = calculateSMA(closes, 20);
    
    // Calculate price momentum (% change)
    const latestClose = closes[closes.length - 1];
    const prevClose = closes[closes.length - 2];
    const weekAgoClose = closes[Math.max(0, closes.length - 6)];
    const monthAgoClose = closes[Math.max(0, closes.length - 21)];
    
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
    if (sma5[sma5.length - 1] > sma20[sma20.length - 1]) {
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
    
    if (sma5[sma5.length - 1] > sma20[sma20.length - 1]) {
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
        sma5: sma5[sma5.length - 1],
        sma20: sma20[sma20.length - 1]
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
 * @returns {Array} Array of SMA values
 */
const calculateSMA = (data, period) => {
  const result = [];
  
  // Not enough data for the period
  if (data.length < period) {
    return Array(data.length).fill(null);
  }
  
  // Calculate initial sum
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i] || 0;
  }
  
  // Calculate SMA for each point
  for (let i = 0; i < data.length; i++) {
    if (i >= period) {
      // Remove oldest and add newest for rolling sum
      sum = sum - (data[i - period] || 0) + (data[i] || 0);
      result.push(sum / period);
    } else if (i === period - 1) {
      // First complete period
      result.push(sum / period);
    } else {
      // Not enough data yet
      result.push(null);
    }
  }
  
  return result;
};

/**
 * Generate comprehensive buy recommendation
 * @param {Object} stockData - Comprehensive stock data
 * @returns {Object} Buy recommendation with score and detailed analysis
 */
export const generateBuyRecommendation = (stockData) => {
  try {
    const { symbol, chartData, holdersData, insightsData } = stockData;
    
    // Run individual analyses
    const technicalAnalysis = analyzeTechnicalIndicators(insightsData);
    const insiderAnalysis = analyzeInsiderTrading(holdersData);
    const priceAnalysis = analyzePriceTrends(chartData);
    
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
    const meta = chartData?.chart?.result?.[0]?.meta || {};
    const stockName = meta.shortName || meta.longName || symbol;
    
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
        price: meta.regularMarketPrice,
        currency: meta.currency,
        exchange: meta.exchangeName
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
