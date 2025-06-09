import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Minus, Info } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type FeatureRowProps = {
  title: string;
  free: React.ReactNode;
  premium: React.ReactNode;
  professional: React.ReactNode;
};

const FeatureRow = ({ title, free, premium, professional }: FeatureRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{title}</TableCell>
      <TableCell className="text-center">{free}</TableCell>
      <TableCell className="text-center">{premium}</TableCell>
      <TableCell className="text-center">{professional}</TableCell>
    </TableRow>
  );
};

const PricingComparison = () => {
  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Features</TableHead>
            <TableHead className="text-center">Free</TableHead>
            <TableHead className="text-center">Premium</TableHead>
            <TableHead className="text-center">Professional</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="bg-muted/50">
            <TableCell colSpan={4} className="font-semibold">Portfolio Management</TableCell>
          </TableRow>
          
          <FeatureRow 
            title="Number of portfolios" 
            free="1" 
            premium="10" 
            professional="Unlimited" 
          />
          
          <FeatureRow 
            title="Holdings limit" 
            free="10" 
            premium="Unlimited" 
            professional="Unlimited" 
          />
          
          <FeatureRow 
            title="Watchlists limit" 
            free="1" 
            premium="10" 
            professional="20" 
          />
          
          <FeatureRow 
            title="Link your brokerage" 
            free={<Minus className="mx-auto" />} 
            premium={<Check className="mx-auto text-finance-green" />} 
            professional={<Check className="mx-auto text-finance-green" />} 
          />
          
          <FeatureRow 
            title="Import brokers' reports" 
            free={<Check className="mx-auto text-finance-green" />} 
            premium={<Check className="mx-auto text-finance-green" />} 
            professional={<Check className="mx-auto text-finance-green" />} 
          />
          
          <TableRow className="bg-muted/50">
            <TableCell colSpan={4} className="font-semibold">Asset Tracking</TableCell>
          </TableRow>
          
          <FeatureRow 
            title="Stocks, ETFs, Funds" 
            free={<Check className="mx-auto text-finance-green" />} 
            premium={<Check className="mx-auto text-finance-green" />} 
            professional={<Check className="mx-auto text-finance-green" />} 
          />
          
          <FeatureRow 
            title="Supported exchanges" 
            free="10+" 
            premium="20+" 
            professional="30+" 
          />
          
          <FeatureRow 
            title="Custom assets (deposits, real estate)" 
            free="1" 
            premium="5" 
            professional="Unlimited" 
          />
          
          <TableRow className="bg-muted/50">
            <TableCell colSpan={4} className="font-semibold">Dividend Tracking</TableCell>
          </TableRow>
          
          <FeatureRow 
            title="Automatic dividend tracking" 
            free={<Check className="mx-auto text-finance-green" />} 
            premium={<Check className="mx-auto text-finance-green" />} 
            professional={<Check className="mx-auto text-finance-green" />} 
          />
          
          <FeatureRow 
            title="Dividend calendar" 
            free={<Check className="mx-auto text-finance-green" />} 
            premium={<Check className="mx-auto text-finance-green" />} 
            professional={<Check className="mx-auto text-finance-green" />} 
          />
          
          <FeatureRow 
            title="Dividend rating" 
            free={<Minus className="mx-auto" />} 
            premium={<Check className="mx-auto text-finance-green" />} 
            professional={<Check className="mx-auto text-finance-green" />} 
          />
          
          <FeatureRow 
            title="Top dividend stocks" 
            free={
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center mx-auto">
                    <span className="mr-1">5 stocks</span>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px]">Limited to basic filters only</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            } 
            premium={
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center mx-auto">
                    <span className="mr-1">20 stocks</span>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px]">Includes 5 advanced filters</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            }
            professional={
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center mx-auto">
                    <span className="mr-1">50 stocks</span>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px]">All advanced filters included</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            }
          />
          
          <TableRow className="bg-muted/50">
            <TableCell colSpan={4} className="font-semibold">Analytics & Insights</TableCell>
          </TableRow>
          
          <FeatureRow 
            title="Portfolio performance tracking" 
            free={<Check className="mx-auto text-finance-green" />} 
            premium={<Check className="mx-auto text-finance-green" />} 
            professional={<Check className="mx-auto text-finance-green" />} 
          />
          
          <FeatureRow 
            title="Diversity by sectors, regions, etc." 
            free={<Check className="mx-auto text-finance-green" />} 
            premium={<Check className="mx-auto text-finance-green" />} 
            professional={<Check className="mx-auto text-finance-green" />} 
          />
          
          <FeatureRow 
            title="Benchmarking" 
            free="Index funds" 
            premium="Index funds" 
            professional="Any asset" 
          />
          
          <FeatureRow 
            title="Historical data access" 
            free="5 years" 
            premium="10 years" 
            professional="30+ years" 
          />
          
          <TableRow className="bg-muted/50">
            <TableCell colSpan={4} className="font-semibold">Support</TableCell>
          </TableRow>
          
          <FeatureRow 
            title="Support level" 
            free="Basic" 
            premium="Priority" 
            professional="Dedicated manager" 
          />
          
          <FeatureRow 
            title="Weekly summary emails" 
            free={<Minus className="mx-auto" />} 
            premium={<Check className="mx-auto text-finance-green" />} 
            professional={<Check className="mx-auto text-finance-green" />} 
          />
        </TableBody>
      </Table>
    </div>
  );
};

export default PricingComparison;
