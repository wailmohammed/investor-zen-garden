
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileUpload } from "@/components/FileUpload";
import { BrokerCard } from "@/components/BrokerCard";

type BrokerStatus = "not_connected" | "connected" | "error";

interface Broker {
  id: string;
  name: string;
  description: string;
  logo: string;
  status: BrokerStatus;
  apiKeyLabel?: string;
  apiKeyPlaceholder?: string;
}

type ApiFormValues = {
  apiKey: string;
  apiSecret?: string;
};

const BrokerIntegration = () => {
  const [brokers, setBrokers] = useState<Broker[]>([
    {
      id: "trading212",
      name: "Trading 212",
      description: "Connect to your Trading 212 account",
      logo: "/trading212-logo.svg",
      status: "not_connected",
      apiKeyLabel: "API Key",
      apiKeyPlaceholder: "Enter your Trading 212 API key (e.g., 23133911ZdtQFaMJJAFxzcvWszstEmEAtfvTF)"
    },
    {
      id: "binance",
      name: "Binance",
      description: "Connect to your Binance account",
      logo: "/binance-logo.svg",
      status: "not_connected",
      apiKeyLabel: "API Key",
      apiKeyPlaceholder: "Enter your Binance API key"
    },
    {
      id: "etoro",
      name: "eToro",
      description: "Connect to your eToro account",
      logo: "/etoro-logo.svg",
      status: "not_connected",
      apiKeyLabel: "Username",
      apiKeyPlaceholder: "Enter your eToro username"
    },
    {
      id: "interactive_brokers",
      name: "Interactive Brokers",
      description: "Connect to your Interactive Brokers account",
      logo: "/interactive-brokers-logo.svg",
      status: "not_connected",
      apiKeyLabel: "Username",
      apiKeyPlaceholder: "Enter your IB username"
    }
  ]);

  const [selectedBroker, setSelectedBroker] = useState<string>("");

  const form = useForm<ApiFormValues>({
    defaultValues: {
      apiKey: "",
      apiSecret: "",
    },
  });

  const onSubmit = async (values: ApiFormValues) => {
    if (!selectedBroker) {
      toast.error("Please select a broker first");
      return;
    }

    console.log("Connecting to broker:", selectedBroker, "with credentials:", values);
    
    // Simulate API connection
    try {
      // Show loading state
      toast.loading("Connecting to broker...");
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update broker status
      setBrokers(prev => 
        prev.map(broker => 
          broker.id === selectedBroker 
            ? { ...broker, status: "connected" as BrokerStatus }
            : broker
        )
      );
      
      toast.success(`Successfully connected to ${brokers.find(b => b.id === selectedBroker)?.name}!`);
      
      // Clear form
      form.reset();
      setSelectedBroker("");
      
    } catch (error) {
      setBrokers(prev => 
        prev.map(broker => 
          broker.id === selectedBroker 
            ? { ...broker, status: "error" as BrokerStatus }
            : broker
        )
      );
      toast.error("Failed to connect to broker. Please check your credentials.");
    }
  };

  const handleFileUpload = (file: File) => {
    console.log("Processing file:", file.name);
    toast.success(`CSV file "${file.name}" processed successfully. Portfolio data imported!`);
    
    // Simulate updating broker status after file upload
    setTimeout(() => {
      toast.success("Holdings imported successfully! Check your dividend tracker for updated data.");
    }, 1500);
  };

  const handleBrokerConnect = (brokerId: string) => {
    setSelectedBroker(brokerId);
    toast.info(`Please enter your ${brokers.find(b => b.id === brokerId)?.name} credentials below`);
  };

  const handleBrokerDisconnect = (brokerId: string) => {
    setBrokers(prev => 
      prev.map(broker => 
        broker.id === brokerId 
          ? { ...broker, status: "not_connected" as BrokerStatus }
          : broker
      )
    );
  };

  const selectedBrokerData = brokers.find(b => b.id === selectedBroker);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Data Integration</h1>
          <p className="text-muted-foreground">
            Connect to your brokers or import data from CSV files
          </p>
        </div>

        <Tabs defaultValue="brokers" className="w-full">
          <TabsList>
            <TabsTrigger value="brokers">Broker APIs</TabsTrigger>
            <TabsTrigger value="csv">CSV Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="brokers" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect to your brokerage accounts to automatically sync your portfolio data.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {brokers.map((broker) => (
                <BrokerCard 
                  key={broker.id} 
                  name={broker.name} 
                  description={broker.description} 
                  logo={broker.logo} 
                  status={broker.status}
                  onConnect={() => handleBrokerConnect(broker.id)}
                  onDisconnect={() => handleBrokerDisconnect(broker.id)}
                />
              ))}
            </div>
            
            {selectedBroker && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Connect to {selectedBrokerData?.name}</CardTitle>
                  <CardDescription>
                    Enter your {selectedBrokerData?.name} credentials to connect your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{selectedBrokerData?.apiKeyLabel || "API Key"}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={selectedBrokerData?.apiKeyPlaceholder || "Enter your credentials"} 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              {selectedBroker === 'trading212' && (
                                <>You can find your API key in Trading 212 under Settings → API</>
                              )}
                              {selectedBroker === 'binance' && (
                                <>You can find this in your Binance account under API Management</>
                              )}
                              {selectedBroker === 'etoro' && (
                                <>Your eToro username for account connection</>
                              )}
                              {selectedBroker === 'interactive_brokers' && (
                                <>Your Interactive Brokers username</>
                              )}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {(selectedBroker === 'binance' || selectedBroker === 'trading212') && (
                        <FormField
                          control={form.control}
                          name="apiSecret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Secret</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Enter your API secret" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Keep this secret safe - it provides access to your account
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <div className="flex gap-2">
                        <Button type="submit">Connect to {selectedBrokerData?.name}</Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setSelectedBroker("");
                            form.reset();
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="csv">
            <Card>
              <CardHeader>
                <CardTitle>Import Portfolio Data</CardTitle>
                <CardDescription>
                  Upload a CSV file with your portfolio data to see holdings in the Dividend Tracker
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload a CSV file with your transactions or holdings. The file should include columns for symbol, shares, purchase price, and date.
                </p>
                
                <FileUpload 
                  accept=".csv" 
                  onFileUpload={handleFileUpload} 
                  description="Drag and drop a CSV file here, or click to select a file" 
                />
                
                <div className="text-sm text-muted-foreground mt-4">
                  <h4 className="font-medium mb-2">Supported CSV formats:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Trading 212 exports</li>
                    <li>Binance transaction history</li>
                    <li>Interactive Brokers activity reports</li>
                    <li>Standard format (Symbol, Shares, Price, Date)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default BrokerIntegration;
