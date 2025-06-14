
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Trading212Account {
  cash: {
    free: number;
    total: number;
    invested: number;
    result: number;
  };
}

interface Trading212Position {
  ticker: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  ppl: number;
  fxPpl: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the authenticated user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { portfolioId } = await req.json()

    if (!portfolioId) {
      return new Response(
        JSON.stringify({ error: 'Portfolio ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Trading212 API key from Supabase secrets or user's stored key
    const trading212ApiKey = Deno.env.get('TRADING212_API_KEY') || '23133911ZTqHOBsBwckReMYwQgTWukpsBiHZs';

    console.log('Fetching Trading212 data for user:', user.id);

    // Fetch account info
    const accountResponse = await fetch('https://live.trading212.com/api/v0/equity/account/cash', {
      headers: {
        'Authorization': trading212ApiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!accountResponse.ok) {
      console.error('Trading212 account API error:', accountResponse.status, await accountResponse.text());
      throw new Error(`Trading212 API error: ${accountResponse.status}`);
    }

    const accountData: Trading212Account = await accountResponse.json();

    // Fetch positions
    const positionsResponse = await fetch('https://live.trading212.com/api/v0/equity/portfolio', {
      headers: {
        'Authorization': trading212ApiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!positionsResponse.ok) {
      console.error('Trading212 positions API error:', positionsResponse.status, await positionsResponse.text());
      throw new Error(`Trading212 positions API error: ${positionsResponse.status}`);
    }

    const positions: Trading212Position[] = await positionsResponse.json();

    // Calculate portfolio metrics
    const totalInvested = accountData.cash.invested;
    const totalValue = totalInvested + accountData.cash.free;
    const totalReturn = accountData.cash.result;
    const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    // Calculate today's change (using ppl from positions as approximation)
    const todaysChange = positions.reduce((sum, pos) => sum + (pos.ppl || 0), 0);
    const todaysChangePercentage = totalInvested > 0 ? (todaysChange / totalInvested) * 100 : 0;

    const portfolioData = {
      totalValue: totalValue,
      todayChange: todaysChange,
      todayPercentage: todaysChangePercentage,
      totalReturn: totalReturn,
      totalReturnPercentage: totalReturnPercentage,
      holdingsCount: positions.length,
      netDeposits: totalInvested,
      cashBalance: accountData.cash.free,
      positions: positions.map(pos => ({
        symbol: pos.ticker,
        quantity: pos.quantity,
        averagePrice: pos.averagePrice,
        currentPrice: pos.currentPrice,
        marketValue: pos.marketValue,
        unrealizedPnL: pos.ppl,
      }))
    };

    console.log('Trading212 portfolio data processed:', portfolioData);

    return new Response(
      JSON.stringify({ success: true, data: portfolioData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in trading212-sync function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
