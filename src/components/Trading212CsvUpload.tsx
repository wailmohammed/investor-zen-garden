
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CSVUpload } from "@/components/ui/csv-upload";
import { useToast } from "@/hooks/use-toast";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";

interface Trading212CsvData {
  Action: string;
  Time: string;
  ISIN: string;
  Ticker: string;
  Name: string;
  "No. of shares": string;
  "Price / share": string;
  "Currency (Price / share)": string;
  "Exchange rate": string;
  Result: string;
  "Currency (Result)": string;
  Total: string;
  "Currency (Total)": string;
  "Withheld tax": string;
  "Currency (Withheld tax)": string;
  "Charge amount (GBP)": string;
  Notes: string;
  ID: string;
}

const Trading212CsvUpload = () => {
  const { toast } = useToast();
  const { selectedPortfolio } = usePortfolio();
  const [csvData, setCsvData] = useState<Trading212CsvData[]>([]);
  const [apiData, setApiData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<any>(null);

  const handleCsvUpload = (data: any[]) => {
    console.log('Trading212 CSV data uploaded:', data);
    setCsvData(data);
    
    // Process CSV data to extract current holdings
    const holdings = processCsvToHoldings(data);
    console.log('Processed CSV holdings:', holdings);
    
    toast({
      title: "CSV Data Uploaded",
      description: `Processed ${data.length} transactions into ${holdings.length} holdings`,
    });
  };

  const processCsvToHoldings = (transactions: Trading212CsvData[]) => {
    const holdingsMap = new Map();
    
    transactions.forEach(transaction => {
      const ticker = transaction.Ticker;
      const action = transaction.Action;
      const shares = parseFloat(transaction["No. of shares"] || "0");
      const price = parseFloat(transaction["Price / share"] || "0");
      
      if (ticker && (action === "Market buy" || action === "Market sell")) {
        if (!holdingsMap.has(ticker)) {
          holdingsMap.set(ticker, {
            symbol: ticker,
            name: transaction.Name,
            quantity: 0,
            totalCost: 0,
            transactions: []
          });
        }
        
        const holding = holdingsMap.get(ticker);
        if (action === "Market buy") {
          holding.quantity += shares;
          holding.totalCost += shares * price;
        } else if (action === "Market sell") {
          holding.quantity -= shares;
          holding.totalCost -= shares * price;
        }
        
        holding.transactions.push(transaction);
        holding.averagePrice = holding.quantity > 0 ? holding.totalCost / holding.quantity : 0;
      }
    });
    
    // Filter out positions with zero quantity
    return Array.from(holdingsMap.values()).filter(holding => holding.quantity > 0);
  };

  const fetchApiData = async () => {
    if (!selectedPortfolio) {
      toast({
        title: "No Portfolio Selected",
        description: "Please select a portfolio first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      console.log('Fetching Trading212 API data...');
      
      const { data, error } = await supabase.functions.invoke('trading212-sync', {
        body: { portfolioId: selectedPortfolio }
      });

      if (error) {
        console.error('API fetch error:', error);
        throw error;
      }

      if (!data?.success) {
        console.error('API error:', data?.error);
        throw new Error(data?.message || 'Failed to fetch API data');
      }

      console.log('Trading212 API data:', data.data);
      setApiData(data.data);
      
      toast({
        title: "API Data Fetched",
        description: `Found ${data.data.positions?.length || 0} positions from Trading212 API`,
      });
    } catch (error: any) {
      console.error('Error fetching API data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch API data",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const compareData = () => {
    if (!csvData.length || !apiData?.positions) {
      toast({
        title: "Missing Data",
        description: "Please upload CSV data and fetch API data first",
        variant: "destructive",
      });
      return;
    }

    const csvHoldings = processCsvToHoldings(csvData);
    const apiPositions = apiData.positions;
    
    console.log('Comparing CSV holdings:', csvHoldings);
    console.log('Comparing API positions:', apiPositions);
    
    const comparison = {
      csvTotal: csvHoldings.length,
      apiTotal: apiPositions.length,
      matches: [],
      csvOnly: [],
      apiOnly: [],
      differences: []
    };
    
    // Find matches and differences
    csvHoldings.forEach(csvHolding => {
      const apiPosition = apiPositions.find((pos: any) => pos.symbol === csvHolding.symbol);
      
      if (apiPosition) {
        const quantityDiff = Math.abs(csvHolding.quantity - apiPosition.quantity);
        const priceDiff = Math.abs(csvHolding.averagePrice - apiPosition.averagePrice);
        
        comparison.matches.push({
          symbol: csvHolding.symbol,
          csvQuantity: csvHolding.quantity,
          apiQuantity: apiPosition.quantity,
          csvAvgPrice: csvHolding.averagePrice,
          apiAvgPrice: apiPosition.averagePrice,
          quantityDiff,
          priceDiff
        });
        
        if (quantityDiff > 0.001 || priceDiff > 0.01) {
          comparison.differences.push({
            symbol: csvHolding.symbol,
            issue: quantityDiff > 0.001 ? 'Quantity mismatch' : 'Price mismatch',
            csvValue: quantityDiff > 0.001 ? csvHolding.quantity : csvHolding.averagePrice,
            apiValue: quantityDiff > 0.001 ? apiPosition.quantity : apiPosition.averagePrice
          });
        }
      } else {
        comparison.csvOnly.push(csvHolding);
      }
    });
    
    // Find API-only positions
    apiPositions.forEach((apiPosition: any) => {
      const csvHolding = csvHoldings.find(holding => holding.symbol === apiPosition.symbol);
      if (!csvHolding) {
        comparison.apiOnly.push(apiPosition);
      }
    });
    
    setComparisonResult(comparison);
    console.log('Comparison result:', comparison);
    
    toast({
      title: "Data Comparison Complete",
      description: `Found ${comparison.matches.length} matches, ${comparison.differences.length} differences`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Trading212 CSV Upload & Comparison</CardTitle>
          <CardDescription>
            Upload your Trading212 CSV export and compare it with live API data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">1. Upload CSV Data</h4>
            <CSVUpload onFileUpload={handleCsvUpload} />
            {csvData.length > 0 && (
              <div className="mt-2 text-sm text-green-600">
                ✓ CSV uploaded: {csvData.length} transactions processed
              </div>
            )}
          </div>
          
          <div>
            <h4 className="font-medium mb-2">2. Fetch API Data</h4>
            <Button 
              onClick={fetchApiData} 
              disabled={isProcessing || !selectedPortfolio}
              className="w-full"
            >
              {isProcessing ? "Fetching..." : "Fetch Live API Data"}
            </Button>
            {apiData && (
              <div className="mt-2 text-sm text-green-600">
                ✓ API data fetched: {apiData.positions?.length || 0} positions
              </div>
            )}
          </div>
          
          <div>
            <h4 className="font-medium mb-2">3. Compare Data</h4>
            <Button 
              onClick={compareData} 
              disabled={!csvData.length || !apiData}
              variant="outline"
              className="w-full"
            >
              Compare CSV vs API Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {comparisonResult && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-600">{comparisonResult.csvTotal}</div>
                  <div className="text-sm text-blue-600">CSV Holdings</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">{comparisonResult.apiTotal}</div>
                  <div className="text-sm text-green-600">API Positions</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-100 rounded">
                  <div className="font-bold text-green-700">{comparisonResult.matches.length}</div>
                  <div className="text-xs text-green-700">Matches</div>
                </div>
                <div className="text-center p-3 bg-yellow-100 rounded">
                  <div className="font-bold text-yellow-700">{comparisonResult.differences.length}</div>
                  <div className="text-xs text-yellow-700">Differences</div>
                </div>
                <div className="text-center p-3 bg-red-100 rounded">
                  <div className="font-bold text-red-700">{comparisonResult.csvOnly.length + comparisonResult.apiOnly.length}</div>
                  <div className="text-xs text-red-700">Mismatches</div>
                </div>
              </div>
              
              {comparisonResult.differences.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Differences Found:</h5>
                  <div className="space-y-2">
                    {comparisonResult.differences.map((diff: any, index: number) => (
                      <div key={index} className="p-2 bg-yellow-50 rounded text-sm">
                        <strong>{diff.symbol}</strong>: {diff.issue} 
                        (CSV: {diff.csvValue}, API: {diff.apiValue})
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {comparisonResult.csvOnly.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Only in CSV:</h5>
                  <div className="text-sm text-gray-600">
                    {comparisonResult.csvOnly.map((holding: any) => holding.symbol).join(', ')}
                  </div>
                </div>
              )}
              
              {comparisonResult.apiOnly.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Only in API:</h5>
                  <div className="text-sm text-gray-600">
                    {comparisonResult.apiOnly.map((position: any) => position.symbol).join(', ')}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Trading212CsvUpload;
