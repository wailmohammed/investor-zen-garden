
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, TrendingUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type StockCardProps = {
  symbol: string;
  name: string;
  price: string;
  change: {
    value: string;
    percentage: string;
    isPositive: boolean;
  };
  shares?: number;
  totalValue?: string;
  onClick?: () => void;
  onBuy?: () => void;
  onSell?: () => void;
};

const StockCard = ({ 
  symbol, 
  name, 
  price, 
  change, 
  shares,
  totalValue,
  onClick,
  onBuy,
  onSell
}: StockCardProps) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex justify-between items-center p-4 border rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors",
        onClick ? "cursor-pointer" : ""
      )}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md text-finance-blue font-bold">
          {symbol.substring(0, 2)}
        </div>
        <div>
          <div className="font-medium">{symbol}</div>
          <div className="text-sm text-gray-500">{name}</div>
        </div>
      </div>
      
      {shares !== undefined && (
        <div className="hidden md:block text-right">
          <div className="font-medium">{shares} shares</div>
          <div className="text-sm text-gray-500">{totalValue}</div>
        </div>
      )}
      
      <div className="text-right">
        <div className="font-semibold">{price}</div>
        <div className={cn("flex items-center justify-end text-sm", 
          change.isPositive ? "text-finance-green" : "text-finance-red"
        )}>
          {change.isPositive ? (
            <ArrowUp className="w-3.5 h-3.5 mr-1" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5 mr-1" />
          )}
          <span>
            {change.value} ({change.percentage})
          </span>
        </div>
      </div>
      
      {onBuy && onSell && (
        <div className="ml-4 space-x-1 flex">
          <Button size="sm" variant="outline" onClick={(e) => {
            e.stopPropagation();
            onBuy();
          }}>Buy</Button>
          <Button size="sm" variant="outline" onClick={(e) => {
            e.stopPropagation();
            onSell();
          }}>Sell</Button>
        </div>
      )}
    </div>
  );
};

export default StockCard;
