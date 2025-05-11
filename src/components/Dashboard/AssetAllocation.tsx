
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from "recharts";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AssetAllocation = () => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [data, setData] = useState([
    { name: "Stocks", value: 65, color: "#4f46e5" },
    { name: "Bonds", value: 25, color: "#0d9488" },
    { name: "Cash", value: 10, color: "#16a34a" },
    { name: "Other", value: 5, color: "#38bdf8" },
  ]);
  const [viewType, setViewType] = useState<"allocation" | "performance">("allocation");

  const onPieEnter = useCallback(
    (_: any, index: number) => {
      setActiveIndex(index);
    },
    []
  );

  const onPieLeave = useCallback(() => {
    setActiveIndex(undefined);
  }, []);

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  
    return (
      <g>
        <text x={cx} y={cy - 15} dy={8} textAnchor="middle" fill="#333" fontSize={14}>
          {payload.name}
        </text>
        <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="#333" fontSize={16} fontWeight="bold">
          {value}%
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      </g>
    );
  };

  // Sample performance data (in a real app would come from an API)
  const performanceData = [
    { name: "Stocks", value: 11.2, color: "#4f46e5" },
    { name: "Bonds", value: 4.8, color: "#0d9488" },
    { name: "Cash", value: 0.3, color: "#16a34a" },
    { name: "Other", value: 7.5, color: "#38bdf8" },
  ];

  const toggleViewType = () => {
    if (viewType === "allocation") {
      setViewType("performance");
      setData(performanceData);
    } else {
      setViewType("allocation");
      setData([
        { name: "Stocks", value: 65, color: "#4f46e5" },
        { name: "Bonds", value: 25, color: "#0d9488" },
        { name: "Cash", value: 10, color: "#16a34a" },
        { name: "Other", value: 5, color: "#38bdf8" },
      ]);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle>Asset Allocation</CardTitle>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <span className="mr-1">View</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setViewType("allocation")}>
                Allocation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewType("performance")}>
                Performance
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8" 
            onClick={toggleViewType}
          >
            {viewType === "allocation" ? "Show Performance" : "Show Allocation"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                label={({ name, percent }) => 
                  activeIndex === undefined ? `${name} ${(percent * 100).toFixed(0)}%` : undefined
                }
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => 
                  viewType === "allocation" ? `${value}%` : `${value}% YTD`
                } 
              />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetAllocation;
