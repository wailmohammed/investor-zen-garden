
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BinanceBalance {
  asset: string;
  free: string;
  locked: string;
}

interface BinancePrice {
  symbol: string;
  price: string;
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

interface BinancePortfolioData {
  totalValue: number;
  todayChange: number;
  todayPercentage: number;
  totalReturn: number;
  totalReturnPercentage: number;
  holdingsCount: number;
  netDeposits: number;
  holdings: CryptoHolding[];
}

async function createSignature(queryString: string, secretKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(queryString));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { portfolioId } = await req.json();
    
    console.log('Fetching Binance data for portfolio:', portfolioId);

    const apiKey = Deno.env.get('BINANCE_API_KEY');
    const secretKey = Deno.env.get('BINANCE_SECRET_KEY');
    
    if (!apiKey || !secretKey) {
      throw new Error('Binance API credentials not configured');
    }

    const baseUrl = 'https://api.binance.com';
    const timestamp = Date.now();
    
    // Get account balances
    const balanceQuery = `timestamp=${timestamp}`;
    const balanceSignature = await createSignature(balanceQuery, secretKey);
    
    const balanceResponse = await fetch(`${baseUrl}/api/v3/account?${balanceQuery}&signature=${balanceSignature}`, {
      headers: {
        'X-MBX-APIKEY': apiKey
      }
    });
    
    if (!balanceResponse.ok) {
      const errorText = await balanceResponse.text();
      console.error('Binance API error:', errorText);
      throw new Error(`Binance API error: ${balanceResponse.status} - ${errorText}`);
    }
    
    const accountData = await balanceResponse.json();
    console.log('Binance account data received');
    
    // Filter out zero balances and small amounts
    const balances: BinanceBalance[] = accountData.balances.filter((balance: BinanceBalance) => {
      const total = parseFloat(balance.free) + parseFloat(balance.locked);
      return total > 0.001; // Filter out dust
    });
    
    if (balances.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            totalValue: 0,
            todayChange: 0,
            todayPercentage: 0,
            totalReturn: 0,
            totalReturnPercentage: 0,
            holdingsCount: 0,
            netDeposits: 0,
            holdings: []
          }
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Get current prices for all assets
    const priceResponse = await fetch(`${baseUrl}/api/v3/ticker/price`);
    const allPrices: BinancePrice[] = await priceResponse.json();
    
    // Get 24hr price change statistics
    const statsResponse = await fetch(`${baseUrl}/api/v3/ticker/24hr`);
    const priceStats = await statsResponse.json();
    
    console.log(`Processing ${balances.length} assets with balances`);
    
    // Calculate portfolio data
    const holdings: CryptoHolding[] = [];
    let totalValueUSD = 0;
    let totalChange24h = 0;
    
    for (const balance of balances) {
      const asset = balance.asset;
      const amount = parseFloat(balance.free) + parseFloat(balance.locked);
      
      // Find USD price (try USDT pair first, then BUSD, then USD)
      let priceUSD = 0;
      let change24hPercent = 0;
      
      if (asset === 'USDT' || asset === 'BUSD' || asset === 'USD') {
        priceUSD = 1;
        change24hPercent = 0;
      } else {
        // Try different trading pairs to get USD price
        const possiblePairs = [`${asset}USDT`, `${asset}BUSD`, `${asset}USD`];
        
        for (const pair of possiblePairs) {
          const priceData = allPrices.find(p => p.symbol === pair);
          const statsData = priceStats.find((s: any) => s.symbol === pair);
          
          if (priceData && statsData) {
            priceUSD = parseFloat(priceData.price);
            change24hPercent = parseFloat(statsData.priceChangePercent);
            break;
          }
        }
        
        // If no direct USD pair found, skip this asset
        if (priceUSD === 0) {
          console.log(`No USD price found for ${asset}, skipping`);
          continue;
        }
      }
      
      const value = amount * priceUSD;
      const change24h = value * (change24hPercent / 100);
      
      holdings.push({
        symbol: asset,
        name: asset,
        amount,
        currentPrice: priceUSD,
        value,
        change24h,
        changePercent24h: change24hPercent
      });
      
      totalValueUSD += value;
      totalChange24h += change24h;
    }
    
    // Sort holdings by value (descending)
    holdings.sort((a, b) => b.value - a.value);
    
    const todayPercentage = totalValueUSD > 0 ? (totalChange24h / (totalValueUSD - totalChange24h)) * 100 : 0;
    
    // For now, we'll estimate net deposits as 70% of current value (this would ideally come from transaction history)
    const estimatedNetDeposits = totalValueUSD * 0.7;
    const totalReturn = totalValueUSD - estimatedNetDeposits;
    const totalReturnPercentage = estimatedNetDeposits > 0 ? (totalReturn / estimatedNetDeposits) * 100 : 0;

    const portfolioData: BinancePortfolioData = {
      totalValue: totalValueUSD,
      todayChange: totalChange24h,
      todayPercentage,
      totalReturn,
      totalReturnPercentage,
      holdingsCount: holdings.length,
      netDeposits: estimatedNetDeposits,
      holdings
    };

    console.log('Binance portfolio data calculated:', {
      totalValue: portfolioData.totalValue,
      holdingsCount: portfolioData.holdingsCount,
      topHoldings: holdings.slice(0, 3).map(h => ({ symbol: h.symbol, value: h.value }))
    });

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
    console.error('Error in binance-api function:', error);
    
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
