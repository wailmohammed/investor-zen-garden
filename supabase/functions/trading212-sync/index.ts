
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Trading212ApiClient } from './api-client.ts'
import { fetchDividendData, calculateDividendIncome, calculatePortfolioMetrics, calculateDividendMetrics } from './dividend-utils.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting cache to prevent excessive API calls
const rateLimitCache = new Map<string, { lastCall: number; retryAfter: number }>();

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

    // Check rate limiting for this user
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
      // Fetch account and positions data with improved error handling
      const [accountData, positions] = await Promise.allSettled([
        apiClient.fetchAccountData(),
        apiClient.fetchPositions()
      ]);

      // Handle account data result
      if (accountData.status === 'rejected') {
        console.error('Failed to fetch account data:', accountData.reason);
        if (accountData.reason?.message === 'RATE_LIMITED') {
          // Set rate limit cache for 60 seconds
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
          // Set rate limit cache for 60 seconds
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

      console.log(`Processing ${positionsData.length} positions for dividend analysis`);

      // Process positions in batches to avoid overwhelming the system
      const batchSize = 50;
      const positionsWithDividends = [];
      
      for (let i = 0; i < positionsData.length; i += batchSize) {
        const batch = positionsData.slice(i, i + batchSize);
        
        const batchResults = await Promise.allSettled(
          batch.map(async (position) => {
            try {
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
            } catch (error) {
              console.error(`Error processing position ${position.ticker}:`, error);
              // Return position without dividend info if processing fails
              return {
                symbol: position.ticker.replace(/_US_EQ$|_EQ$/, ''),
                quantity: position.quantity,
                averagePrice: position.averagePrice,
                currentPrice: position.currentPrice,
                marketValue: position.marketValue || (position.quantity * position.currentPrice),
                unrealizedPnL: position.ppl,
                dividendInfo: {
                  annualDividend: 0,
                  quarterlyDividend: 0,
                  nextPayment: 0,
                  yield: 0
                }
              };
            }
          })
        );

        // Add successful results to the main array
        batchResults.forEach(result => {
          if (result.status === 'fulfilled') {
            positionsWithDividends.push(result.value);
          }
        });

        // Add small delay between batches to be respectful to external APIs
        if (i + batchSize < positionsData.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Calculate portfolio metrics
      const portfolioMetrics = calculatePortfolioMetrics(accountInfo, positionsData);
      const dividendMetrics = calculateDividendMetrics(positionsWithDividends);

      const portfolioData = {
        ...portfolioMetrics,
        positions: positionsWithDividends,
        dividendMetrics,
        totalPositionsProcessed: positionsData.length,
        successfullyProcessed: positionsWithDividends.length,
        processingErrors: positionsData.length - positionsWithDividends.length
      };

      // Update rate limit cache with successful call
      rateLimitCache.set(rateLimitKey, { lastCall: now, retryAfter: 5000 }); // 5 second cooldown for successful calls

      console.log(`Trading212 portfolio data with dividends processed: ${positionsData.length} positions analyzed, ${positionsWithDividends.length} successfully processed`);

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
