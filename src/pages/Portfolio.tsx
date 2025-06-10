
import DashboardLayout from "@/components/DashboardLayout";
import PortfolioManager from "@/components/Portfolio/PortfolioManager";
import WatchlistManager from "@/components/Portfolio/WatchlistManager";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CSVUpload } from "@/components/ui/csv-upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Portfolio = () => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const { toast } = useToast();

  const handleCSVUpload = (data: any[]) => {
    setCsvData(data);
    toast({
      title: "CSV Data Loaded",
      description: `${data.length} portfolio items ready to import`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Portfolio & Watchlist Management</h1>
          <p className="text-muted-foreground">Create and manage your investment portfolios and watchlists</p>
        </div>

        <Tabs defaultValue="portfolios" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
            <TabsTrigger value="watchlists">Watchlists</TabsTrigger>
            <TabsTrigger value="import">Import Data</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolios">
            <PortfolioManager csvData={csvData} />
          </TabsContent>

          <TabsContent value="watchlists">
            <WatchlistManager />
          </TabsContent>

          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle>Import Portfolio Data</CardTitle>
                <CardDescription>
                  Upload a CSV file with your portfolio data. Expected columns: Symbol, Name, Shares, Price, etc.
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
  );
};

export default Portfolio;
