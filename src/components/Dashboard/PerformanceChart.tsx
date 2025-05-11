
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const PerformanceChart = () => {
  const [timeRange, setTimeRange] = useState("1D");
  const [benchmark, setBenchmark] = useState("S&P 500");
  
  // Sample data - in a real app, this would come from an API
  const generateData = (range: string) => {
    // Generate different data based on the selected range
    const baseData = [
      { name: "Jan", portfolio: 4000, benchmark: 3800 },
      { name: "Feb", portfolio: 4200, benchmark: 4100 },
      { name: "Mar", portfolio: 5800, benchmark: 5500 },
      { name: "Apr", portfolio: 5200, benchmark: 5700 },
      { name: "May", portfolio: 6000, benchmark: 5900 },
      { name: "Jun", portfolio: 7800, benchmark: 7200 },
      { name: "Jul", portfolio: 8200, benchmark: 7800 },
      { name: "Aug", portfolio: 9000, benchmark: 8400 },
      { name: "Sep", portfolio: 8500, benchmark: 8000 },
      { name: "Oct", portfolio: 8700, benchmark: 8300 },
      { name: "Nov", portfolio: 9500, benchmark: 8800 },
      { name: "Dec", portfolio: 10000, benchmark: 9200 },
    ];
    
    // Truncate data based on time range
    switch(range) {
      case "1D": return baseData.slice(11);
      case "1W": return baseData.slice(10);
      case "1M": return baseData.slice(9);
      case "3M": return baseData.slice(6);
      case "1Y": return baseData;
      default: return baseData;
    }
  };
  
  const data = generateData(timeRange);

  // Chart configuration
  const chartConfig = {
    portfolio: {
      label: "Your Portfolio",
      color: "#4f46e5"
    },
    benchmark: {
      label: benchmark,
      color: "#94a3b8"
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="portfolio"
                  name="portfolio"
                  stroke={chartConfig.portfolio.color}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  name="benchmark"
                  stroke={chartConfig.benchmark.color}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {["1D", "1W", "1M", "3M", "1Y", "All"].map((range) => (
              <Button
                key={range}
                size="sm"
                variant="outline"
                className={cn(
                  "rounded-full",
                  timeRange === range ? "bg-finance-blue text-white" : ""
                )}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Compare:</span>
            <Select defaultValue={benchmark} onValueChange={setBenchmark}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select benchmark" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="S&P 500">S&P 500</SelectItem>
                <SelectItem value="Dow Jones">Dow Jones</SelectItem>
                <SelectItem value="NASDAQ">NASDAQ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
