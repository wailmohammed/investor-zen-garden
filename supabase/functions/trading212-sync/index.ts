
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Trading212ApiClient } from './api-client.ts'
import { fetchDividendData, calculateDividendIncome, calculatePortfolioMetrics, calculateDividendMetrics } from './dividend-utils.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Get Trading212 API key from Supabase secrets
    const trading212ApiKey = Deno.env.get('TRADING212_API_KEY');
    
    if (!trading212ApiKey) {
      return new Response(
        JSON.stringify({ error: 'Trading212 API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Fetching Trading212 data for user:', user.id);

    const apiClient = new Trading212ApiClient(trading212ApiKey);

    try {
      // Fetch account and positions data
      const accountData = await apiClient.fetchAccountData();
      const positions = await apiClient.fetchPositions();

      if (!accountData || !positions || positions.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'No data available from Trading212 API',
            message: 'Unable to fetch account data or positions. Please check your Trading212 connection.'
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Processing ${positions.length} positions for dividend analysis`);

      // Fetch dividend data for ALL positions and calculate dividend income
      const positionsWithDividends = await Promise.all(
        positions.map(async (position) => {
          const dividendData = await fetchDividendData(position.ticker);
          const dividendInfo = calculateDividendIncome(position, dividendData);
          
          return {
            symbol: position.ticker.replace(/_US_EQ$|_EQ$/, ''),
            quantity: position.quantity,
            averagePrice: position.averagePrice,
            currentPrice: position.currentPrice,
            marketValue: position.marketValue || (position.quantity * position.currentPrice),
            unrealizedPnL: position.ppl,
            dividendInfo
          };
        })
      );

      // Calculate portfolio metrics
      const portfolioMetrics = calculatePortfolioMetrics(accountData, positions);
      const dividendMetrics = calculateDividendMetrics(positionsWithDividends);

      const portfolioData = {
        ...portfolioMetrics,
        positions: positionsWithDividends,
        dividendMetrics,
        totalPositionsProcessed: positions.length
      };

      console.log(`Trading212 portfolio data with dividends processed: ${positions.length} positions analyzed`);

      return new Response(
        JSON.stringify({ success: true, data: portfolioData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      if (error.message === 'RATE_LIMITED') {
        console.log('Trading212 API rate limit hit - no data available');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'RATE_LIMITED',
            message: 'Trading212 API rate limit reached. Please try again later.'
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw error;
    }

  } catch (error) {
    console.error('Error in trading212-sync function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Failed to connect to Trading212. Please check your API configuration.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
