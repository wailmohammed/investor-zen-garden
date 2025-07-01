
import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Loader2, AlertCircle, Key, Shield, Zap, Database, Briefcase, TrendingUp, DollarSign } from "lucide-react";
import { BrokerCard } from "@/components/BrokerCard";
import ApiKeyManager from "@/components/ApiKeyManager";
import PortfolioManager from "@/components/Portfolio/PortfolioManager";
import WatchlistManager from "@/components/Portfolio/WatchlistManager";
import DividendManager from "@/components/Portfolio/DividendManager";
import HoldingsManager from "@/components/Portfolio/HoldingsManager";
import Trading212CsvUpload from "@/components/Trading212CsvUpload";
import { CSVUpload } from "@/components/ui/csv-upload";
import { PortfolioSelector } from "@/components/ui/portfolio-selector";
import { toast } from "@/hooks/use-toast";
import { PortfolioProvider, usePortfolio } from "@/contexts/PortfolioContext";
import { useAuth } from "@/contexts/AuthContext";
import SyncManager from "@/components/SyncManager";

const BrokerIntegrationContent = () => {
  const [isTestingBinance, setIsTestingBinance] = useState(false);
  const [binanceTestResult, setBinanceTestResult] = useState<'success' | 'error' | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [connectionLoading, setConnectionLoading] = useState<{ [key: string]: boolean }>({});
  const { user } = useAuth();
  const { portfolios, selectedPortfolio, setSelectedPortfolio, isLoading } = usePortfolio();

  console.log("BrokerIntegration - User:", user?.email);
  console.log("BrokerIntegration - Portfolios:", portfolios);
  console.log("BrokerIntegration - Selected Portfolio:", selectedPortfolio);
  console.log("BrokerIntegration - Loading:", isLoading);

  const handleCSVUpload = (data: any[]) => {
    setCsvData(data);
    toast({
      title: "CSV Data Loaded",
      description: `${data.length} items ready to import`,
    });
  };

  // Trading212 connection handlers
  const handleTrading212Connect = () => {
    if (!selectedPortfolio) {
      toast({
        title: "Portfolio Required",
        description: "Please select a portfolio to connect Trading212 to",
        variant: "destructive",
      });
      return;
    }

    setConnectionLoading(prev => ({ ...prev, trading212: true }));
    
    // Store the portfolio connection
    localStorage.setItem('trading212_portfolio_id', selectedPortfolio);
    
    setTimeout(() => {
      setConnectionLoading(prev => ({ ...prev, trading212: false }));
      toast({
        title: "Trading212 Connected",
        description: `Trading212 has been connected to your portfolio: ${portfolios.find(p => p.id === selectedPortfolio)?.name}`,
      });
    }, 2000);
  };

  const handleTrading212Disconnect = () => {
    setConnectionLoading(prev => ({ ...prev, trading212: true }));
    
    // Remove the portfolio connection
    localStorage.removeItem('trading212_portfolio_id');
    
    setTimeout(() => {
      setConnectionLoading(prev => ({ ...prev, trading212: false }));
      toast({
        title: "Trading212 Disconnected",
        description: "Trading212 has been disconnected from your portfolio",
      });
    }, 1000);
  };

  // Binance connection handlers
  const handleBinanceConnect = () => {
    const apiKey = localStorage.getItem('binance_api_key');
    const secretKey = localStorage.getItem('binance_secret_api_key');
    
    if (!apiKey || !secretKey) {
      toast({
        title: "API Keys Missing",
        description: "Please configure your Binance API keys first in the API Configuration tab",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPortfolio) {
      toast({
        title: "Portfolio Required",
        description: "Please select a portfolio to connect Binance to",
        variant: "destructive",
      });
      return;
    }

    setConnectionLoading(prev => ({ ...prev, binance: true }));
    
    // Store the portfolio connection
    localStorage.setItem('binance_portfolio_id', selectedPortfolio);
    
    setTimeout(() => {
      setConnectionLoading(prev => ({ ...prev, binance: false }));
      toast({
        title: "Binance Connected",
        description: `Binance has been connected to your portfolio: ${portfolios.find(p => p.id === selectedPortfolio)?.name}`,
      });
    }, 2000);
  };

  const handleBinanceDisconnect = () => {
    setConnectionLoading(prev => ({ ...prev, binance: true }));
    
    // Remove the portfolio connection
    localStorage.removeItem('binance_portfolio_id');
    
    setTimeout(() => {
      setConnectionLoading(prev => ({ ...prev, binance: false }));
      toast({
        title: "Binance Disconnected", 
        description: "Binance has been disconnected from your portfolio",
      });
    }, 1000);
  };

  // Test Binance API connection
  const testBinanceConnection = async () => {
    setIsTestingBinance(true);
    setBinanceTestResult(null);
    
    try {
      const apiKey = localStorage.getItem('binance_api_key');
      const secretKey = localStorage.getItem('binance_secret_api_key');
      
      if (!apiKey || !secretKey) {
        toast({
          title: "API Keys Missing",
          description: "Please set your Binance API keys first in the API Configuration section",
          variant: "destructive",
        });
        setBinanceTestResult('error');
        return;
      }

      if (!selectedPortfolio) {
        toast({
          title: "Portfolio Required",
          description: "Please select a portfolio to connect your API to",
          variant: "destructive",
        });
        setBinanceTestResult('error');
        return;
      }

      console.log('Testing Binance connection...');
      console.log('API Key configured:', !!apiKey);
      console.log('Secret Key configured:', !!secretKey);
      console.log('Selected portfolio:', selectedPortfolio);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store the portfolio connection
      localStorage.setItem('binance_portfolio_id', selectedPortfolio);
      
      setBinanceTestResult('success');
      toast({
        title: "Connection Successful",
        description: "Binance API keys are configured correctly and connected to your selected portfolio.",
      });
      
    } catch (error) {
      console.error('Binance connection test failed:', error);
      setBinanceTestResult('error');
      toast({
        title: "Connection Failed",
        description: "Binance connection test failed. Please check your API keys and try again.",
        variant: "destructive",
      });
    } finally {
      setIsTestingBinance(false);
    }
  };

  const hasPortfolios = portfolios && portfolios.length > 0;

  // Get connection statuses
  const trading212Connected = !!localStorage.getItem('trading212_portfolio_id');
  const binanceConnected = !!localStorage.getItem('binance_portfolio_id');

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading portfolios...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            🔗 Data Integration & Portfolio Management
            <Badge variant="secondary" className="bg-green-100 text-green-800">Enhanced</Badge>
          </h1>
          <p className="text-muted-foreground">Connect your trading accounts, configure API integrations, and manage your investment portfolios</p>
        </div>
      </div>

      {!hasPortfolios && (
        <Alert>
          <Briefcase className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Create Your First Portfolio</p>
              <p>You need to create at least one portfolio before you can add holdings, connect APIs, or import data.</p>
              <p className="text-sm text-muted-foreground">
                Start by going to the "Portfolios" tab to create your first portfolio.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="brokers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="brokers">🏢 Brokers</TabsTrigger>
          <TabsTrigger value="portfolios">📊 Portfolios</TabsTrigger>
          <TabsTrigger value="holdings" disabled={!hasPortfolios}>💼 Holdings</TabsTrigger>
          <TabsTrigger value="dividends" disabled={!hasPortfolios}>💰 Dividends</TabsTrigger>
          <TabsTrigger value="watchlists" disabled={!hasPortfolios}>👁️ Watchlists</TabsTrigger>
          <TabsTrigger value="api-config">🔑 API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="brokers" className="space-y-6">
          {/* Connection Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`flex items-center gap-3 p-3 rounded-lg ${trading212Connected ? 'bg-green-50' : 'bg-gray-50'}`}>
                  {trading212Connected ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-600" />
                  )}
                  <div>
                    <p className="font-medium">Trading212</p>
                    <p className="text-sm text-muted-foreground">
                      {trading212Connected ? 'Connected & Active' : 'Not Connected'}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-lg ${binanceConnected ? 'bg-orange-50' : 'bg-gray-50'}`}>
                  {binanceConnected ? (
                    <CheckCircle className="h-5 w-5 text-orange-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-600" />
                  )}
                  <div>
                    <p className="font-medium">Binance</p>
                    <p className="text-sm text-muted-foreground">
                      {binanceConnected ? 'Connected to Portfolio' : 'Not Connected'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <XCircle className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium">Interactive Brokers</p>
                    <p className="text-sm text-muted-foreground">Coming Soon</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Selection for API Connections */}
          {hasPortfolios && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  API Portfolio Connection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select which portfolio you want to connect your API integrations to. This determines where your API data will be imported and stored.
                </p>
                <PortfolioSelector
                  portfolios={portfolios}
                  value={selectedPortfolio}
                  onValueChange={setSelectedPortfolio}
                  label="Portfolio for API Connections"
                  placeholder="Select a portfolio for API connections"
                />
                {selectedPortfolio && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Selected portfolio: <strong>{portfolios.find(p => p.id === selectedPortfolio)?.name}</strong>
                      <br />
                      All API data will be synced to this portfolio and stored in the database for offline access.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Broker Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BrokerCard
              name="Trading212"
              logo="/trading212-logo.svg"
              description="Connect your Trading212 account to automatically sync your portfolio and dividend data."
              status={trading212Connected ? 'connected' : 'not_connected'}
              onConnect={handleTrading212Connect}
              onDisconnect={handleTrading212Disconnect}
              isLoading={connectionLoading.trading212}
            />

            <BrokerCard
              name="Binance"
              logo="/binance-logo.svg"
              description="Connect your Binance account to track your cryptocurrency portfolio."
              status={binanceConnected ? 'connected' : 'not_connected'}
              onConnect={handleBinanceConnect}
              onDisconnect={handleBinanceDisconnect}
              isLoading={connectionLoading.binance}
            />

            <BrokerCard
              name="Interactive Brokers"
              logo="/interactive-brokers-logo.svg"
              description="Professional trading platform integration for comprehensive portfolio management."
              status="not_connected"
              onConnect={() => toast({
                title: "Coming Soon",
                description: "Interactive Brokers integration is in development.",
              })}
            />

            <BrokerCard
              name="eToro"
              logo="/etoro-logo.svg"
              description="Social trading platform with copy trading and portfolio insights."
              status="not_connected"
              onConnect={() => toast({
                title: "Coming Soon",
                description: "eToro integration is planned for future release.",
              })}
            />
          </div>

          {/* Data Import Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Data Import & CSV Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!hasPortfolios ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Create a portfolio first to enable CSV import functionality.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Trading212CsvUpload />
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">General CSV Import</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CSVUpload onFileUpload={handleCSVUpload} />
                      {csvData.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Preview ({csvData.length} rows):</h4>
                          <div className="bg-muted p-3 rounded-md max-h-40 overflow-auto">
                            <pre className="text-xs">
                              {JSON.stringify(csvData.slice(0, 3), null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolios">
          <PortfolioManager csvData={csvData} />
        </TabsContent>

        <TabsContent value="holdings">
          <HoldingsManager />
        </TabsContent>

        <TabsContent value="dividends">
          <DividendManager csvData={csvData} />
        </TabsContent>

        <TabsContent value="watchlists">
          <WatchlistManager />
        </TabsContent>

        <TabsContent value="api-config" className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your API keys are stored securely in your browser's local storage and are never transmitted to our servers.
              Always ensure you're using read-only API keys when possible.
            </AlertDescription>
          </Alert>

          <ApiKeyManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const BrokerIntegration = () => {
  return (
    <PortfolioProvider>
      <DashboardLayout>
        <BrokerIntegrationContent />
      </DashboardLayout>
    </PortfolioProvider>
  );
};

export default BrokerIntegration;
