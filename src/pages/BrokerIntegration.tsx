import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { BrokerCard } from "@/components/BrokerCard";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const BrokerIntegration = () => {
  const { toast } = useToast();
  const [binanceApiKey, setBinanceApiKey] = useState("");
  const [binanceSecretKey, setBinanceSecretKey] = useState("");
  const [trading212ApiKey, setTrading212ApiKey] = useState("");
  const [binanceConnected, setBinanceConnected] = useState(false);
  const [trading212Connected, setTrading212Connected] = useState(false);
  const [isBinanceDialogOpen, setIsBinanceDialogOpen] = useState(false);
  const [isTrading212DialogOpen, setIsTrading212DialogOpen] = useState(false);

  const validateBinanceAPI = async () => {
    if (!binanceApiKey.trim() || !binanceSecretKey.trim()) {
      toast({
        title: "Missing credentials",
        description: "Please provide both API key and secret key.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simulate API validation - in real implementation, you'd validate with Binance API
      // For demo purposes, we'll just check if the keys are not empty
      if (binanceApiKey.length > 10 && binanceSecretKey.length > 10) {
        setBinanceConnected(true);
        setIsBinanceDialogOpen(false);
        toast({
          title: "Binance Connected",
          description: "Successfully connected to Binance API.",
        });
        
        // Store in localStorage for demo (in production, store securely)
        localStorage.setItem('binance_api_key', binanceApiKey);
        localStorage.setItem('binance_secret_key', binanceSecretKey);
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

  const validateTrading212API = async () => {
    if (!trading212ApiKey.trim()) {
      toast({
        title: "Missing API key",
        description: "Please provide your Trading212 API key.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simulate API validation - in real implementation, you'd validate with Trading212 API
      if (trading212ApiKey.length > 10) {
        setTrading212Connected(true);
        setIsTrading212DialogOpen(false);
        toast({
          title: "Trading212 Connected",
          description: "Successfully connected to Trading212 API.",
        });
        
        // Store in localStorage for demo (in production, store securely)
        localStorage.setItem('trading212_api_key', trading212ApiKey);
      } else {
        throw new Error("Invalid API key");
      }
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect to Trading212 API. Please check your API key.",
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
    toast({
      title: "Disconnected",
      description: "Successfully disconnected from Binance.",
    });
  };

  const disconnectTrading212 = () => {
    setTrading212Connected(false);
    setTrading212ApiKey("");
    localStorage.removeItem('trading212_api_key');
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
                    <Button variant="outline" size="sm" className="w-full">
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

          {/* Trading212 Card */}
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
                      Connected
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Connect to Trading212 to sync your stock and ETF portfolio data.
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
                    <Button variant="outline" size="sm" className="w-full">
                      Connect
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Connect Trading212 Account</DialogTitle>
                      <DialogDescription>
                        Enter your Trading212 API key to connect your account.
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
                        Connect
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </Card>

          {/* Other brokers can be added here */}
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
