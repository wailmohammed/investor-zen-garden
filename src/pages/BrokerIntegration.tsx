
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useAuth } from "@/contexts/AuthContext";
import { PortfolioProvider } from "@/contexts/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, AlertCircle } from "lucide-react";
import ApiKeyManager from "@/components/ApiKeyManager";
import { PortfolioSelector } from "@/components/ui/portfolio-selector";
import { Alert, AlertDescription } from "@/components/ui/alert";

const brokerLogos = {
  Trading212: '/trading212_logo.png',
  Binance: '/binance_logo.png',
};

const BrokerIntegrationContent = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { portfolios, selectedPortfolio, setSelectedPortfolio } = usePortfolio();
  const [isConnecting, setIsConnecting] = useState<{ [key: string]: boolean }>({
    Trading212: false,
    Binance: false,
  });
  const [isRefreshing, setIsRefreshing] = useState<{ [key: string]: boolean }>({
    Trading212: false,
    Binance: false,
  });
  const [connectedBrokers, setConnectedBrokers] = useState<{ [key: string]: boolean }>({
    Trading212: localStorage.getItem('trading212_connected') === 'true',
    Binance: localStorage.getItem('binance_connected') === 'true',
  });

  const syncRealDataToPortfolio = async (brokerName: string) => {
    if (!selectedPortfolio) {
      toast({
        title: "No Portfolio Selected",
        description: "Please select a portfolio first to sync data to it.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsConnecting(prev => ({ ...prev, [brokerName]: true }));
      
      if (brokerName === 'Trading212') {
        console.log(`Syncing Trading212 data to portfolio: ${selectedPortfolio}`);
        
        const { data, error } = await supabase.functions.invoke('trading212-sync', {
          body: { portfolioId: selectedPortfolio }
        });

        if (error) {
          console.error('Trading212 connection error:', error);
          throw new Error(`Failed to connect to Trading212: ${error.message}`);
        }

        if (!data?.success) {
          console.error('Trading212 API error:', data?.error, data?.message);
          if (data?.error === 'RATE_LIMITED') {
            throw new Error('Trading212 API rate limit reached. Please try again in a few minutes.');
          }
          throw new Error(data?.message || 'Failed to connect to Trading212 API. Please check your API key.');
        }

        // Store the successful connection with portfolio association
        localStorage.setItem('trading212_portfolio_id', selectedPortfolio);
        localStorage.setItem('trading212_connected', 'true');
        localStorage.setItem('trading212_data', JSON.stringify(data.data));

        setConnectedBrokers(prev => ({ ...prev, [brokerName]: true }));

        const selectedPortfolioName = portfolios.find(p => p.id === selectedPortfolio)?.name || 'Unknown';

        toast({
          title: "Success!",
          description: `Trading212 connected successfully to "${selectedPortfolioName}". Found ${data.data.holdingsCount} holdings with total value of $${data.data.totalValue.toLocaleString()}.`,
        });

        console.log('Trading212 connected successfully with real data:', data.data);
      } else {
        toast({
          title: "Coming Soon",
          description: `${brokerName} integration is coming soon.`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error(`Error connecting ${brokerName}:`, error);
      toast({
        title: "Connection Failed",
        description: error.message || `Failed to connect to ${brokerName}`,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(prev => ({ ...prev, [brokerName]: false }));
    }
  };

  const refreshBrokerData = async (brokerName: string) => {
    if (!selectedPortfolio) {
      toast({
        title: "No Portfolio Selected",
        description: "Please select a portfolio first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsRefreshing(prev => ({ ...prev, [brokerName]: true }));
      
      if (brokerName === 'Trading212') {
        console.log('Refreshing Trading212 data...');
        
        localStorage.removeItem('trading212_data');
        
        const { data, error } = await supabase.functions.invoke('trading212-sync', {
          body: { portfolioId: selectedPortfolio }
        });

        if (error) {
          console.error('Trading212 refresh error:', error);
          throw new Error(`Failed to refresh Trading212 data: ${error.message}`);
        }

        if (!data?.success) {
          console.error('Trading212 API error:', data?.error, data?.message);
          if (data?.error === 'RATE_LIMITED') {
            throw new Error('Trading212 API rate limit reached. Please try again in a few minutes.');
          }
          throw new Error(data?.message || 'Failed to refresh Trading212 data. Please check your API key.');
        }

        localStorage.setItem('trading212_data', JSON.stringify(data.data));

        toast({
          title: "Data Refreshed!",
          description: `Trading212 data updated successfully. Found ${data.data.holdingsCount} holdings with total value of $${data.data.totalValue.toLocaleString()}.`,
        });

        console.log('Trading212 data refreshed successfully:', data.data);
        window.location.reload();
      } else {
        toast({
          title: "Coming Soon",
          description: `${brokerName} refresh is coming soon.`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error(`Error refreshing ${brokerName}:`, error);
      toast({
        title: "Refresh Failed",
        description: error.message || `Failed to refresh ${brokerName} data`,
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(prev => ({ ...prev, [brokerName]: false }));
    }
  };

  const disconnectBroker = (brokerName: string) => {
    localStorage.removeItem(`${brokerName.toLowerCase()}_portfolio_id`);
    localStorage.removeItem(`${brokerName.toLowerCase()}_connected`);
    localStorage.removeItem(`${brokerName.toLowerCase()}_data`);
    setConnectedBrokers(prev => ({ ...prev, [brokerName]: false }));
    toast({
      title: "Disconnected",
      description: `${brokerName} account disconnected`,
    });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Broker Integrations</CardTitle>
            <CardDescription>First select a portfolio, then connect your broker accounts to sync real-time data.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">

            {/* Portfolio Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Select Portfolio</CardTitle>
                <CardDescription>Choose which portfolio to sync broker data to</CardDescription>
              </CardHeader>
              <CardContent>
                {portfolios.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No portfolios found. Please create a portfolio first in the Portfolio Management section.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <PortfolioSelector
                    portfolios={portfolios}
                    value={selectedPortfolio}
                    onValueChange={setSelectedPortfolio}
                    placeholder="Select a portfolio to sync data to"
                    label="Target Portfolio"
                  />
                )}
                {selectedPortfolio && (
                  <div className="mt-2 p-2 bg-green-50 rounded-md">
                    <p className="text-sm text-green-700">
                      ✓ Portfolio selected: {portfolios.find(p => p.id === selectedPortfolio)?.name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* API Key Management */}
            <ApiKeyManager />

            {/* Broker Connections */}
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Connect Brokers</CardTitle>
                <CardDescription>Connect your broker accounts to the selected portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedPortfolio && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please select a portfolio first before connecting brokers.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(brokerLogos).map(([brokerName, logo]) => (
                    <Card key={brokerName} className={!selectedPortfolio ? "opacity-50" : ""}>
                      <CardHeader>
                        <CardTitle>{brokerName}</CardTitle>
                        <CardDescription>Connect your {brokerName} account</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center justify-center space-y-4">
                        <img src={logo} alt={`${brokerName} Logo`} className="h-12 w-auto object-contain" />
                        {connectedBrokers[brokerName] ? (
                          <div className="flex flex-col items-center space-y-2 w-full">
                            <div className="text-sm text-green-600 font-medium">✓ Connected</div>
                            <div className="flex flex-col gap-2 w-full">
                              <Button 
                                onClick={() => refreshBrokerData(brokerName)} 
                                disabled={isRefreshing[brokerName] || !selectedPortfolio}
                                className="w-full"
                              >
                                {isRefreshing[brokerName] ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Refreshing...
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh Data
                                  </>
                                )}
                              </Button>
                              <Button variant="destructive" onClick={() => disconnectBroker(brokerName)}>
                                Disconnect {brokerName}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => syncRealDataToPortfolio(brokerName)} 
                            disabled={isConnecting[brokerName] || !selectedPortfolio}
                          >
                            {isConnecting[brokerName] ? `Connecting...` : `Connect ${brokerName}`}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

const BrokerIntegration = () => {
  return (
    <PortfolioProvider>
      <BrokerIntegrationContent />
    </PortfolioProvider>
  );
};

export default BrokerIntegration;
