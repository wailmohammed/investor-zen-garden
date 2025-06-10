
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "../StatCard";

const PortfolioSummary = () => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Portfolio Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          <StatCard 
            label="Total Value" 
            value="$254,872.65" 
            change={{ 
              value: "+$1,243.32", 
              percentage: "+0.49%", 
              isPositive: true 
            }} 
          />
          <StatCard 
            label="Today's Change" 
            value="$1,243.32" 
            change={{ 
              value: "+$1,243.32", 
              percentage: "+0.49%", 
              isPositive: true 
            }} 
          />
          <StatCard 
            label="Total Return" 
            value="$45,631.28" 
            change={{ 
              value: "+$45,631.28", 
              percentage: "+21.8%", 
              isPositive: true 
            }} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioSummary;
