
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";
import ApiKeyManager from "@/components/ApiKeyManager";

const brokerLogos = {
  Trading212: '/trading212_logo.png',
  Binance: '/binance_logo.png',
};

const BrokerIntegration = () => {
  const { toast } = useToast();
  const { selectedPortfolio } = usePortfolio();
  const [isConnecting, setIsConnecting] = useState<{ [key: string]: boolean }>({
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
        description: "Please select a portfolio first from the dashboard.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsConnecting(prev => ({ ...prev, [brokerName]: true }));
      
      if (brokerName === 'Trading212') {
        console.log('Testing Trading212 connection...');
        
        // Call the Trading212 sync function to test the connection
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

        // Store the successful connection
        localStorage.setItem('trading212_portfolio_id', selectedPortfolio);
        localStorage.setItem('trading212_connected', 'true');
        localStorage.setItem('trading212_data', JSON.stringify(data.data));

        setConnectedBrokers(prev => ({ ...prev, [brokerName]: true }));

        toast({
          title: "Success!",
          description: `Trading212 connected successfully. Found ${data.data.holdingsCount} holdings with total value of $${data.data.totalValue.toLocaleString()}.`,
        });

        console.log('Trading212 connected successfully with real data:', data.data);
      } else {
        // For other brokers, show not implemented message
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
            <CardDescription>Connect your broker accounts to sync real-time data to your portfolios.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">

            <ApiKeyManager />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(brokerLogos).map(([brokerName, logo]) => (
                <Card key={brokerName}>
                  <CardHeader>
                    <CardTitle>{brokerName}</CardTitle>
                    <CardDescription>Connect your {brokerName} account</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center space-y-4">
                    <img src={logo} alt={`${brokerName} Logo`} className="h-12 w-auto object-contain" />
                    {connectedBrokers[brokerName] ? (
                      <div className="flex flex-col items-center space-y-2">
                        <div className="text-sm text-green-600 font-medium">✓ Connected</div>
                        <Button variant="destructive" onClick={() => disconnectBroker(brokerName)}>
                          Disconnect {brokerName}
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => syncRealDataToPortfolio(brokerName)} 
                        disabled={isConnecting[brokerName] || !selectedPortfolio}
                      >
                        {isConnecting[brokerName] ? `Connecting...` : `Connect ${brokerName}`}
                      </Button>
                    )}
                    {!selectedPortfolio && (
                      <p className="text-sm text-muted-foreground text-center">
                        Please select a portfolio from the dashboard first
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BrokerIntegration;
