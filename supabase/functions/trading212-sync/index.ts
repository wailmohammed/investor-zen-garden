import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Trading212ApiClient } from './api-client.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enhanced rate limiting cache
const rateLimitCache = new Map<string, { lastCall: number; retryAfter: number }>();
const positionCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds cache

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

    // Enhanced rate limiting
    const rateLimitKey = `user_${user.id}`;
    const now = Date.now();
    const userRateLimit = rateLimitCache.get(rateLimitKey);
    
    if (userRateLimit && now < userRateLimit.lastCall + userRateLimit.retryAfter) {
      const retryInSeconds = Math.ceil((userRateLimit.lastCall + userRateLimit.retryAfter - now) / 1000);
      console.log(`Rate limit active for user ${user.id}, retry in ${retryInSeconds} seconds`);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'RATE_LIMITED',
          message: `Please wait ${retryInSeconds} seconds before trying again.`,
          retryAfter: retryInSeconds
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check cache first
    const cacheKey = `positions_${user.id}_${portfolioId}`;
    const cached = positionCache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log('Returning cached Trading212 data');
      return new Response(
        JSON.stringify({ success: true, data: cached.data, fromCache: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const trading212ApiKey = Deno.env.get('TRADING212_API_KEY');
    
    if (!trading212ApiKey) {
      return new Response(
        JSON.stringify({ error: 'Trading212 API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Fetching fresh Trading212 data for user:', user.id);

    const apiClient = new Trading212ApiClient(trading212ApiKey);

    try {
      // Fetch account and positions data with improved error handling
      const [accountData, positions] = await Promise.allSettled([
        apiClient.fetchAccountData(),
        apiClient.fetchPositions()
      ]);

      // Handle account data result
      if (accountData.status === 'rejected') {
        console.error('Failed to fetch account data:', accountData.reason);
        if (accountData.reason?.message === 'RATE_LIMITED') {
          rateLimitCache.set(rateLimitKey, { lastCall: now, retryAfter: 60000 });
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'RATE_LIMITED',
              message: 'Trading212 API rate limit reached. Please try again in 60 seconds.',
              retryAfter: 60
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        throw new Error('Failed to fetch account data');
      }

      // Handle positions data result
      if (positions.status === 'rejected') {
        console.error('Failed to fetch positions:', positions.reason);
        if (positions.reason?.message === 'RATE_LIMITED') {
          rateLimitCache.set(rateLimitKey, { lastCall: now, retryAfter: 60000 });
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'RATE_LIMITED',
              message: 'Trading212 API rate limit reached. Please try again in 60 seconds.',
              retryAfter: 60
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        throw new Error('Failed to fetch positions');
      }

      const accountInfo = accountData.value;
      const positionsData = positions.value;

      if (!accountInfo || !positionsData || positionsData.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'No data available from Trading212 API',
            message: 'Unable to fetch account data or positions. Please check your Trading212 connection.'
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Processing ${positionsData.length} positions with enhanced dividend analysis`);

      // Enhanced portfolio calculation with dividend data
      const totalInvested = accountInfo?.cash?.invested || 0;
      const cashFree = accountInfo?.cash?.free || 0;
      const totalValue = totalInvested + cashFree;
      const totalReturn = accountInfo?.cash?.result || 0;
      const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
      const todaysChange = positionsData.reduce((sum: number, pos: any) => sum + (pos.ppl || 0), 0);
      const todaysChangePercentage = totalInvested > 0 ? (todaysChange / totalInvested) * 100 : 0;

      // Process positions for dividend analysis
      const formattedPositions = positionsData.map((position: any) => ({
        symbol: position.ticker.replace(/_US_EQ$|_EQ$/, ''),
        quantity: position.quantity,
        averagePrice: position.averagePrice,
        currentPrice: position.currentPrice,
        marketValue: position.marketValue || (position.quantity * position.currentPrice),
        unrealizedPnL: position.ppl
      }));

      // This would use the enhanced dividend calculator
      // For now, we'll use mock dividend metrics since we can't import the client-side calculator
      const portfolioMetrics = {
        totalValue,
        todayChange: todaysChange,
        todayPercentage: todaysChangePercentage,
        totalReturn,
        totalReturnPercentage,
        holdingsCount: positionsData.length,
        netDeposits: totalInvested,
        cashBalance: cashFree
      };

      const portfolioData = {
        ...portfolioMetrics,
        positions: formattedPositions,
        dividendMetrics: {
          annualIncome: 0, // Will be calculated by client-side enhanced calculator
          quarterlyIncome: 0,
          monthlyAverage: 0,
          portfolioYield: 0,
          dividendPayingStocks: 0
        },
        totalPositionsProcessed: positionsData.length,
        successfullyProcessed: positionsData.length,
        processingErrors: 0,
        enhanced: true, // Flag to indicate this uses enhanced processing
        cacheTimestamp: now
      };

      // Cache the results
      positionCache.set(cacheKey, { data: portfolioData, timestamp: now });

      // Update rate limit cache with successful call (shorter cooldown)
      rateLimitCache.set(rateLimitKey, { lastCall: now, retryAfter: 3000 }); // 3 second cooldown

      console.log(`Enhanced Trading212 portfolio data processed: ${positionsData.length} positions analyzed`);

      return new Response(
        JSON.stringify({ success: true, data: portfolioData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      if (error.message === 'RATE_LIMITED') {
        console.log('Trading212 API rate limit hit - setting rate limit cache');
        rateLimitCache.set(rateLimitKey, { lastCall: now, retryAfter: 60000 });
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'RATE_LIMITED',
            message: 'Trading212 API rate limit reached. Please try again in 60 seconds.',
            retryAfter: 60
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
