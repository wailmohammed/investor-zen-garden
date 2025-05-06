
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
};

const StatCard = ({ label, value, change, className }: StatCardProps) => {
  return (
    <div className={cn("stat-card", className)}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {change && (
        <div className={cn("stat-change", change.isPositive ? "positive" : "negative")}>
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
