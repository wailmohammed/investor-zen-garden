interface StockDividendInfo {
  symbol: string;
  annualDividend: number;
  quarterlyDividend: number;
  exDate: string;
  paymentDate: string;
  yield: number;
  frequency: 'quarterly' | 'annual' | 'monthly' | 'semi-annual';
}

interface Position {
  symbol: string;
  quantity: number;
  currentPrice: number;
  marketValue: number;
}

// Comprehensive dividend data for major dividend-paying stocks
const DIVIDEND_DATA_SOURCES = {
  DIVIDEND_CHAMPIONS: {
    // Technology
    'AAPL': { annual: 0.96, quarterly: 0.24, yield: 0.49, frequency: 'quarterly' as const },
    'MSFT': { annual: 3.00, quarterly: 0.75, yield: 0.72, frequency: 'quarterly' as const },
    'INTC': { annual: 0.50, quarterly: 0.125, yield: 2.1, frequency: 'quarterly' as const },
    'IBM': { annual: 6.63, quarterly: 1.6575, yield: 3.5, frequency: 'quarterly' as const },
    'ORCL': { annual: 1.60, quarterly: 0.40, yield: 1.2, frequency: 'quarterly' as const },
    'CSCO': { annual: 1.60, quarterly: 0.40, yield: 3.0, frequency: 'quarterly' as const },
    'TXN': { annual: 5.20, quarterly: 1.30, yield: 2.8, frequency: 'quarterly' as const },
    'QCOM': { annual: 3.04, quarterly: 0.76, yield: 2.2, frequency: 'quarterly' as const },
    'AVGO': { annual: 20.40, quarterly: 5.10, yield: 1.9, frequency: 'quarterly' as const },
    'ADBE': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    
    // Healthcare & Pharmaceuticals
    'JNJ': { annual: 4.76, quarterly: 1.19, yield: 3.1, frequency: 'quarterly' as const },
    'UNH': { annual: 7.52, quarterly: 1.88, yield: 1.3, frequency: 'quarterly' as const },
    'PFE': { annual: 1.64, quarterly: 0.41, yield: 6.2, frequency: 'quarterly' as const },
    'ABT': { annual: 2.16, quarterly: 0.54, yield: 1.8, frequency: 'quarterly' as const },
    'TMO': { annual: 1.20, quarterly: 0.30, yield: 0.2, frequency: 'quarterly' as const },
    'MRK': { annual: 2.80, quarterly: 0.70, yield: 2.7, frequency: 'quarterly' as const },
    'AZN': { annual: 1.90, quarterly: 0.475, yield: 2.8, frequency: 'quarterly' as const },
    'GSK': { annual: 2.04, quarterly: 0.51, yield: 4.1, frequency: 'quarterly' as const },
    'BMY': { annual: 2.04, quarterly: 0.51, yield: 4.8, frequency: 'quarterly' as const },
    'GILD': { annual: 3.04, quarterly: 0.76, yield: 4.2, frequency: 'quarterly' as const },
    'LLY': { annual: 4.40, quarterly: 1.10, yield: 1.2, frequency: 'quarterly' as const },
    'ABBV': { annual: 6.20, quarterly: 1.55, yield: 3.4, frequency: 'quarterly' as const },
    'AMGN': { annual: 8.08, quarterly: 2.02, yield: 3.1, frequency: 'quarterly' as const },
    'CVS': { annual: 2.20, quarterly: 0.55, yield: 3.2, frequency: 'quarterly' as const },
    'MDT': { annual: 2.72, quarterly: 0.68, yield: 3.8, frequency: 'quarterly' as const },
    'DHR': { annual: 1.00, quarterly: 0.25, yield: 0.4, frequency: 'quarterly' as const },
    'ISRG': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    'VRTX': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    'REGN': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    
    // Consumer Goods & Services
    'PG': { annual: 3.76, quarterly: 0.94, yield: 2.4, frequency: 'quarterly' as const },
    'KO': { annual: 1.84, quarterly: 0.46, yield: 3.0, frequency: 'quarterly' as const },
    'PEP': { annual: 4.42, quarterly: 1.105, yield: 2.8, frequency: 'quarterly' as const },
    'MCD': { annual: 6.08, quarterly: 1.52, yield: 2.2, frequency: 'quarterly' as const },
    'WMT': { annual: 2.28, quarterly: 0.57, yield: 3.0, frequency: 'quarterly' as const },
    'COST': { annual: 4.48, quarterly: 1.12, yield: 0.45, frequency: 'quarterly' as const },
    'TGT': { annual: 4.16, quarterly: 1.04, yield: 2.9, frequency: 'quarterly' as const },
    'UL': { annual: 1.96, quarterly: 0.49, yield: 3.4, frequency: 'quarterly' as const },
    'CL': { annual: 1.88, quarterly: 0.47, yield: 2.4, frequency: 'quarterly' as const },
    'KMB': { annual: 4.72, quarterly: 1.18, yield: 3.6, frequency: 'quarterly' as const },
    'GIS': { annual: 2.04, quarterly: 0.51, yield: 3.1, frequency: 'quarterly' as const },
    'K': { annual: 2.32, quarterly: 0.58, yield: 4.2, frequency: 'quarterly' as const },
    'CPB': { annual: 1.48, quarterly: 0.37, yield: 3.3, frequency: 'quarterly' as const },
    'KHC': { annual: 1.60, quarterly: 0.40, yield: 4.8, frequency: 'quarterly' as const },
    'MDLZ': { annual: 1.58, quarterly: 0.395, yield: 2.2, frequency: 'quarterly' as const },
    'HSY': { annual: 4.08, quarterly: 1.02, yield: 2.1, frequency: 'quarterly' as const },
    'KR': { annual: 1.04, quarterly: 0.26, yield: 2.2, frequency: 'quarterly' as const },
    'SYY': { annual: 2.00, quarterly: 0.50, yield: 2.5, frequency: 'quarterly' as const },
    'YUM': { annual: 2.20, quarterly: 0.55, yield: 1.6, frequency: 'quarterly' as const },
    
    // Financial Services
    'JPM': { annual: 4.80, quarterly: 1.20, yield: 2.4, frequency: 'quarterly' as const },
    'BAC': { annual: 0.96, quarterly: 0.24, yield: 2.8, frequency: 'quarterly' as const },
    'WFC': { annual: 1.20, quarterly: 0.30, yield: 2.9, frequency: 'quarterly' as const },
    'C': { annual: 2.04, quarterly: 0.51, yield: 3.2, frequency: 'quarterly' as const },
    'GS': { annual: 10.00, quarterly: 2.50, yield: 2.9, frequency: 'quarterly' as const },
    'MS': { annual: 3.70, quarterly: 0.925, yield: 4.2, frequency: 'quarterly' as const },
    'AXP': { annual: 2.40, quarterly: 0.60, yield: 1.3, frequency: 'quarterly' as const },
    'V': { annual: 1.80, quarterly: 0.45, yield: 0.7, frequency: 'quarterly' as const },
    'MA': { annual: 2.24, quarterly: 0.56, yield: 0.5, frequency: 'quarterly' as const },
    'BLK': { annual: 20.20, quarterly: 5.05, yield: 2.4, frequency: 'quarterly' as const },
    'SPG': { annual: 5.60, quarterly: 1.40, yield: 4.1, frequency: 'quarterly' as const },
    'USB': { annual: 1.76, quarterly: 0.44, yield: 4.1, frequency: 'quarterly' as const },
    'TFC': { annual: 2.08, quarterly: 0.52, yield: 5.2, frequency: 'quarterly' as const },
    'PNC': { annual: 5.60, quarterly: 1.40, yield: 3.8, frequency: 'quarterly' as const },
    'COF': { annual: 2.40, quarterly: 0.60, yield: 1.8, frequency: 'quarterly' as const },
    'SCHW': { annual: 0.88, quarterly: 0.22, yield: 1.3, frequency: 'quarterly' as const },
    'BK': { annual: 1.52, quarterly: 0.38, yield: 2.7, frequency: 'quarterly' as const },
    'STT': { annual: 2.28, quarterly: 0.57, yield: 3.2, frequency: 'quarterly' as const },
    
    // Utilities & Infrastructure
    'VZ': { annual: 2.56, quarterly: 0.64, yield: 6.8, frequency: 'quarterly' as const },
    'T': { annual: 1.11, quarterly: 0.2775, yield: 7.4, frequency: 'quarterly' as const },
    'SO': { annual: 2.80, quarterly: 0.70, yield: 3.8, frequency: 'quarterly' as const },
    'D': { annual: 4.32, quarterly: 1.08, yield: 4.1, frequency: 'quarterly' as const },
    'DUK': { annual: 4.02, quarterly: 1.005, yield: 4.0, frequency: 'quarterly' as const },
    'NEE': { annual: 1.85, quarterly: 0.4625, yield: 2.8, frequency: 'quarterly' as const },
    'AEP': { annual: 3.28, quarterly: 0.82, yield: 3.7, frequency: 'quarterly' as const },
    'EXC': { annual: 1.61, quarterly: 0.4025, yield: 4.1, frequency: 'quarterly' as const },
    'XEL': { annual: 1.88, quarterly: 0.47, yield: 2.8, frequency: 'quarterly' as const },
    'ED': { annual: 3.12, quarterly: 0.78, yield: 3.5, frequency: 'quarterly' as const },
    'ETR': { annual: 4.16, quarterly: 1.04, yield: 3.8, frequency: 'quarterly' as const },
    'ES': { annual: 1.68, quarterly: 0.42, yield: 2.1, frequency: 'quarterly' as const },
    'FE': { annual: 1.56, quarterly: 0.39, yield: 4.0, frequency: 'quarterly' as const },
    'PPL': { annual: 0.84, quarterly: 0.21, yield: 3.1, frequency: 'quarterly' as const },
    
    // Energy
    'XOM': { annual: 3.64, quarterly: 0.91, yield: 5.8, frequency: 'quarterly' as const },
    'CVX': { annual: 6.04, quarterly: 1.51, yield: 3.4, frequency: 'quarterly' as const },
    'COP': { annual: 2.04, quarterly: 0.51, yield: 1.8, frequency: 'quarterly' as const },
    'EOG': { annual: 3.00, quarterly: 0.75, yield: 2.4, frequency: 'quarterly' as const },
    'KMI': { annual: 1.13, quarterly: 0.2825, yield: 6.8, frequency: 'quarterly' as const },
    'ENB': { annual: 1.55, quarterly: 0.3875, yield: 6.2, frequency: 'quarterly' as const },
    'TC': { annual: 3.48, quarterly: 0.87, yield: 6.1, frequency: 'quarterly' as const },
    'SLB': { annual: 0.80, quarterly: 0.20, yield: 1.8, frequency: 'quarterly' as const },
    'TRP': { annual: 3.48, quarterly: 0.87, yield: 5.9, frequency: 'quarterly' as const },
    'WMB': { annual: 1.74, quarterly: 0.435, yield: 5.4, frequency: 'quarterly' as const },
    'OKE': { annual: 4.02, quarterly: 1.005, yield: 6.8, frequency: 'quarterly' as const },
    'EPD': { annual: 1.20, quarterly: 0.30, yield: 8.2, frequency: 'quarterly' as const },
    'ET': { annual: 1.22, quarterly: 0.305, yield: 8.9, frequency: 'quarterly' as const },
    'MMP': { annual: 2.94, quarterly: 0.735, yield: 6.1, frequency: 'quarterly' as const },
    
    // Industrial
    'MMM': { annual: 6.00, quarterly: 1.50, yield: 4.8, frequency: 'quarterly' as const },
    'CAT': { annual: 4.80, quarterly: 1.20, yield: 1.8, frequency: 'quarterly' as const },
    'HON': { annual: 4.04, quarterly: 1.01, yield: 1.9, frequency: 'quarterly' as const },
    'GE': { annual: 0.16, quarterly: 0.04, yield: 0.1, frequency: 'quarterly' as const },
    'LMT': { annual: 12.00, quarterly: 3.00, yield: 2.8, frequency: 'quarterly' as const },
    'RTX': { annual: 2.04, quarterly: 0.51, yield: 2.3, frequency: 'quarterly' as const },
    'UPS': { annual: 5.52, quarterly: 1.38, yield: 3.9, frequency: 'quarterly' as const },
    'FDX': { annual: 3.00, quarterly: 0.75, yield: 1.2, frequency: 'quarterly' as const },
    'EMR': { annual: 2.04, quarterly: 0.51, yield: 2.0, frequency: 'quarterly' as const },
    'ITW': { annual: 4.88, quarterly: 1.22, yield: 2.0, frequency: 'quarterly' as const },
    'DE': { annual: 4.90, quarterly: 1.225, yield: 1.2, frequency: 'quarterly' as const },
    'BA': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    'NOC': { annual: 7.40, quarterly: 1.85, yield: 1.5, frequency: 'quarterly' as const },
    'GD': { annual: 4.88, quarterly: 1.22, yield: 1.8, frequency: 'quarterly' as const },
    'LHX': { annual: 4.00, quarterly: 1.00, yield: 1.8, frequency: 'quarterly' as const },
    
    // Consumer Discretionary
    'HD': { annual: 8.36, quarterly: 2.09, yield: 2.3, frequency: 'quarterly' as const },
    'LOW': { annual: 4.20, quarterly: 1.05, yield: 1.7, frequency: 'quarterly' as const },
    'NKE': { annual: 1.48, quarterly: 0.37, yield: 1.8, frequency: 'quarterly' as const },
    'SBUX': { annual: 2.16, quarterly: 0.54, yield: 2.3, frequency: 'quarterly' as const },
    'DIS': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    'MO': { annual: 3.76, quarterly: 0.94, yield: 8.1, frequency: 'quarterly' as const },
    'PM': { annual: 5.20, quarterly: 1.30, yield: 5.1, frequency: 'quarterly' as const },
    'BTI': { annual: 2.96, quarterly: 0.74, yield: 8.4, frequency: 'quarterly' as const },
    'F': { annual: 0.60, quarterly: 0.15, yield: 5.1, frequency: 'quarterly' as const },
    'GM': { annual: 1.52, quarterly: 0.38, yield: 4.2, frequency: 'quarterly' as const },
    'TSLA': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    'TJX': { annual: 1.20, quarterly: 0.30, yield: 1.2, frequency: 'quarterly' as const },
    'RCL': { annual: 2.60, quarterly: 0.65, yield: 1.4, frequency: 'quarterly' as const },
    'CCL': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    
    // Materials
    'DD': { annual: 1.28, quarterly: 0.32, yield: 1.6, frequency: 'quarterly' as const },
    'DOW': { annual: 2.80, quarterly: 0.70, yield: 5.1, frequency: 'quarterly' as const },
    'LYB': { annual: 4.20, quarterly: 1.05, yield: 4.8, frequency: 'quarterly' as const },
    'FCX': { annual: 2.00, quarterly: 0.50, yield: 4.9, frequency: 'quarterly' as const },
    'NEM': { annual: 1.60, quarterly: 0.40, yield: 4.2, frequency: 'quarterly' as const },
    'NUE': { annual: 2.00, quarterly: 0.50, yield: 1.2, frequency: 'quarterly' as const },
    'STLD': { annual: 1.20, quarterly: 0.30, yield: 0.9, frequency: 'quarterly' as const },
    'PKG': { annual: 4.00, quarterly: 1.00, yield: 2.6, frequency: 'quarterly' as const },
    'IP': { annual: 2.20, quarterly: 0.55, yield: 6.8, frequency: 'quarterly' as const },
    'APD': { annual: 6.24, quarterly: 1.56, yield: 2.1, frequency: 'quarterly' as const },
    'LIN': { annual: 5.20, quarterly: 1.30, yield: 1.2, frequency: 'quarterly' as const },
    'ECL': { annual: 2.04, quarterly: 0.51, yield: 0.9, frequency: 'quarterly' as const },
    
    // Real Estate & REITs
    'ARCC': { annual: 2.64, quarterly: 0.66, yield: 12.0, frequency: 'quarterly' as const },
    'O': { annual: 3.06, quarterly: 0.765, yield: 5.1, frequency: 'monthly' as const },
    'MAIN': { annual: 2.64, quarterly: 0.66, yield: 5.4, frequency: 'quarterly' as const },
    'STAG': { annual: 1.68, quarterly: 0.42, yield: 4.2, frequency: 'quarterly' as const },
    'PLD': { annual: 2.64, quarterly: 0.66, yield: 2.1, frequency: 'quarterly' as const },
    'EXR': { annual: 7.00, quarterly: 1.75, yield: 3.1, frequency: 'quarterly' as const },
    'PSA': { annual: 8.00, quarterly: 2.00, yield: 2.8, frequency: 'quarterly' as const },
    'AMT': { annual: 6.16, quarterly: 1.54, yield: 3.1, frequency: 'quarterly' as const },
    'CCI': { annual: 5.68, quarterly: 1.42, yield: 4.8, frequency: 'quarterly' as const },
    'EQIX': { annual: 12.32, quarterly: 3.08, yield: 1.5, frequency: 'quarterly' as const },
    'DLR': { annual: 4.88, quarterly: 1.22, yield: 3.2, frequency: 'quarterly' as const },
    'VTR': { annual: 1.88, quarterly: 0.47, yield: 4.5, frequency: 'quarterly' as const },
    'WELL': { annual: 2.44, quarterly: 0.61, yield: 2.9, frequency: 'quarterly' as const },
    'AVB': { annual: 6.28, quarterly: 1.57, yield: 2.8, frequency: 'quarterly' as const },
    'EQR': { annual: 2.58, quarterly: 0.645, yield: 3.5, frequency: 'quarterly' as const },
    'MAA': { annual: 4.40, quarterly: 1.10, yield: 3.2, frequency: 'quarterly' as const },
    'ESS': { annual: 11.00, quarterly: 2.75, yield: 3.8, frequency: 'quarterly' as const },
    'UDR': { annual: 1.52, quarterly: 0.38, yield: 3.6, frequency: 'quarterly' as const },
    'CPT': { annual: 1.52, quarterly: 0.38, yield: 1.1, frequency: 'quarterly' as const },
    'HST': { annual: 0.84, quarterly: 0.21, yield: 4.9, frequency: 'quarterly' as const },
    'FRT': { annual: 3.36, quarterly: 0.84, yield: 2.8, frequency: 'quarterly' as const },
    'REG': { annual: 2.52, quarterly: 0.63, yield: 3.7, frequency: 'quarterly' as const },
    'BXP': { annual: 4.20, quarterly: 1.05, yield: 5.8, frequency: 'quarterly' as const },
    'KIM': { annual: 0.92, quarterly: 0.23, yield: 4.3, frequency: 'quarterly' as const },
    
    // European Dividend Stocks (common on Trading212)
    'ASML': { annual: 6.40, quarterly: 1.60, yield: 0.9, frequency: 'quarterly' as const },
    'NESN': { annual: 3.00, quarterly: 0.75, yield: 2.8, frequency: 'quarterly' as const },
    'NOVN': { annual: 3.10, quarterly: 0.775, yield: 3.5, frequency: 'quarterly' as const },
    'ROG': { annual: 9.60, quarterly: 2.40, yield: 2.8, frequency: 'quarterly' as const },
    'SAP': { annual: 2.20, quarterly: 0.55, yield: 1.6, frequency: 'quarterly' as const },
    'SHEL': { annual: 2.68, quarterly: 0.67, yield: 5.4, frequency: 'quarterly' as const },
    'BP': { annual: 0.28, quarterly: 0.07, yield: 5.8, frequency: 'quarterly' as const },
    'VOD': { annual: 0.09, quarterly: 0.0225, yield: 10.2, frequency: 'quarterly' as const },
    'RDS.A': { annual: 2.68, quarterly: 0.67, yield: 5.4, frequency: 'quarterly' as const },
    'RDSA': { annual: 2.68, quarterly: 0.67, yield: 5.4, frequency: 'quarterly' as const },
    'UNVR': { annual: 1.96, quarterly: 0.49, yield: 3.4, frequency: 'quarterly' as const },
    'TTE': { annual: 3.20, quarterly: 0.80, yield: 5.2, frequency: 'quarterly' as const },
    'ENGI': { annual: 0.85, quarterly: 0.2125, yield: 6.8, frequency: 'quarterly' as const },
    'OR': { annual: 3.20, quarterly: 0.80, yield: 4.1, frequency: 'quarterly' as const },
    'SAN': { annual: 0.40, quarterly: 0.10, yield: 8.9, frequency: 'quarterly' as const },
    'BBVA': { annual: 0.29, quarterly: 0.0725, yield: 4.2, frequency: 'quarterly' as const },
    'BNP': { annual: 3.68, quarterly: 0.92, yield: 5.8, frequency: 'quarterly' as const },
    'ING': { annual: 0.72, quarterly: 0.18, yield: 4.9, frequency: 'quarterly' as const },
    'DTE': { annual: 0.64, quarterly: 0.16, yield: 3.1, frequency: 'quarterly' as const },
    'ENI': { annual: 0.88, quarterly: 0.22, yield: 6.2, frequency: 'quarterly' as const },
    
    // Additional Growth Stocks (many don't pay dividends)
    'BRK.B': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    'GOOGL': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    'GOOG': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    'AMZN': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    'META': { annual: 2.00, quarterly: 0.50, yield: 0.4, frequency: 'quarterly' as const },
    'NVDA': { annual: 0.16, quarterly: 0.04, yield: 0.02, frequency: 'quarterly' as const },
    'NFLX': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    'CRM': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    'UBER': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    'LYFT': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    'ZOOM': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    'ZM': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    'SPOT': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    'SQ': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    'PYPL': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    'SHOP': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    'ROKU': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    'TWLO': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    'OKTA': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    'SNOW': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    'PLTR': { annual: 0, quarterly: 0, yield: 0, frequency: 'quarterly' as const },
    
    // ETFs (many pay dividends)
    'SPY': { annual: 6.57, quarterly: 1.6425, yield: 1.3, frequency: 'quarterly' as const },
    'VTI': { annual: 3.46, quarterly: 0.865, yield: 1.3, frequency: 'quarterly' as const },
    'VOO': { annual: 5.55, quarterly: 1.3875, yield: 1.3, frequency: 'quarterly' as const },
    'QQQ': { annual: 2.23, quarterly: 0.5575, yield: 0.5, frequency: 'quarterly' as const },
    'IWM': { annual: 3.31, quarterly: 0.8275, yield: 1.4, frequency: 'quarterly' as const },
    'EFA': { annual: 2.38, quarterly: 0.595, yield: 3.2, frequency: 'quarterly' as const },
    'VEA': { annual: 1.36, quarterly: 0.34, yield: 2.7, frequency: 'quarterly' as const },
    'IEMG': { annual: 1.23, quarterly: 0.3075, yield: 2.4, frequency: 'quarterly' as const },
    'VWO': { annual: 1.90, quarterly: 0.475, yield: 4.1, frequency: 'quarterly' as const },
    'SCHD': { annual: 2.91, quarterly: 0.7275, yield: 3.6, frequency: 'quarterly' as const },
    'VYM': { annual: 3.27, quarterly: 0.8175, yield: 2.8, frequency: 'quarterly' as const },
    'NOBL': { annual: 2.18, quarterly: 0.545, yield: 1.9, frequency: 'quarterly' as const },
    'VIG': { annual: 2.74, quarterly: 0.685, yield: 1.7, frequency: 'quarterly' as const },
    'DGRO': { annual: 1.42, quarterly: 0.355, yield: 1.9, frequency: 'quarterly' as const },
    'HDV': { annual: 3.65, quarterly: 0.9125, yield: 3.4, frequency: 'quarterly' as const },
    'DVY': { annual: 3.89, quarterly: 0.9725, yield: 3.4, frequency: 'quarterly' as const },
    'SPHD': { annual: 1.87, quarterly: 0.4675, yield: 4.1, frequency: 'quarterly' as const },
    'SCHY': { annual: 1.42, quarterly: 0.355, yield: 2.8, frequency: 'quarterly' as const },
    'SPYD': { annual: 1.84, quarterly: 0.46, yield: 4.9, frequency: 'quarterly' as const },
    'DIVO': { annual: 0.45, quarterly: 0.1125, yield: 3.8, frequency: 'quarterly' as const },
    'JEPI': { annual: 2.87, quarterly: 0.7175, yield: 5.2, frequency: 'quarterly' as const },
    'JEPQ': { annual: 2.15, quarterly: 0.5375, yield: 4.1, frequency: 'quarterly' as const },
    'SPLG': { annual: 1.82, quarterly: 0.455, yield: 1.3, frequency: 'quarterly' as const },
    'VT': { annual: 2.08, quarterly: 0.52, yield: 1.9, frequency: 'quarterly' as const },
    'VXUS': { annual: 1.85, quarterly: 0.4625, yield: 3.1, frequency: 'quarterly' as const }
  }
};

