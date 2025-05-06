
import { ArrowDown, ArrowUp } from "lucide-react";

type StockCardProps = {
  symbol: string;
  name: string;
  price: string;
  change: {
    value: string;
    percentage: string;
    isPositive: boolean;
  };
  logo?: string;
};

const StockCard = ({ symbol, name, price, change, logo }: StockCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {logo ? (
            <img src={logo} alt={`${name} logo`} className="w-8 h-8 mr-3" />
          ) : (
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
              <span className="font-bold text-gray-500">{symbol[0]}</span>
            </div>
          )}
          <div>
            <h3 className="font-semibold">{symbol}</h3>
            <p className="text-sm text-gray-500">{name}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-lg">{price}</div>
          <div className={`flex items-center justify-end ${change.isPositive ? 'text-finance-green' : 'text-finance-red'}`}>
            {change.isPositive ? (
              <ArrowUp className="w-3.5 h-3.5 mr-1" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 mr-1" />
            )}
            <span className="text-sm">
              {change.value} ({change.percentage})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockCard;
