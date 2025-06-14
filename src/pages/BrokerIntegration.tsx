
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
    try {
      setIsConnecting(prev => ({ ...prev, [brokerName]: true }));
      
      let portfolioData;
      
      if (brokerName === 'Trading212') {
        console.log('Syncing real Trading212 data...');
        
        // Call the Trading212 sync function to get real data
        const { data, error } = await supabase.functions.invoke('trading212-sync', {
          body: { portfolioId: selectedPortfolio }
        });

        if (error) {
          throw new Error(`Failed to fetch Trading212 data: ${error.message}`);
        }

        if (!data?.success) {
          throw new Error('Failed to get successful response from Trading212 API');
        }

        portfolioData = data.data;
        console.log('Real Trading212 data received:', portfolioData);
      } else {
        // For other brokers, use mock data for now
        portfolioData = {
          totalValue: brokerName === 'Binance' ? 29000 : 15000,
          positions: brokerName === 'Binance' ? 3 : 5,
          performance: brokerName === 'Binance' ? 4.5 : 2.1
        };
      }

      // Store the connection in localStorage
      localStorage.setItem(`${brokerName.toLowerCase()}_portfolio_id`, selectedPortfolio);
      localStorage.setItem(`${brokerName.toLowerCase()}_connected`, 'true');
      localStorage.setItem(`${brokerName.toLowerCase()}_data`, JSON.stringify(portfolioData));

      setConnectedBrokers(prev => ({ ...prev, [brokerName]: true }));

      toast({
        title: "Success!",
        description: `${brokerName} account connected successfully`,
      });

      console.log(`${brokerName} connected with real data:`, portfolioData);
    } catch (error) {
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
                      <Button variant="destructive" onClick={() => disconnectBroker(brokerName)}>
                        Disconnect {brokerName}
                      </Button>
                    ) : (
                      <Button onClick={() => syncRealDataToPortfolio(brokerName)} disabled={isConnecting[brokerName]}>
                        {isConnecting[brokerName] ? `Connecting...` : `Connect ${brokerName}`}
                      </Button>
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