export const calculateDividendIncome = (positions: Position[]): {
  totalAnnualIncome: number;
  totalQuarterlyIncome: number;
  dividendPayingStocks: any[];
  portfolioYield: number;
} => {
  console.log('Calculating dividend income for positions:', positions.length);
  
  const dividendPayingStocks = [];
  let totalAnnualIncome = 0;
  let totalQuarterlyIncome = 0;
  let totalPortfolioValue = 0;
  let dividendPayingStocksCount = 0;

  for (const position of positions) {
    // Clean symbol to remove Trading212 suffixes and handle various formats
    const cleanSymbol = position.symbol.replace(/_US_EQ$|_EQ$|\.L$|\.TO$/, '').toUpperCase();
    const dividendInfo = DIVIDEND_DATA_SOURCES.DIVIDEND_CHAMPIONS[cleanSymbol];
    
    // Calculate portfolio value for all positions
    const positionValue = position.marketValue || (position.quantity * position.currentPrice);
    totalPortfolioValue += positionValue;
    
    if (dividendInfo && position.quantity > 0) {
      const annualDividendForPosition = dividendInfo.annual * position.quantity;
      const quarterlyDividendForPosition = dividendInfo.quarterly * position.quantity;
      
      // Only count if there are actual dividends
      if (dividendInfo.annual > 0) {
        totalAnnualIncome += annualDividendForPosition;
        totalQuarterlyIncome += quarterlyDividendForPosition;
        dividendPayingStocksCount++;
      }
      
      dividendPayingStocks.push({
        symbol: cleanSymbol,
        company: getCompanyName(cleanSymbol),
        shares: position.quantity,
        annualDividend: dividendInfo.annual,
        quarterlyDividend: dividendInfo.quarterly,
        totalAnnualIncome: annualDividendForPosition,
        totalQuarterlyIncome: quarterlyDividendForPosition,
        yield: dividendInfo.yield,
        frequency: dividendInfo.frequency,
        nextPayment: quarterlyDividendForPosition,
        exDate: getNextExDate(),
        paymentDate: getNextPaymentDate(),
        currentValue: positionValue,
        hasDiv: dividendInfo.annual > 0
      });
      
      console.log(`${cleanSymbol}: ${position.quantity} shares × $${dividendInfo.annual} = $${annualDividendForPosition.toFixed(2)} annual`);
    }
  }

  const portfolioYield = totalPortfolioValue > 0 ? (totalAnnualIncome / totalPortfolioValue) * 100 : 0;

  console.log('Dividend calculation results:', {
    totalAnnualIncome: totalAnnualIncome.toFixed(2),
    totalQuarterlyIncome: totalQuarterlyIncome.toFixed(2),
    dividendPayingStocks: dividendPayingStocksCount,
    totalStocksAnalyzed: dividendPayingStocks.length,
    portfolioValue: totalPortfolioValue.toFixed(2),
    portfolioYield: portfolioYield.toFixed(2) + '%'
  });

  return {
    totalAnnualIncome,
    totalQuarterlyIncome,
    dividendPayingStocks: dividendPayingStocks.filter(stock => stock.hasDiv), // Only return actual dividend payers
    portfolioYield
  };
};

