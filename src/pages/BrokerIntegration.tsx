
import React from "react";
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

const brokers = [
  {
    id: "trading212",
    name: "Trading 212",
    description: "Connect to your Trading 212 account",
    logo: "/trading212-logo.svg",
    status: "not_connected",
  },
  {
    id: "binance",
    name: "Binance",
    description: "Connect to your Binance account",
    logo: "/binance-logo.svg",
    status: "not_connected",
  },
  {
    id: "etoro",
    name: "eToro",
    description: "Connect to your eToro account",
    logo: "/etoro-logo.svg",
    status: "not_connected",
  },
  {
    id: "interactive_brokers",
    name: "Interactive Brokers",
    description: "Connect to your Interactive Brokers account",
    logo: "/interactive-brokers-logo.svg",
    status: "not_connected",
  }
];

type ApiFormValues = {
  apiKey: string;
  apiSecret: string;
};

const BrokerIntegration = () => {
  const form = useForm<ApiFormValues>({
    defaultValues: {
      apiKey: "",
      apiSecret: "",
    },
  });

  const onSubmit = (values: ApiFormValues) => {
    console.log(values);
    toast.success("API credentials saved. Connecting to broker...");
    // In a real app, this would connect to the broker API
  };

  const handleFileUpload = (file: File) => {
    // In a real app, this would process the CSV file
    console.log("Processing file:", file.name);
    toast.success(`CSV file "${file.name}" processed successfully`);
  };

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
                />
              ))}
            </div>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>
                  Enter your API credentials for your selected broker
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
                          <FormLabel>API Key</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your API key" {...field} />
                          </FormControl>
                          <FormDescription>
                            You can find this in your broker's API settings
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit">Connect</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="csv">
            <Card>
              <CardHeader>
                <CardTitle>Import Portfolio Data</CardTitle>
                <CardDescription>
                  Upload a CSV file with your portfolio data
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
