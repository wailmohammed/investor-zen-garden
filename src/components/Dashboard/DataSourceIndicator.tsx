
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DataSourceIndicatorProps {
  isConnected: boolean;
  dataSource: 'Trading212' | 'CSV' | 'Mock';
  lastUpdated?: string;
  recordCount?: number;
}

const DataSourceIndicator = ({ isConnected, dataSource, lastUpdated, recordCount }: DataSourceIndicatorProps) => {
  const getStatusColor = () => {
    if (dataSource === 'Trading212' && isConnected) return 'bg-green-500';
    if (dataSource === 'CSV') return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (dataSource === 'Trading212' && isConnected) return 'Live Data';
    if (dataSource === 'CSV') return 'CSV Data';
    return 'Demo Data';
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
            Source: {dataSource}
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
