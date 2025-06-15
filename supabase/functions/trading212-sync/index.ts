
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

    const { portfolioId, forceRefresh = false } = await req.json()

    if (!portfolioId) {
      return new Response(
        JSON.stringify({ error: 'Portfolio ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Trading212 sync request for user:', user.id, 'portfolio:', portfolioId, 'forceRefresh:', forceRefresh);

    // Check auto-sync schedule first
    const canAutoSync = await checkAutoSyncSchedule(supabaseClient, user.id, portfolioId);
    
    if (!forceRefresh && !canAutoSync) {
      console.log('Auto-sync limit reached for today, returning cached data');
      const cachedData = await getCachedPortfolioData(supabaseClient, user.id, portfolioId);
      if (cachedData) {
        return new Response(
          JSON.stringify({ success: true, data: cachedData, fromCache: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Enhanced rate limiting
    const rateLimitKey = `user_${user.id}`;
    const now = Date.now();
    const userRateLimit = rateLimitCache.get(rateLimitKey);
    
    if (userRateLimit && now < userRateLimit.lastCall + userRateLimit.retryAfter) {
      const retryInSeconds = Math.ceil((userRateLimit.lastCall + userRateLimit.retryAfter - now) / 1000);
      console.log(`Rate limit active for user ${user.id}, retry in ${retryInSeconds} seconds`);
      
      // Return cached data if available during rate limit
      const cachedData = await getCachedPortfolioData(supabaseClient, user.id, portfolioId);
      if (cachedData) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: cachedData, 
            fromCache: true,
            message: `Rate limited. Showing cached data. Try again in ${retryInSeconds} seconds.`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
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

    // Start sync log
    const syncLog = await createSyncLog(supabaseClient, user.id, portfolioId, forceRefresh ? 'manual' : 'auto');

    const trading212ApiKey = Deno.env.get('TRADING212_API_KEY');
    
    if (!trading212ApiKey) {
      await updateSyncLog(supabaseClient, syncLog.id, 'failed', 'Trading212 API key not configured');
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
          await updateSyncLog(supabaseClient, syncLog.id, 'failed', 'Trading212 API rate limit reached');
          
          // Return cached data if available
          const cachedData = await getCachedPortfolioData(supabaseClient, user.id, portfolioId);
          if (cachedData) {
            return new Response(
              JSON.stringify({ 
                success: true, 
                data: cachedData, 
                fromCache: true,
                message: 'Rate limited. Showing cached data.'
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
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
          await updateSyncLog(supabaseClient, syncLog.id, 'failed', 'Trading212 API rate limit reached');
          
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
        await updateSyncLog(supabaseClient, syncLog.id, 'failed', 'No data available from Trading212 API');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'No data available from Trading212 API',
            message: 'Unable to fetch account data or positions. Please check your Trading212 connection.'
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Processing ${positionsData.length} positions with database sync`);

      // Enhanced portfolio calculation
      const totalInvested = accountInfo?.cash?.invested || 0;
      const cashFree = accountInfo?.cash?.free || 0;
      const totalValue = totalInvested + cashFree;
      const totalReturn = accountInfo?.cash?.result || 0;
      const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
      const todaysChange = positionsData.reduce((sum: number, pos: any) => sum + (pos.ppl || 0), 0);
      const todaysChangePercentage = totalInvested > 0 ? (todaysChange / totalInvested) * 100 : 0;

      // Process positions for database storage
      const formattedPositions = positionsData.map((position: any) => ({
        symbol: position.ticker.replace(/_US_EQ$|_EQ$/, ''),
        quantity: position.quantity,
        averagePrice: position.averagePrice,
        currentPrice: position.currentPrice,
        marketValue: position.marketValue || (position.quantity * position.currentPrice),
        unrealizedPnL: position.ppl
      }));

      // Sync data with database
      const syncResult = await syncPortfolioData(supabaseClient, user.id, portfolioId, {
        positions: formattedPositions,
        metadata: {
          totalValue,
          totalReturn,
          totalReturnPercentage,
          todayChange: todaysChange,
          todayChangePercentage: todaysChangePercentage,
          cashBalance: cashFree,
          holdingsCount: positionsData.length
        }
      });

      // Update sync log with results
      await updateSyncLog(
        supabaseClient, 
        syncLog.id, 
        'success', 
        null, 
        syncResult.added, 
        syncResult.updated
      );

      // Update auto-sync schedule
      if (!forceRefresh) {
        await updateAutoSyncSchedule(supabaseClient, user.id, portfolioId);
      }

      const portfolioData = {
        totalValue,
        todayChange: todaysChange,
        todayPercentage: todaysChangePercentage,
        totalReturn,
        totalReturnPercentage,
        holdingsCount: positionsData.length,
        netDeposits: totalInvested,
        cashBalance: cashFree,
        positions: formattedPositions,
        dividendMetrics: {
          annualIncome: 0,
          quarterlyIncome: 0,
          monthlyAverage: 0,
          portfolioYield: 0,
          dividendPayingStocks: 0
        },
        totalPositionsProcessed: positionsData.length,
        successfullyProcessed: positionsData.length,
        processingErrors: 0,
        enhanced: true,
        syncInfo: {
          positionsAdded: syncResult.added,
          positionsUpdated: syncResult.updated,
          lastSync: new Date().toISOString(),
          syncType: forceRefresh ? 'manual' : 'auto'
        }
      };

      // Update rate limit cache with successful call (shorter cooldown)
      rateLimitCache.set(rateLimitKey, { lastCall: now, retryAfter: 3000 }); // 3 second cooldown

      console.log(`Enhanced Trading212 portfolio data synced: ${positionsData.length} positions, ${syncResult.added} added, ${syncResult.updated} updated`);

      return new Response(
        JSON.stringify({ success: true, data: portfolioData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      await updateSyncLog(supabaseClient, syncLog.id, 'failed', error.message);
      
      if (error.message === 'RATE_LIMITED') {
        console.log('Trading212 API rate limit hit - setting rate limit cache');
        rateLimitCache.set(rateLimitKey, { lastCall: now, retryAfter: 60000 });
        
        // Try to return cached data
        const cachedData = await getCachedPortfolioData(supabaseClient, user.id, portfolioId);
        if (cachedData) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              data: cachedData, 
              fromCache: true,
              message: 'Rate limited. Showing cached data.'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
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

// Helper functions for database operations
async function checkAutoSyncSchedule(supabaseClient: any, userId: string, portfolioId: string): Promise<boolean> {
  const { data: schedule } = await supabaseClient
    .from('auto_sync_schedule')
    .select('*')
    .eq('user_id', userId)
    .eq('portfolio_id', portfolioId)
    .eq('broker_type', 'trading212')
    .single();

  if (!schedule) {
    // Create initial schedule
    await supabaseClient
      .from('auto_sync_schedule')
      .insert({
        user_id: userId,
        portfolio_id: portfolioId,
        broker_type: 'trading212',
        sync_count_today: 0,
        sync_date: new Date().toISOString().split('T')[0]
      });
    return true;
  }

  const today = new Date().toISOString().split('T')[0];
  const lastSyncDate = schedule.sync_date;
  
  // Reset counter if it's a new day
  if (lastSyncDate !== today) {
    await supabaseClient
      .from('auto_sync_schedule')
      .update({
        sync_count_today: 0,
        sync_date: today
      })
      .eq('id', schedule.id);
    return true;
  }

  // Check if we've hit the daily limit (4 times per day)
  if (schedule.sync_count_today >= 4) {
    const lastSync = new Date(schedule.last_auto_sync);
    const now = new Date();
    const hoursSinceLastSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
    
    // Only allow if it's been more than 6 hours since last sync
    return hoursSinceLastSync >= 6;
  }

  return true;
}

async function updateAutoSyncSchedule(supabaseClient: any, userId: string, portfolioId: string) {
  const { data: schedule } = await supabaseClient
    .from('auto_sync_schedule')
    .select('*')
    .eq('user_id', userId)
    .eq('portfolio_id', portfolioId)
    .eq('broker_type', 'trading212')
    .single();

  if (schedule) {
    const today = new Date().toISOString().split('T')[0];
    const newCount = schedule.sync_date === today ? schedule.sync_count_today + 1 : 1;
    
    await supabaseClient
      .from('auto_sync_schedule')
      .update({
        last_auto_sync: new Date().toISOString(),
        sync_count_today: newCount,
        sync_date: today
      })
      .eq('id', schedule.id);
  }
}

async function createSyncLog(supabaseClient: any, userId: string, portfolioId: string, syncType: string) {
  const { data, error } = await supabaseClient
    .from('api_sync_logs')
    .insert({
      user_id: userId,
      portfolio_id: portfolioId,
      broker_type: 'trading212',
      sync_type: syncType,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating sync log:', error);
    throw error;
  }

  return data;
}

async function updateSyncLog(
  supabaseClient: any, 
  syncLogId: string, 
  status: string, 
  errorMessage?: string, 
  positionsAdded?: number, 
  positionsUpdated?: number
) {
  const updates: any = { status };
  if (errorMessage) updates.error_message = errorMessage;
  if (positionsAdded !== undefined) updates.positions_added = positionsAdded;
  if (positionsUpdated !== undefined) updates.positions_updated = positionsUpdated;

  await supabaseClient
    .from('api_sync_logs')
    .update(updates)
    .eq('id', syncLogId);
}

async function syncPortfolioData(supabaseClient: any, userId: string, portfolioId: string, data: any) {
  let positionsAdded = 0;
  let positionsUpdated = 0;

  // Sync portfolio metadata
  await supabaseClient
    .from('portfolio_metadata')
    .upsert({
      user_id: userId,
      portfolio_id: portfolioId,
      broker_type: 'trading212',
      ...data.metadata,
      last_sync_at: new Date().toISOString()
    });

  // Sync positions
  for (const position of data.positions) {
    const { data: existingPosition } = await supabaseClient
      .from('portfolio_positions')
      .select('*')
      .eq('user_id', userId)
      .eq('portfolio_id', portfolioId)
      .eq('broker_type', 'trading212')
      .eq('symbol', position.symbol)
      .single();

    if (existingPosition) {
      // Update existing position if data has changed
      const hasChanges = 
        existingPosition.quantity !== position.quantity ||
        existingPosition.average_price !== position.averagePrice ||
        existingPosition.current_price !== position.currentPrice ||
        existingPosition.market_value !== position.marketValue;

      if (hasChanges) {
        await supabaseClient
          .from('portfolio_positions')
          .update({
            quantity: position.quantity,
            average_price: position.averagePrice,
            current_price: position.currentPrice,
            market_value: position.marketValue,
            unrealized_pnl: position.unrealizedPnL,
            last_updated: new Date().toISOString()
          })
          .eq('id', existingPosition.id);
        
        positionsUpdated++;
      }
    } else {
      // Insert new position
      await supabaseClient
        .from('portfolio_positions')
        .insert({
          user_id: userId,
          portfolio_id: portfolioId,
          broker_type: 'trading212',
          symbol: position.symbol,
          quantity: position.quantity,
          average_price: position.averagePrice,
          current_price: position.currentPrice,
          market_value: position.marketValue,
          unrealized_pnl: position.unrealizedPnL,
          last_updated: new Date().toISOString()
        });
      
      positionsAdded++;
    }
  }

  return { added: positionsAdded, updated: positionsUpdated };
}

async function getCachedPortfolioData(supabaseClient: any, userId: string, portfolioId: string) {
  try {
    // Get metadata
    const { data: metadata } = await supabaseClient
      .from('portfolio_metadata')
      .select('*')
      .eq('user_id', userId)
      .eq('portfolio_id', portfolioId)
      .eq('broker_type', 'trading212')
      .single();

    // Get positions
    const { data: positions } = await supabaseClient
      .from('portfolio_positions')
      .select('*')
      .eq('user_id', userId)
      .eq('portfolio_id', portfolioId)
      .eq('broker_type', 'trading212');

    if (!metadata || !positions) {
      return null;
    }

    // Format for frontend
    const formattedPositions = positions.map((pos: any) => ({
      symbol: pos.symbol,
      quantity: pos.quantity,
      averagePrice: pos.average_price,
      currentPrice: pos.current_price,
      marketValue: pos.market_value,
      unrealizedPnL: pos.unrealized_pnl
    }));

    return {
      totalValue: metadata.total_value,
      todayChange: metadata.today_change,
      todayPercentage: metadata.today_change_percentage,
      totalReturn: metadata.total_return,
      totalReturnPercentage: metadata.total_return_percentage,
      holdingsCount: metadata.holdings_count,
      cashBalance: metadata.cash_balance,
      positions: formattedPositions,
      dividendMetrics: {
        annualIncome: 0,
        quarterlyIncome: 0,
        monthlyAverage: 0,
        portfolioYield: 0,
        dividendPayingStocks: 0
      },
      lastSync: metadata.last_sync_at,
      fromDatabase: true
    };
  } catch (error) {
    console.error('Error getting cached data:', error);
    return null;
  }
}
