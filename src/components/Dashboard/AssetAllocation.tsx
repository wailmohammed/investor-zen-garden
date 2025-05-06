
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AssetAllocation = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Asset Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
          <div className="text-center text-muted-foreground">
            <p>Asset Allocation Chart</p>
            <p className="text-sm">(Placeholder for a pie chart)</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-finance-blue mr-2"></div>
            <span className="text-sm">Stocks (65%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-finance-teal mr-2"></div>
            <span className="text-sm">Bonds (25%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-finance-green mr-2"></div>
            <span className="text-sm">Cash (10%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-finance-light-blue mr-2"></div>
            <span className="text-sm">Other (0%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetAllocation;
