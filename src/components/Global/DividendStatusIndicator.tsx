
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDividendData } from "@/contexts/DividendDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { DollarSign, Database, Clock, Shield } from "lucide-react";

const DividendStatusIndicator = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  
  // Add error boundary protection
  let dividendData;
  try {
    dividendData = useDividendData();
  } catch (error) {
    console.log('DividendDataProvider not available:', error);
    return null; // Don't render if context is not available
  }

  const {
    dividends,
    loading,
    lastSync,
    apiCallsToday,
    maxApiCallsPerDay,
    canMakeApiCall,
    autoSyncEnabled,
    refreshDividendData,
    forceSyncData,
    toggleAutoSync,
    getDividendSummary
  } = dividendData;

  if (!user || !selectedPortfolio || dividends.length === 0) {
    return null;
  }

  const { totalAnnualIncome, totalStocks, averageYield } = getDividendSummary();
  const isAdmin = user.email?.includes('admin'); // Simple admin check

  return (
    <Card className="mb-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Dividend Summary */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-semibold text-green-700">${totalAnnualIncome.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">Annual Income</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-semibold text-blue-700">{totalStocks}</div>
                <div className="text-xs text-muted-foreground">Dividend Stocks</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="font-semibold text-purple-700">{averageYield.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Avg. Yield</div>
            </div>
          </div>

          {/* Status and Controls */}
          <div className="flex items-center gap-3">
            {/* API Limit Status */}
            <Badge variant={canMakeApiCall ? "default" : "destructive"}>
              API: {apiCallsToday}/{maxApiCallsPerDay}
            </Badge>

            {/* Auto-sync Status */}
            <Badge variant={autoSyncEnabled ? "default" : "secondary"}>
              Auto-sync: {autoSyncEnabled ? "ON" : "OFF"}
            </Badge>

            {/* Last Sync */}
            {lastSync && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(lastSync).toLocaleTimeString()}
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAutoSync}
                disabled={loading}
              >
                {autoSyncEnabled ? 'Disable' : 'Enable'} Auto
              </Button>

              <div className="text-sm text-muted-foreground">
                Data updates automatically 4x daily
              </div>

            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DividendStatusIndicator;
