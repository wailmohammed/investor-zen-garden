
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink } from "lucide-react";

interface Holding {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  change?: number;
  changePercent?: number;
}

interface ViewAllHoldingsDialogProps {
  holdings: Holding[];
}

const ViewAllHoldingsDialog: React.FC<ViewAllHoldingsDialogProps> = ({ holdings }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <ExternalLink className="h-4 w-4 mr-2" />
          View All
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>All Holdings</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {holdings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No holdings data available.</p>
              <p className="text-sm mt-1">Connect your Trading212 account to see real holdings.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Avg Price</TableHead>
                  <TableHead className="text-right">Current Price</TableHead>
                  <TableHead className="text-right">Market Value</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                  <TableHead className="text-right">Change %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holdings.map((holding) => (
                  <TableRow key={holding.symbol}>
                    <TableCell className="font-medium">{holding.symbol}</TableCell>
                    <TableCell className="text-right">{holding.quantity.toFixed(4)}</TableCell>
                    <TableCell className="text-right">${holding.averagePrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${holding.currentPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${holding.marketValue.toFixed(2)}</TableCell>
                    <TableCell className={`text-right ${holding.unrealizedPnL >= 0 ? 'text-finance-green' : 'text-finance-red'}`}>
                      ${holding.unrealizedPnL >= 0 ? '+' : ''}${holding.unrealizedPnL.toFixed(2)}
                    </TableCell>
                    <TableCell className={`text-right ${holding.changePercent && holding.changePercent >= 0 ? 'text-finance-green' : 'text-finance-red'}`}>
                      {holding.changePercent !== undefined ? 
                        `${holding.changePercent >= 0 ? '+' : ''}${holding.changePercent.toFixed(2)}%` : 
                        'N/A'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewAllHoldingsDialog;
