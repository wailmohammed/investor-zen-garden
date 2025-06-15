
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { analyzePortfolioForDividends } from './dividend-analyzer.ts'

const supabaseUrl = 'https://tngtalojrxengqqrkcwl.supabase.co'
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Dividend detection service
const detectDividendsForPortfolio = async (portfolioId: string, userId: string) => {
  console.log(`Starting dividend detection for portfolio: ${portfolioId}`);
  
  try {
    // Get portfolio positions
    const { data: positions, error: positionsError } = await supabase
      .from('portfolio_positions')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('user_id', userId);

    if (positionsError) {
      console.error('Error fetching positions:', positionsError);
      return { success: false, error: positionsError.message };
    }

    if (!positions || positions.length === 0) {
      console.log('No positions found for portfolio');
      return { success: true, stocksAnalyzed: 0, dividendStocksFound: 0 };
    }

    console.log(`Found ${positions.length} positions to analyze`);

    // Convert positions to holdings format for analysis
    const holdings = positions.map(pos => ({
      symbol: pos.symbol,
      quantity: pos.quantity,
      currentPrice: pos.current_price,
      marketValue: pos.market_value
    }));

    // Analyze holdings for dividends
    const analysis = await analyzePortfolioForDividends(holdings);
    
    console.log(`Analysis complete: ${analysis.dividendPayers.length} dividend stocks found`);

    // Store detected dividends in database
    for (const dividendStock of analysis.dividendPayers) {
      const position = positions.find(p => p.symbol.toUpperCase().includes(dividendStock.symbol));
      const estimatedAnnualIncome = position ? 
        (dividendStock.dividendInfo.annual * position.quantity) : 0;

      await supabase
        .from('detected_dividends')
        .upsert({
          user_id: userId,
          portfolio_id: portfolioId,
          symbol: dividendStock.symbol,
          company_name: dividendStock.symbol, // Could be enhanced with actual company names
          annual_dividend: dividendStock.dividendInfo.annual,
          dividend_yield: dividendStock.dividendInfo.yield,
          frequency: dividendStock.dividendInfo.frequency,
          ex_dividend_date: dividendStock.dividendInfo.nextExDate || null,
          payment_date: dividendStock.dividendInfo.paymentDate || null,
          shares_owned: position?.quantity || null,
          estimated_annual_income: estimatedAnnualIncome,
          detection_source: dividendStock.apiSource || 'database',
          detected_at: new Date().toISOString(),
          is_active: true
        }, {
          onConflict: 'user_id,portfolio_id,symbol'
        });
    }

    return {
      success: true,
      stocksAnalyzed: analysis.analysisStats.totalAnalyzed,
      dividendStocksFound: analysis.dividendPayers.length,
      analysisStats: analysis.analysisStats
    };

  } catch (error) {
    console.error('Error in dividend detection:', error);
    return { success: false, error: error.message };
  }
};

// Save dividend data directly
const saveDividendData = async (userId: string, portfolioId: string, dividendData: any[]) => {
  console.log(`Saving ${dividendData.length} dividend records for portfolio: ${portfolioId}`);
  
  try {
    for (const dividend of dividendData) {
      await supabase
        .from('detected_dividends')
        .upsert({
          user_id: userId,
          portfolio_id: portfolioId,
          symbol: dividend.symbol,
          company_name: dividend.company || dividend.symbol,
          annual_dividend: dividend.annualDividend,
          dividend_yield: dividend.yield,
          frequency: dividend.frequency || 'quarterly',
          ex_dividend_date: dividend.exDate || null,
          payment_date: dividend.paymentDate || null,
          shares_owned: dividend.shares || null,
          estimated_annual_income: dividend.totalAnnualIncome,
          detection_source: dividend.apiSource || 'manual',
          detected_at: new Date().toISOString(),
          is_active: true
        }, {
          onConflict: 'user_id,portfolio_id,symbol'
        });
    }

    return {
      success: true,
      savedCount: dividendData.length
    };
  } catch (error) {
    console.error('Error saving dividend data:', error);
    return { success: false, error: error.message };
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { portfolioId, userId, runAll, saveData, dividendData } = await req.json();

    if (saveData && dividendData) {
      // Save dividend data directly
      const result = await saveDividendData(userId, portfolioId, dividendData);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (runAll) {
      // Run detection for all active users' portfolios
      console.log('Running dividend detection for all portfolios');
      
      const { data: jobs, error: jobsError } = await supabase
        .from('dividend_detection_jobs')
        .select('*')
        .lte('next_run_at', new Date().toISOString());

      if (jobsError) {
        throw jobsError;
      }

      const results = [];
      
      for (const job of jobs || []) {
        const result = await detectDividendsForPortfolio(job.portfolio_id, job.user_id);
        
        // Update job status
        await supabase
          .from('dividend_detection_jobs')
          .update({
            status: result.success ? 'completed' : 'failed',
            stocks_analyzed: result.stocksAnalyzed || 0,
            dividend_stocks_found: result.dividendStocksFound || 0,
            last_run_at: new Date().toISOString(),
            next_run_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);

        results.push({
          portfolioId: job.portfolio_id,
          userId: job.user_id,
          ...result
        });
      }

      return new Response(JSON.stringify({
        success: true,
        message: `Processed ${results.length} dividend detection jobs`,
        results
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (portfolioId && userId) {
      // Run detection for specific portfolio
      const result = await detectDividendsForPortfolio(portfolioId, userId);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required parameters: portfolioId and userId, or runAll flag'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error in dividend detection function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
