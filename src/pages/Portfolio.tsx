
import DashboardLayout from "@/components/DashboardLayout";
import PortfolioManager from "@/components/Portfolio/PortfolioManager";
import WatchlistManager from "@/components/Portfolio/WatchlistManager";
import DividendManager from "@/components/Portfolio/DividendManager";
import Trading212CsvUpload from "@/components/Trading212CsvUpload";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CSVUpload } from "@/components/ui/csv-upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PortfolioProvider } from "@/contexts/PortfolioContext";

const Portfolio = () => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  console.log("Portfolio page - User:", user?.email);

  const handleCSVUpload = (data: any[]) => {
    setCsvData(data);
    toast({
      title: "CSV Data Loaded",
      description: `${data.length} items ready to import`,
    });
  };

  return (
    <PortfolioProvider>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Portfolio & Investment Management</h1>
            <p className="text-muted-foreground">Create and manage your investment portfolios, watchlists, and dividend tracking</p>
          </div>

          <Tabs defaultValue="portfolios" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
              <TabsTrigger value="dividends">Dividends</TabsTrigger>
              <TabsTrigger value="watchlists">Watchlists</TabsTrigger>
              <TabsTrigger value="brokerage">Brokerage Data</TabsTrigger>
              <TabsTrigger value="import">Import Data</TabsTrigger>
            </TabsList>

            <TabsContent value="portfolios">
              <PortfolioManager csvData={csvData} />
            </TabsContent>

            <TabsContent value="dividends">
              <DividendManager csvData={csvData} />
            </TabsContent>

            <TabsContent value="watchlists">
              <WatchlistManager />
            </TabsContent>

            <TabsContent value="brokerage">
              <Trading212CsvUpload />
            </TabsContent>

            <TabsContent value="import">
              <Card>
                <CardHeader>
                  <CardTitle>Import Data</CardTitle>
                  <CardDescription>
                    Upload a CSV file with your portfolio or dividend data. Expected columns: Symbol, Name, Shares, Price, Dividends, etc.
                  </CardDescription>
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
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </PortfolioProvider>
  );
};

export default Portfolio;
