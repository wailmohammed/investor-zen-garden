
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const activities = [
  {
    type: "Buy",
    symbol: "AAPL",
    shares: "5",
    price: "$187.53",
    total: "$937.65",
    date: "2025-05-06",
  },
  {
    type: "Dividend",
    symbol: "JNJ",
    shares: "",
    price: "",
    total: "$24.75",
    date: "2025-05-05",
  },
  {
    type: "Sell",
    symbol: "TSLA",
    shares: "2",
    price: "$182.12",
    total: "$364.24",
    date: "2025-05-04",
  },
];

const RecentActivity = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex justify-between items-center p-3 border-b last:border-0">
              <div>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    activity.type === "Buy" 
                      ? "bg-finance-green" 
                      : activity.type === "Sell" 
                        ? "bg-finance-red" 
                        : "bg-finance-blue"
                  }`}></div>
                  <span className="font-medium">{activity.symbol}</span>
                </div>
                <div className="text-sm text-gray-500">{activity.type} {activity.shares && `${activity.shares} shares`}</div>
              </div>
              <div className="text-right">
                <div>{activity.total}</div>
                <div className="text-sm text-gray-500">{new Date(activity.date).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <button className="text-sm text-finance-blue hover:underline">
            View All Activity
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
