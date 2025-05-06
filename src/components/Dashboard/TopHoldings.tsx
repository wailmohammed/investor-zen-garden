
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StockCard from "../StockCard";

const holdings = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: "$187.53",
    change: {
      value: "+$1.25",
      percentage: "+0.67%",
      isPositive: true,
    },
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: "$404.87",
    change: {
      value: "+$2.14",
      percentage: "+0.53%",
      isPositive: true,
    },
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: "$176.53",
    change: {
      value: "+$0.78",
      percentage: "+0.44%",
      isPositive: true,
    },
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: "$864.13",
    change: {
      value: "-$12.37",
      percentage: "-1.41%",
      isPositive: false,
    },
  },
];

const TopHoldings = () => {
  return (
    <Card className="col-span-3">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle>Top Holdings</CardTitle>
        <button className="text-sm text-finance-blue hover:underline">
          View All
        </button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {holdings.map((holding) => (
            <StockCard key={holding.symbol} {...holding} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopHoldings;
