
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CryptoHolding {
  symbol: string;
  name: string;
  amount: number;
  currentPrice: number;
  value: number;
  change24h: number;
  changePercent24h: number;
}

interface CryptoPortfolioData {
  totalValue: number;
  todayChange: number;
  todayPercentage: number;
  totalReturn: number;
  totalReturnPercentage: number;
  holdingsCount: number;
  netDeposits: number;
  holdings: CryptoHolding[];
}

// Mock crypto holdings - in a real app, this would come from user's portfolio data
const mockCryptoHoldings = [
  { symbol: 'BTC', amount: 0.5, costBasis: 45000 },
  { symbol: 'ETH', amount: 2.5, costBasis: 3200 },
  { symbol: 'ADA', amount: 1000, costBasis: 1.2 },
  { symbol: 'DOT', amount: 100, costBasis: 25 },
  { symbol: 'SOL', amount: 15, costBasis: 180 }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { portfolioId } = await req.json();
    
    console.log('Fetching crypto data for portfolio:', portfolioId);

    // Get current prices from CoinGecko API (free tier)
    const symbols = mockCryptoHoldings.map(h => h.symbol.toLowerCase()).join(',');
    const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano,polkadot,solana&vs_currencies=usd&include_24hr_change=true`;
    
    console.log('Fetching from CoinGecko:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const priceData = await response.json();
    console.log('CoinGecko response:', priceData);

    // Map symbols to CoinGecko IDs
    const symbolToId: { [key: string]: string } = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum', 
      'ADA': 'cardano',
      'DOT': 'polkadot',
      'SOL': 'solana'
    };

    // Calculate portfolio data
    const holdings: CryptoHolding[] = mockCryptoHoldings.map(holding => {
      const coinId = symbolToId[holding.symbol];
      const coinData = priceData[coinId];
      
      if (!coinData) {
        console.warn(`No price data for ${holding.symbol}`);
        return {
          symbol: holding.symbol,
          name: holding.symbol,
          amount: holding.amount,
          currentPrice: holding.costBasis,
          value: holding.amount * holding.costBasis,
          change24h: 0,
          changePercent24h: 0
        };
      }

      const currentPrice = coinData.usd;
      const change24h = coinData.usd_24h_change || 0;
      const value = holding.amount * currentPrice;
      
      return {
        symbol: holding.symbol,
        name: holding.symbol,
        amount: holding.amount,
        currentPrice,
        value,
        change24h: (value * change24h) / 100,
        changePercent24h: change24h
      };
    });

    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
    const totalCost = mockCryptoHoldings.reduce((sum, h) => sum + (h.amount * h.costBasis), 0);
    const totalReturn = totalValue - totalCost;
    const totalReturnPercentage = ((totalReturn / totalCost) * 100);
    
    const todayChange = holdings.reduce((sum, h) => sum + h.change24h, 0);
    const todayPercentage = (todayChange / (totalValue - todayChange)) * 100;

    const portfolioData: CryptoPortfolioData = {
      totalValue,
      todayChange,
      todayPercentage,
      totalReturn,
      totalReturnPercentage,
      holdingsCount: holdings.length,
      netDeposits: totalCost,
      holdings
    };

    console.log('Calculated portfolio data:', portfolioData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: portfolioData 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in crypto-api function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
