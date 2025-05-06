
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  change?: {
    value: string;
    percentage: string;
    isPositive: boolean;
  };
  className?: string;
  icon?: React.ReactNode;
};

const StatCard = ({ label, value, change, className, icon }: StatCardProps) => {
  return (
    <div className={cn("bg-white rounded-xl shadow-sm p-5 flex flex-col border border-gray-100", className)}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-500">{label}</div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="text-2xl font-bold mt-2">{value}</div>
      {change && (
        <div className={cn(
          "text-sm font-medium flex items-center mt-1", 
          change.isPositive ? "text-finance-green" : "text-finance-red")
        }>
          {change.isPositive ? (
            <ArrowUp className="w-4 h-4 mr-1" />
          ) : (
            <ArrowDown className="w-4 h-4 mr-1" />
          )}
          <span>
            {change.value} ({change.percentage})
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
