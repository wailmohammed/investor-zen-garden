
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Portfolio {
  id: string;
  name: string;
  description?: string;
}

interface PortfolioSelectorProps {
  portfolios: Portfolio[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  includeNone?: boolean;
}

export const PortfolioSelector: React.FC<PortfolioSelectorProps> = ({
  portfolios,
  value,
  onValueChange,
  placeholder = "Select a portfolio",
  label,
  disabled = false,
  includeNone = false,
}) => {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {includeNone && (
            <SelectItem value="none">None</SelectItem>
          )}
          {portfolios.map((portfolio) => (
            <SelectItem key={portfolio.id} value={portfolio.id}>
              <div className="flex flex-col">
                <span>{portfolio.name}</span>
                {portfolio.description && (
                  <span className="text-xs text-muted-foreground">{portfolio.description}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
