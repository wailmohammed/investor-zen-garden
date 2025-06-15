
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePortfolio } from "@/contexts/PortfolioContext";

interface DataSourceIndicatorProps {
  isConnected: boolean;
  dataSource: 'Trading212' | 'CSV' | 'Mock' | 'CoinGecko' | 'Binance';
  lastUpdated?: string;
  recordCount?: number;
}

const DataSourceIndicator = ({ isConnected, dataSource, lastUpdated, recordCount }: DataSourceIndicatorProps) => {
  const { selectedPortfolio, portfolios } = usePortfolio();
  
  // Get current portfolio type
  const currentPortfolio = portfolios.find(p => p.id === selectedPortfolio);
  const portfolioType = currentPortfolio?.portfolio_type || 'stock';
  
  // Check broker connections
  const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
  const binancePortfolioId = localStorage.getItem('binance_portfolio_id');
  const isTrading212Connected = selectedPortfolio === trading212PortfolioId;
  const isBinanceConnected = selectedPortfolio === binancePortfolioId;

  const getStatusColor = () => {
    if (isTrading212Connected) return 'bg-green-500';
    if (isBinanceConnected) return 'bg-orange-500';
    if (portfolioType === 'crypto') return 'bg-green-500';
    if (dataSource === 'CSV') return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (isTrading212Connected) return 'Live Data';
    if (isBinanceConnected) return 'Live Binance Data';
    if (portfolioType === 'crypto') return 'Live Crypto Data';
    if (dataSource === 'CSV') return 'CSV Data';
    return 'Demo Data';
  };

  const getDataSourceText = () => {
    if (isTrading212Connected) return 'Trading212';
    if (isBinanceConnected) return 'Binance API';
    if (portfolioType === 'crypto') return 'CoinGecko API';
    return dataSource;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Data Source</CardTitle>
          <Badge className={`${getStatusColor()} text-white`}>
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Source: {getDataSourceText()}
          </p>
          {recordCount && (
            <p className="text-sm text-muted-foreground">
              Records: {recordCount}
            </p>
          )}
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DataSourceIndicator;
