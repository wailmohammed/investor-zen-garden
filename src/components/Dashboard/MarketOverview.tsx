
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

type MarketIndex = {
  symbol: string;
  name: string;
  price: string;
  change: {
    value: string;
    percentage: string;
    isPositive: boolean;
  };
};

// Mock data for indexes
const indexes: MarketIndex[] = [
  {
    symbol: "SPY",
    name: "S&P 500",
    price: "$535.92",
    change: {
      value: "+$1.35",
      percentage: "+0.25%",
      isPositive: true,
    },
  },
  {
    symbol: "QQQ",
    name: "Nasdaq 100",
    price: "$457.13",
    change: {
      value: "+$3.83",
      percentage: "+0.84%",
      isPositive: true,
    },
  },
  {
    symbol: "DIA",
    name: "Dow Jones",
    price: "$390.28",
    change: {
      value: "-$0.57",
      percentage: "-0.15%",
      isPositive: false,
    },
  },
  {
    symbol: "IWM",
    name: "Russell 2000",
    price: "$203.15",
    change: {
      value: "+$1.78",
      percentage: "+0.88%",
      isPositive: true,
    },
  },
];

const MarketOverview = () => {
  // In a real app, we would fetch this data from an API
  const { data = indexes, isLoading } = useQuery({
    queryKey: ['marketIndexes'],
    queryFn: async () => {
      // This is a placeholder for real API call
      // const { data, error } = await supabase.from('market_indexes').select('*');
      // if (error) throw error;
      // return data;
      return indexes;
    },
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Market Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.map((index) => (
            <div key={index.symbol} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <div className="text-sm text-gray-500">{index.name}</div>
              <div className="text-xl font-bold mt-1">{index.price}</div>
              <div className={`text-sm mt-1 flex items-center ${index.change.isPositive ? 'text-finance-green' : 'text-finance-red'}`}>
                {index.change.isPositive ? (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
                <span>{index.change.value} ({index.change.percentage})</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketOverview;
