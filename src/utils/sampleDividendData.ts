
import { supabase } from "@/integrations/supabase/client";

export const addSampleDividendData = async (userId: string, portfolioId: string) => {
  const sampleDividends = [
    {
      user_id: userId,
      portfolio_id: portfolioId,
      symbol: 'AAPL',
      company_name: 'Apple Inc.',
      annual_dividend: 0.96,
      dividend_yield: 0.52,
      frequency: 'quarterly',
      shares_owned: 100,
      estimated_annual_income: 96.00,
      detection_source: 'sample_data',
      detected_at: new Date().toISOString(),
      is_active: true
    },
    {
      user_id: userId,
      portfolio_id: portfolioId,
      symbol: 'MSFT',
      company_name: 'Microsoft Corporation',
      annual_dividend: 3.00,
      dividend_yield: 0.73,
      frequency: 'quarterly',
      shares_owned: 50,
      estimated_annual_income: 150.00,
      detection_source: 'sample_data',
      detected_at: new Date().toISOString(),
      is_active: true
    },
    {
      user_id: userId,
      portfolio_id: portfolioId,
      symbol: 'JNJ',
      company_name: 'Johnson & Johnson',
      annual_dividend: 4.68,
      dividend_yield: 2.85,
      frequency: 'quarterly',
      shares_owned: 25,
      estimated_annual_income: 117.00,
      detection_source: 'sample_data',
      detected_at: new Date().toISOString(),
      is_active: true
    },
    {
      user_id: userId,
      portfolio_id: portfolioId,
      symbol: 'KO',
      company_name: 'Coca-Cola Company',
      annual_dividend: 1.84,
      dividend_yield: 3.05,
      frequency: 'quarterly',
      shares_owned: 75,
      estimated_annual_income: 138.00,
      detection_source: 'sample_data',
      detected_at: new Date().toISOString(),
      is_active: true
    },
    {
      user_id: userId,
      portfolio_id: portfolioId,
      symbol: 'PG',
      company_name: 'Procter & Gamble Co.',
      annual_dividend: 3.65,
      dividend_yield: 2.35,
      frequency: 'quarterly',
      shares_owned: 40,
      estimated_annual_income: 146.00,
      detection_source: 'sample_data',
      detected_at: new Date().toISOString(),
      is_active: true
    }
  ];

  try {
    const { data, error } = await supabase
      .from('detected_dividends')
      .insert(sampleDividends)
      .select();

    if (error) throw error;

    console.log(`Added ${data?.length || 0} sample dividend records`);
    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error('Error adding sample dividend data:', error);
    throw error;
  }
};
