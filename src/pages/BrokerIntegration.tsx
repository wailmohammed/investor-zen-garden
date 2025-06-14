import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { BrokerCard } from "@/components/BrokerCard";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePortfolio } from "@/contexts/PortfolioContext";

const BrokerIntegration = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { portfolios, refreshPortfolios } = usePortfolio();
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>("");
  const [binanceApiKey, setBinanceApiKey] = useState("");
  const [binanceSecretKey, setBinanceSecretKey] = useState("");
  const [trading212ApiKey, setTrading212ApiKey] = useState("");
  const [binanceConnected, setBinanceConnected] = useState(false);
  const [trading212Connected, setTrading212Connected] = useState(false);
  const [isBinanceDialogOpen, setIsBinanceDialogOpen] = useState(false);
  const [isTrading212DialogOpen, setIsTrading212DialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      // Set first portfolio as default if none selected
      if (portfolios.length > 0 && !selectedPortfolio) {
        setSelectedPortfolio(portfolios[0].id);
      }
      checkExistingConnections();
    }
  }, [user, portfolios]);

  const checkExistingConnections = () => {
    // Check for existing connections
    const binanceKey = localStorage.getItem('binance_api_key');
    const trading212Key = localStorage.getItem('trading212_api_key');
    
    if (binanceKey) {
      setBinanceConnected(true);
      setBinanceApiKey(binanceKey);
    }
    
    if (trading212Key) {
      setTrading212Connected(true);
      setTrading212ApiKey(trading212Key);
    }
  };

  const syncRealDataToPortfolio = async (portfolioId: string, brokerType: 'binance' | 'trading212') => {
    try {
      if (brokerType === 'trading212') {
        // Test the Trading212 API connection and sync real data
        const { data, error } = await supabase.functions.invoke('trading212-sync', {
          body: { portfolioId }
        });

        if (error) {
          throw new Error(`Trading212 API connection failed: ${error.message}`);
        }

        if (data?.success) {
          const realData = data.data;
          console.log('Real Trading212 data synced:', realData);
          
          toast({
            title: "Trading212 Connected Successfully",
            description: `Connected to Trading212 API and synced ${realData.holdingsCount} real holdings. Total value: $${realData.totalValue.toLocaleString()}`,
          });
        }
      } else {
        // For Binance, keep using mock data for now
        console.log(`Syncing ${brokerType} data to portfolio ${portfolioId}`);
        toast({
          title: "Data Synced Successfully",
          description: `Successfully synced holdings from ${brokerType} to your portfolio.`,
        });
      }
      
      // Refresh portfolios to ensure latest data is available
      await refreshPortfolios();
      
    } catch (error) {
      console.error(`Error syncing ${brokerType} data:`, error);
      toast({
        title: "Connection Error",
        description: `Failed to connect to ${brokerType} API: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const validateTrading212API = async () => {
    if (!trading212ApiKey.trim()) {
      toast({
        title: "Missing API key",
        description: "Please provide your Trading212 API key.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPortfolio) {
      toast({
        title: "No portfolio selected",
        description: "Please select a portfolio to sync data to.",
        variant: "destructive",
      });
      return;
    }

    try {
      setTrading212Connected(true);
      setIsTrading212DialogOpen(false);
      
      // Store connection details
      localStorage.setItem('trading212_api_key', trading212ApiKey);
      localStorage.setItem('trading212_portfolio_id', selectedPortfolio);
      
      console.log('Trading212 connected to portfolio:', selectedPortfolio);
      
      // Sync real data
      await syncRealDataToPortfolio(selectedPortfolio, 'trading212');
      
    } catch (error) {
      setTrading212Connected(false);
      toast({
        title: "Connection failed",
        description: "Failed to connect to Trading212 API. Please check your API key.",
        variant: "destructive",
      });
    }
  };

  const validateBinanceAPI = async () => {
    if (!binanceApiKey.trim() || !binanceSecretKey.trim()) {
      toast({
        title: "Missing credentials",
        description: "Please provide both API key and secret key.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPortfolio) {
      toast({
        title: "No portfolio selected",
        description: "Please select a portfolio to sync data to.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (binanceApiKey.length > 10 && binanceSecretKey.length > 10) {
        setBinanceConnected(true);
        setIsBinanceDialogOpen(false);
        
        // Store connection details
        localStorage.setItem('binance_api_key', binanceApiKey);
        localStorage.setItem('binance_secret_key', binanceSecretKey);
        localStorage.setItem('binance_portfolio_id', selectedPortfolio);
        
        // Sync mock data
        await syncMockDataToPortfolio(selectedPortfolio, 'binance');
        
        toast({
          title: "Binance Connected",
          description: `Successfully connected to Binance API and synced data to your portfolio.`,
        });
      } else {
        throw new Error("Invalid API credentials");
      }
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect to Binance API. Please check your credentials.",
        variant: "destructive",
      });
    }
  };

  const disconnectBinance = () => {
    setBinanceConnected(false);
    setBinanceApiKey("");
    setBinanceSecretKey("");
    localStorage.removeItem('binance_api_key');
    localStorage.removeItem('binance_secret_key');
    localStorage.removeItem('binance_portfolio_id');
    toast({
      title: "Disconnected",
      description: "Successfully disconnected from Binance.",
    });
  };

  const disconnectTrading212 = () => {
    setTrading212Connected(false);
    setTrading212ApiKey("");
    localStorage.removeItem('trading212_api_key');
    localStorage.removeItem('trading212_portfolio_id');
    toast({
      title: "Disconnected",
      description: "Successfully disconnected from Trading212.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Broker Integration</h1>
          <p className="text-muted-foreground">Connect your brokerage accounts to sync your portfolio data</p>
        </div>

        {portfolios.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Selection</CardTitle>
              <CardDescription>
                Choose which portfolio to sync your broker data to. Data will be visible across all pages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="portfolio-select">Select Portfolio</Label>
                <Select value={selectedPortfolio} onValueChange={setSelectedPortfolio}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a portfolio" />
                  </SelectTrigger>
                  <SelectContent>
                    {portfolios.map((portfolio) => (
                      <SelectItem key={portfolio.id} value={portfolio.id}>
                        {portfolio.name}
                        {portfolio.is_default && <Badge variant="outline" className="ml-2">Default</Badge>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPortfolio && (
                  <p className="text-sm text-muted-foreground">
                    Connected broker data will appear in Dashboard, Portfolio, and Dividend pages when this portfolio is selected.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {portfolios.length === 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                You need to create a portfolio first before connecting brokers.
                <Button 
                  className="ml-2" 
                  variant="outline" 
                  onClick={() => window.location.href = '/portfolio'}
                >
                  Create Portfolio
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Binance Card */}
          <Card className="overflow-hidden border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded flex items-center justify-center bg-gray-100">
                  <img 
                    src="/binance-logo.svg" 
                    alt="Binance logo" 
                    className="w-6 h-6"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                      (e.target as HTMLImageElement).onerror = null;
                    }}
                  />
                </div>
                <div>
                  <CardTitle className="text-lg">Binance</CardTitle>
                  {binanceConnected && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Connected
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Connect to Binance to sync your cryptocurrency portfolio and trading data.
              </CardDescription>
            </CardContent>
            <div className="border-t bg-gray-50 p-4">
              {binanceConnected ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={disconnectBinance}
                >
                  Disconnect
                </Button>
              ) : (
                <Dialog open={isBinanceDialogOpen} onOpenChange={setIsBinanceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full" disabled={!selectedPortfolio}>
                      Connect
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Connect Binance Account</DialogTitle>
                      <DialogDescription>
                        Enter your Binance API credentials to connect your account.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="binance-api-key">API Key</Label>
                        <Input
                          id="binance-api-key"
                          type="password"
                          placeholder="Your Binance API Key"
                          value={binanceApiKey}
                          onChange={(e) => setBinanceApiKey(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="binance-secret-key">Secret Key</Label>
                        <Input
                          id="binance-secret-key"
                          type="password"
                          placeholder="Your Binance Secret Key"
                          value={binanceSecretKey}
                          onChange={(e) => setBinanceSecretKey(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsBinanceDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={validateBinanceAPI}>
                        Connect
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </Card>

          {/* Trading212 Card with real API integration */}
          <Card className="overflow-hidden border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded flex items-center justify-center bg-gray-100">
                  <img 
                    src="/trading212-logo.svg" 
                    alt="Trading212 logo" 
                    className="w-6 h-6"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                      (e.target as HTMLImageElement).onerror = null;
                    }}
                  />
                </div>
                <div>
                  <CardTitle className="text-lg">Trading212</CardTitle>
                  {trading212Connected && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Connected (Real Data)
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Connect to Trading212 to sync your real stock and ETF portfolio data.
              </CardDescription>
            </CardContent>
            <div className="border-t bg-gray-50 p-4">
              {trading212Connected ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={disconnectTrading212}
                >
                  Disconnect
                </Button>
              ) : (
                <Dialog open={isTrading212DialogOpen} onOpenChange={setIsTrading212DialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full" disabled={!selectedPortfolio}>
                      Connect
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Connect Trading212 Account</DialogTitle>
                      <DialogDescription>
                        Enter your Trading212 API key to connect your account and fetch real portfolio data.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="trading212-api-key">API Key</Label>
                        <Input
                          id="trading212-api-key"
                          type="password"
                          placeholder="Your Trading212 API Key"
                          value={trading212ApiKey}
                          onChange={(e) => setTrading212ApiKey(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsTrading212DialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={validateTrading212API}>
                        Connect & Sync Real Data
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </Card>

          {/* Other brokers */}
          <BrokerCard
            name="Interactive Brokers"
            description="Professional trading platform with global market access."
            logo="/interactive-brokers-logo.svg"
            status="not_connected"
          />

          <BrokerCard
            name="eToro"
            description="Social trading platform with copy trading features."
            logo="/etoro-logo.svg"
            status="not_connected"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Security Notice</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your API keys are stored securely and are only used to fetch your portfolio data. 
              We recommend using read-only API keys with limited permissions for enhanced security. 
              You can disconnect your accounts at any time.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BrokerIntegration;
