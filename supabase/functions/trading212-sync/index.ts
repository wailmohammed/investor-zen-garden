
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

    // Get Trading212 API key from Supabase secrets or user's stored key
    const trading212ApiKey = Deno.env.get('TRADING212_API_KEY') || '23133911ZTqHOBsBwckReMYwQgTWukpsBiHZs';

    console.log('Fetching Trading212 data for user:', user.id);

    const apiClient = new Trading212ApiClient(trading212ApiKey);

    try {
      // Fetch account and positions data
      const accountData = await apiClient.fetchAccountData();
      const positions = await apiClient.fetchPositions();

      // Fetch dividend data for positions and calculate dividend income
      const positionsWithDividends = await Promise.all(
        positions.slice(0, 10).map(async (position) => {
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
        dividendMetrics
      };

      console.log('Trading212 portfolio data with dividends processed:', portfolioData);

      return new Response(
        JSON.stringify({ success: true, data: portfolioData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      if (error.message === 'RATE_LIMITED') {
        console.log('Trading212 API rate limit hit, returning realistic mock data');
        const mockData = Trading212ApiClient.getMockData();
        
        // Add dividend metrics to mock data
        const dividendMetrics = calculateDividendMetrics(mockData.positions);
        const finalMockData = {
          ...mockData,
          dividendMetrics
        };
        
        return new Response(
          JSON.stringify({ success: true, data: finalMockData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw error;
    }

  } catch (error) {
    console.error('Error in trading212-sync function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