const getCompanyName = (symbol: string): string => {
  const companyNames: Record<string, string> = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'JNJ': 'Johnson & Johnson',
    'PG': 'Procter & Gamble',
    'KO': 'Coca-Cola Company',
    'PEP': 'PepsiCo Inc.',
    'WMT': 'Walmart Inc.',
    'MCD': "McDonald's Corporation",
    'VZ': 'Verizon Communications',
    'T': 'AT&T Inc.',
    'XOM': 'Exxon Mobil Corporation',
    'CVX': 'Chevron Corporation',
    'IBM': 'International Business Machines',
    'INTC': 'Intel Corporation',
    'COST': 'Costco Wholesale',
    'JPM': 'JPMorgan Chase & Co.',
    'BAC': 'Bank of America',
    'HD': 'Home Depot Inc.',
    'ARCC': 'Ares Capital Corporation',
    'O': 'Realty Income Corporation',
    'META': 'Meta Platforms Inc.',
    'NVDA': 'NVIDIA Corporation',
    'UNH': 'UnitedHealth Group',
    'PFE': 'Pfizer Inc.',
    'ABT': 'Abbott Laboratories',
    'TMO': 'Thermo Fisher Scientific',
    'MRK': 'Merck & Co.',
    'LOW': 'Lowe\'s Companies',
    'TGT': 'Target Corporation',
    'UL': 'Unilever PLC',
    'CL': 'Colgate-Palmolive',
    'KMB': 'Kimberly-Clark',
    'GIS': 'General Mills',
    'K': 'Kellogg Company',
    'CPB': 'Campbell Soup Company',
    'WFC': 'Wells Fargo & Co.',
    'C': 'Citigroup Inc.',
    'GS': 'Goldman Sachs Group',
    'MS': 'Morgan Stanley',
    'AXP': 'American Express',
    'V': 'Visa Inc.',
    'MA': 'Mastercard Inc.',
    'BLK': 'BlackRock Inc.',
    'SPG': 'Simon Property Group',
    'SO': 'Southern Company',
    'D': 'Dominion Energy',
    'DUK': 'Duke Energy',
    'NEE': 'NextEra Energy',
    'AEP': 'American Electric Power',
    'EXC': 'Exelon Corporation',
    'COP': 'ConocoPhillips',
    'EOG': 'EOG Resources',
    'KMI': 'Kinder Morgan',
    'ENB': 'Enbridge Inc.',
    'TC': 'TC Energy',
    'SLB': 'Schlumberger',
    'CAT': 'Caterpillar Inc.',
    'HON': 'Honeywell International',
    'GE': 'General Electric',
    'LMT': 'Lockheed Martin',
    'RTX': 'Raytheon Technologies',
    'UPS': 'United Parcel Service',
    'FDX': 'FedEx Corporation',
    'EMR': 'Emerson Electric',
    'NKE': 'Nike Inc.',
    'SBUX': 'Starbucks Corporation',
    'MO': 'Altria Group',
    'PM': 'Philip Morris International',
    'BTI': 'British American Tobacco',
    'DD': 'DuPont de Nemours',
    'DOW': 'Dow Inc.',
    'LYB': 'LyondellBasell Industries',
    'FCX': 'Freeport-McMoRan',
    'NEM': 'Newmont Corporation',
    'MAIN': 'Main Street Capital',
    'STAG': 'STAG Industrial',
    'PLD': 'Prologis Inc.',
    'EXR': 'Extended Stay America',
    'PSA': 'Public Storage',
    'AMT': 'American Tower',
    'CCI': 'Crown Castle',
    'ASML': 'ASML Holding',
    'NESN': 'Nestlé S.A.',
    'NOVN': 'Novartis AG',
    'ROG': 'Roche Holding AG',
    'SAP': 'SAP SE',
    'SHEL': 'Shell plc',
    'BP': 'BP p.l.c.',
    'VOD': 'Vodafone Group',
    'SPY': 'SPDR S&P 500 ETF',
    'VTI': 'Vanguard Total Stock Market ETF',
    'VOO': 'Vanguard S&P 500 ETF',
    'QQQ': 'Invesco QQQ Trust',
    'IWM': 'iShares Russell 2000 ETF',
    'EFA': 'iShares MSCI EAFE ETF',
    'VEA': 'Vanguard FTSE Developed Markets ETF',
    'IEMG': 'iShares Core MSCI Emerging Markets ETF',
    'VWO': 'Vanguard FTSE Emerging Markets ETF',
    'SCHD': 'Schwab US Dividend Equity ETF',
    'VYM': 'Vanguard High Dividend Yield ETF',
    'NOBL': 'ProShares S&P 500 Dividend Aristocrats ETF',
    'VIG': 'Vanguard Dividend Appreciation ETF',
    'DGRO': 'iShares Core Dividend Growth ETF',
    'HDV': 'iShares High Dividend ETF',
    'DVY': 'iShares Select Dividend ETF'
  };
  
  return companyNames[symbol] || symbol;
};

const getNextExDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 30); // Approximate next ex-dividend date
  return date.toISOString().split('T')[0];
};

const getNextPaymentDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 45); // Approximate next payment date
  return date.toISOString().split('T')[0];
};

// Function to expand dividend database with more stocks
export const addDividendData = (symbol: string, dividendInfo: any) => {
  DIVIDEND_DATA_SOURCES.DIVIDEND_CHAMPIONS[symbol] = dividendInfo;
};

// Get all supported dividend-paying stocks
export const getSupportedDividendStocks = (): string[] => {
  return Object.keys(DIVIDEND_DATA_SOURCES.DIVIDEND_CHAMPIONS);
};

// Get stocks that actually pay dividends (exclude zero dividend stocks)
export const getActualDividendPayingStocks = (): string[] => {
  return Object.entries(DIVIDEND_DATA_SOURCES.DIVIDEND_CHAMPIONS)
    .filter(([_, info]) => info.annual > 0)
    .map(([symbol, _]) => symbol);
};
