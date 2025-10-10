
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, TrendingUp, TrendingDown, RefreshCw, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Position {
  symbol: string;
  quantity: number;
  market_value: number;
  current_price: number;
  unrealized_pnl: number;
}

const TopHoldings = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const [holdings, setHoldings] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  const fetchHoldings = async () => {
    if (!user?.id || !selectedPortfolio) {
      setLoading(false);
      return;
    }

    try {
      console.log('Loading holdings from database for portfolio:', selectedPortfolio);
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('portfolio_positions')
        .select('symbol, quantity, market_value, current_price, unrealized_pnl')
        .eq('user_id', user.id)
        .eq('portfolio_id', selectedPortfolio)
        .order('market_value', { ascending: false })
        .limit(5);

      if (queryError) {
        console.error('Error fetching holdings:', queryError);
        setError('Failed to load holdings from database');
        setHoldings([]);
      } else {
        setHoldings(data || []);
        console.log(`Loaded ${data?.length || 0} holdings from database`);
      }

    } catch (error) {
      console.error('Error loading holdings:', error);
      setError('Failed to load holdings');
      setHoldings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAndResync = async () => {
    if (!user?.id || !selectedPortfolio) return;

    setIsClearing(true);
    try {
      // Clear old positions
      const { error: deletePositionsError } = await supabase
        .from('portfolio_positions')
        .delete()
        .eq('user_id', user.id)
        .eq('portfolio_id', selectedPortfolio)
        .eq('broker_type', 'trading212');

      if (deletePositionsError) throw deletePositionsError;

      // Clear old metadata
      const { error: deleteMetadataError } = await supabase
        .from('portfolio_metadata')
        .delete()
        .eq('user_id', user.id)
        .eq('portfolio_id', selectedPortfolio)
        .eq('broker_type', 'trading212');

      if (deleteMetadataError) throw deleteMetadataError;

      toast({
        title: "Data Cleared",
        description: "Old data cleared. Now syncing fresh data from Trading212...",
      });

      // Trigger fresh sync
      const { data, error: syncError } = await supabase.functions.invoke('trading212-sync', {
        body: { portfolioId: selectedPortfolio, forceRefresh: true }
      });

      if (syncError) throw syncError;

      if (data?.success) {
        toast({
          title: "Sync Complete",
          description: `Successfully synced ${data.data?.positions?.length || 0} positions from Trading212`,
        });
        // Refresh display
        await fetchHoldings();
      } else {
        throw new Error(data?.message || 'Sync failed');
      }
    } catch (error: any) {
      console.error('Clear & sync error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to clear and sync data",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  useEffect(() => {
    fetchHoldings();
  }, [user?.id, selectedPortfolio]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Top Holdings
            <Badge variant="secondary">Loading...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              Top Holdings
              <Badge variant="destructive">Error</Badge>
            </div>
            <Button onClick={fetchHoldings} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedPortfolio) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select a portfolio to view holdings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            Top Holdings
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Database className="h-3 w-3 mr-1" />
              Database ({holdings.length})
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleClearAndResync} 
              variant="destructive" 
              size="sm"
              disabled={isClearing}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isClearing ? 'Clearing...' : 'Clear & Re-sync'}
            </Button>
            <Button onClick={fetchHoldings} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {holdings.length > 0 ? (
          <div className="space-y-3">
            {holdings.map((holding, index) => (
              <div key={holding.symbol} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <div className="font-medium">{holding.symbol}</div>
                  <div className="text-sm text-muted-foreground">
                    {holding.quantity.toFixed(6)} shares @ ${holding.current_price.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    ${holding.market_value.toLocaleString('en-US', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </div>
                  <div className={`text-sm flex items-center gap-1 ${
                    holding.unrealized_pnl >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {holding.unrealized_pnl >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {holding.unrealized_pnl >= 0 ? '+' : ''}
                    ${Math.abs(holding.unrealized_pnl).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Database className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No holdings found in database</p>
            <p className="text-sm text-muted-foreground mt-1">
              Sync your portfolio data to see top holdings
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopHoldings;
