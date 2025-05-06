
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PerformanceChart = () => {
  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle>Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
          <div className="text-center text-muted-foreground">
            <p>Performance Chart</p>
            <p className="text-sm">(Placeholder for a chart component)</p>
          </div>
        </div>
        <div className="mt-4 flex justify-between">
          <div className="flex space-x-4">
            <button className="px-3 py-1 rounded-full bg-finance-blue text-white text-sm">1D</button>
            <button className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">1W</button>
            <button className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">1M</button>
            <button className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">3M</button>
            <button className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">1Y</button>
            <button className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">All</button>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Compare:</span>
            <select className="text-sm border rounded px-2 py-1">
              <option>S&P 500</option>
              <option>Dow Jones</option>
              <option>NASDAQ</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
