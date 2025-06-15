
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, TrendingUp, Clock, CheckCircle } from "lucide-react";

interface DetectedDividend {
  id: string;
  symbol: string;
  company_name: string;
  annual_dividend: number;
  dividend_yield: number;
  frequency: string;
  ex_dividend_date: string;
  payment_date: string;
  shares_owned: number;
  estimated_annual_income: number;
  detection_source: string;
  detected_at: string;
  is_active: boolean;
}

interface DividendJob {
  id: string;
  status: string;
  stocks_analyzed: number;
  dividend_stocks_found: number;
  last_run_at: string;
  next_run_at: string;
}

const DividendAutoDetection = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const { toast } = useToast();
  const [detectedDividends, setDetectedDividends] = useState<DetectedDividend[]>([]);
  const [dividendJob, setDividendJob] = useState<DividendJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Fetch detected dividends for current portfolio
  useEffect(() => {
    const fetchDetectedDividends = async () => {
      if (!user?.id || !selectedPortfolio) return;

      try {
        const { data, error } = await supabase
          .from('detected_dividends')
          .select('*')
          .eq('user_id', user.id)
          .eq('portfolio_id', selectedPortfolio)
          .eq('is_active', true)
          .order('estimated_annual_income', { ascending: false });

        if (error) throw error;
        setDetectedDividends(data || []);
      } catch (error) {
        console.error('Error fetching detected dividends:', error);
      }
    };

    fetchDetectedDividends();
  }, [user?.id, selectedPortfolio]);

  // Fetch dividend job status
  useEffect(() => {
    const fetchDividendJob = async () => {
      if (!user?.id || !selectedPortfolio) return;

      try {
        const { data, error } = await supabase
          .from('dividend_detection_jobs')
          .select('*')
          .eq('user_id', user.id)
          .eq('portfolio_id', selectedPortfolio)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        setDividendJob(data);
      } catch (error) {
        console.error('Error fetching dividend job:', error);
      }
    };

    fetchDividendJob();
  }, [user?.id, selectedPortfolio]);

  const handleRunDividendDetection = async () => {
    if (!user?.id || !selectedPortfolio) return;

    setIsRunning(true);
    try {
      // Create or update dividend detection job
      const { error: jobError } = await supabase
        .from('dividend_detection_jobs')
        .upsert({
          user_id: user.id,
          portfolio_id: selectedPortfolio,
          status: 'pending',
          next_run_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
          updated_at: new Date().toISOString()
        });

      if (jobError) throw jobError;

      // Run dividend detection
      const { data, error } = await supabase.functions.invoke('dividend-detection', {
        body: { 
          portfolioId: selectedPortfolio,
          userId: user.id 
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Dividend Detection Complete",
          description: `Found ${data.dividendStocksFound} dividend-paying stocks out of ${data.stocksAnalyzed} analyzed.`,
        });

        // Refresh data
        const { data: updatedDividends } = await supabase
          .from('detected_dividends')
          .select('*')
          .eq('user_id', user.id)
          .eq('portfolio_id', selectedPortfolio)
          .eq('is_active', true)
          .order('estimated_annual_income', { ascending: false });

        if (updatedDividends) {
          setDetectedDividends(updatedDividends);
        }

        // Update job status
        const { data: updatedJob } = await supabase
          .from('dividend_detection_jobs')
          .select('*')
          .eq('user_id', user.id)
          .eq('portfolio_id', selectedPortfolio)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (updatedJob) {
          setDividendJob(updatedJob);
        }
      } else {
        throw new Error(data.error || 'Dividend detection failed');
      }
    } catch (error: any) {
      console.error('Error running dividend detection:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to run dividend detection.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const totalEstimatedIncome = detectedDividends.reduce((sum, dividend) => sum + dividend.estimated_annual_income, 0);

  if (!selectedPortfolio) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Auto Dividend Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            Select a portfolio to enable dividend detection
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Auto Dividend Detection
        </CardTitle>
        <CardDescription>
          Automatically detect dividend-paying stocks in your portfolio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Job Status */}
        {dividendJob && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              {dividendJob.status === 'completed' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Clock className="h-4 w-4 text-blue-600" />
              )}
              <span className="text-sm font-medium">
                Last Scan: {dividendJob.stocks_analyzed} stocks analyzed, {dividendJob.dividend_stocks_found} dividend stocks found
              </span>
            </div>
            <Badge variant={dividendJob.status === 'completed' ? 'default' : 'secondary'}>
              {dividendJob.status}
            </Badge>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{detectedDividends.length}</div>
            <div className="text-xs text-muted-foreground">Dividend Stocks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              ${totalEstimatedIncome.toFixed(0)}
            </div>
            <div className="text-xs text-muted-foreground">Est. Annual Income</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {detectedDividends.length > 0 
                ? (detectedDividends.reduce((sum, d) => sum + d.dividend_yield, 0) / detectedDividends.length).toFixed(1)
                : '0.0'}%
            </div>
            <div className="text-xs text-muted-foreground">Avg. Yield</div>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={handleRunDividendDetection} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Detecting Dividends...
            </>
          ) : (
            'Run Dividend Detection'
          )}
        </Button>

        {/* Detected Dividends Table */}
        {detectedDividends.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Detected Dividend Stocks</h4>
            <div className="rounded-md border max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Yield</TableHead>
                    <TableHead>Annual Income</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detectedDividends.slice(0, 10).map((dividend) => (
                    <TableRow key={dividend.id}>
                      <TableCell className="font-medium">{dividend.symbol}</TableCell>
                      <TableCell>{dividend.dividend_yield.toFixed(1)}%</TableCell>
                      <TableCell>${dividend.estimated_annual_income.toFixed(0)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {dividend.detection_source}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Next Scan Info */}
        {dividendJob && (
          <div className="text-xs text-muted-foreground text-center">
            Next automatic scan: {new Date(dividendJob.next_run_at).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DividendAutoDetection;
