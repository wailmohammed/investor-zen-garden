
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, ArrowUpRight, ArrowDownRight, Database, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";

const PortfolioSummary = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    totalReturn: 0,
    totalReturnPercentage: 0,
    todayChange: 0,
    todayChangePercentage: 0,
    holdingsCount: 0,
    cashBalance: 0,
    lastSync: null as string | null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolioData = async () => {
    if (!user?.id || !selectedPortfolio) {
      setLoading(false);
      return;
    }

    try {
      console.log('Loading portfolio data from database for portfolio:', selectedPortfolio);
      setLoading(true);
      setError(null);
      
      // Get portfolio metadata
      const { data: metadata, error: metadataError } = await supabase
        .from('portfolio_metadata')
        .select('*')
        .eq('user_id', user.id)
        .eq('portfolio_id', selectedPortfolio)
        .maybeSingle();

      // Get positions count and total value
      const { data: positions, error: positionsError } = await supabase
        .from('portfolio_positions')
        .select('symbol, market_value, quantity, unrealized_pnl')
        .eq('user_id', user.id)
        .eq('portfolio_id', selectedPortfolio);

      if (metadataError && metadataError.code !== 'PGRST116') {
        console.error('Error fetching metadata:', metadataError);
        setError('Failed to load portfolio metadata');
      }

      if (positionsError) {
        console.error('Error fetching positions:', positionsError);
        setError('Failed to load portfolio positions');
      }

      const holdingsCount = positions?.length || 0;
      const totalPositionValue = positions?.reduce((sum, pos) => sum + (pos.market_value || 0), 0) || 0;
      const totalUnrealizedPnl = positions?.reduce((sum, pos) => sum + (pos.unrealized_pnl || 0), 0) || 0;

      if (metadata) {
        setPortfolioData({
          totalValue: metadata.total_value || totalPositionValue,
          totalReturn: metadata.total_return || totalUnrealizedPnl,
          totalReturnPercentage: metadata.total_return_percentage || 0,
          todayChange: metadata.today_change || 0,
          todayChangePercentage: metadata.today_change_percentage || 0,
          holdingsCount,
          cashBalance: metadata.cash_balance || 0,
          lastSync: metadata.last_sync_at
        });
        console.log('Loaded portfolio metadata from database:', metadata);
      } else if (holdingsCount > 0) {
        // Use position data if no metadata
        setPortfolioData(prev => ({
          ...prev,
          totalValue: totalPositionValue,
          totalReturn: totalUnrealizedPnl,
          totalReturnPercentage: totalPositionValue > 0 ? (totalUnrealizedPnl / (totalPositionValue - totalUnrealizedPnl)) * 100 : 0,
          holdingsCount,
          lastSync: new Date().toISOString()
        }));
        console.log('Using position data as fallback, found', holdingsCount, 'positions');
      } else {
        console.log('No portfolio data found in database');
      }

    } catch (error) {
      console.error('Error loading portfolio data:', error);
      setError('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, [user?.id, selectedPortfolio]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Portfolio Overview
            <Badge variant="secondary">Loading...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Portfolio Overview
            <Badge variant="destructive">Error</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-destructive mb-2">{error}</p>
            <Button onClick={fetchPortfolioData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedPortfolio) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Portfolio Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select a portfolio to view overview</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Portfolio Overview
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Database className="h-3 w-3 mr-1" />
              Database
            </Badge>
          </div>
          <Button onClick={fetchPortfolioData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
        {portfolioData.lastSync && (
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date(portfolioData.lastSync).toLocaleString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="text-3xl font-bold">
            ${portfolioData.totalValue.toLocaleString('en-US', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </div>
          {portfolioData.totalValue > 0 && (
            <div className="flex items-center gap-2">
              {portfolioData.totalReturn >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                portfolioData.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {portfolioData.totalReturn >= 0 ? '+' : ''}
                ${Math.abs(portfolioData.totalReturn).toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })} ({portfolioData.totalReturnPercentage >= 0 ? '+' : ''}
                {portfolioData.totalReturnPercentage.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Today's Change</p>
            <div className="flex items-center gap-1">
              {portfolioData.todayChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`font-medium ${
                portfolioData.todayChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {portfolioData.todayChange >= 0 ? '+' : ''}
                ${Math.abs(portfolioData.todayChange).toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Holdings</p>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{portfolioData.holdingsCount}</span>
            </div>
          </div>
        </div>

        {portfolioData.totalValue === 0 && portfolioData.holdingsCount === 0 && (
          <div className="text-center py-4">
            <Database className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No portfolio data in database</p>
            <p className="text-sm text-muted-foreground mt-1">
              Connect your broker or sync data to see portfolio overview
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioSummary;
