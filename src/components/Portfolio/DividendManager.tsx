
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Edit2, Check, X } from "lucide-react";
import { PortfolioSelector } from "@/components/ui/portfolio-selector";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DividendManagerProps {
  csvData?: any[];
}

const DividendManager = ({ csvData = [] }: DividendManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDividend, setNewDividend] = useState({
    symbol: "",
    company_name: "",
    dividend_amount: "",
    payment_date: "",
    ex_dividend_date: "",
    shares_owned: "",
    total_received: "",
  });

  // Fetch portfolios for dropdown
  const { data: portfolios = [] } = useQuery({
    queryKey: ['portfolios', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch dividends for selected portfolio
  const { data: dividends = [], isLoading } = useQuery({
    queryKey: ['dividends', user?.id, selectedPortfolio],
    queryFn: async () => {
      if (!user?.id || !selectedPortfolio) return [];
      
      const { data, error } = await supabase
        .from('dividends')
        .select('*')
        .eq('user_id', user.id)
        .eq('portfolio_id', selectedPortfolio)
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!selectedPortfolio,
  });

  // Fetch dividend settings
  const { data: settings } = useQuery({
    queryKey: ['dividend_settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('dividend_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Set default portfolio from settings
  useEffect(() => {
    if (settings?.default_portfolio_id && portfolios.length > 0) {
      setSelectedPortfolio(settings.default_portfolio_id);
    } else if (portfolios.length > 0 && !selectedPortfolio) {
      setSelectedPortfolio(portfolios[0].id);
    }
  }, [settings, portfolios, selectedPortfolio]);

  // Create dividend mutation
  const createDividendMutation = useMutation({
    mutationFn: async (dividend: any) => {
      if (!user?.id || !selectedPortfolio) throw new Error('User not authenticated or no portfolio selected');
      
      const { data, error } = await supabase
        .from('dividends')
        .insert([
          {
            ...dividend,
            user_id: user.id,
            portfolio_id: selectedPortfolio,
            dividend_amount: parseFloat(dividend.dividend_amount),
            shares_owned: dividend.shares_owned ? parseFloat(dividend.shares_owned) : null,
            total_received: parseFloat(dividend.total_received),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dividends'] });
      setNewDividend({
        symbol: "",
        company_name: "",
        dividend_amount: "",
        payment_date: "",
        ex_dividend_date: "",
        shares_owned: "",
        total_received: "",
      });
      setIsCreateDialogOpen(false);
      toast({
        title: "Dividend added",
        description: "Your dividend has been recorded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update default portfolio settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (defaultPortfolioId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('dividend_settings')
        .upsert([
          {
            user_id: user.id,
            default_portfolio_id: defaultPortfolioId === 'none' ? null : defaultPortfolioId,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dividend_settings'] });
      toast({
        title: "Settings updated",
        description: "Default portfolio has been updated.",
      });
    },
  });

  const handleCreateDividend = () => {
    if (!newDividend.symbol.trim() || !newDividend.payment_date || !newDividend.total_received) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createDividendMutation.mutate(newDividend);
  };

  const handleImportFromCSV = () => {
    if (csvData.length === 0) {
      toast({
        title: "Error",
        description: "No CSV data available. Please import data first.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPortfolio) {
      toast({
        title: "Error",
        description: "Please select a portfolio first.",
        variant: "destructive",
      });
      return;
    }

    // Process CSV data and create dividends
    toast({
      title: "Import started",
      description: `Processing ${csvData.length} dividend records...`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dividend Management</CardTitle>
        <CardDescription>
          Track and manage your dividend income across portfolios
          {csvData.length > 0 && (
            <span className="block mt-1 text-primary">
              {csvData.length} dividend records ready to import from CSV
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PortfolioSelector
            portfolios={portfolios}
            value={selectedPortfolio}
            onValueChange={setSelectedPortfolio}
            label="Select Portfolio"
            placeholder="Choose a portfolio to view dividends"
          />
          
          <PortfolioSelector
            portfolios={portfolios}
            value={settings?.default_portfolio_id || "none"}
            onValueChange={(value) => updateSettingsMutation.mutate(value)}
            label="Default Portfolio for Imports"
            placeholder="Choose default portfolio"
            includeNone={true}
          />
        </div>

        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedPortfolio} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Dividend
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Dividend</DialogTitle>
                <DialogDescription>
                  Record a dividend payment for your portfolio.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="symbol">Symbol *</Label>
                  <Input
                    id="symbol"
                    value={newDividend.symbol}
                    onChange={(e) => setNewDividend({ ...newDividend, symbol: e.target.value.toUpperCase() })}
                    placeholder="AAPL"
                  />
                </div>
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={newDividend.company_name}
                    onChange={(e) => setNewDividend({ ...newDividend, company_name: e.target.value })}
                    placeholder="Apple Inc."
                  />
                </div>
                <div>
                  <Label htmlFor="dividend_amount">Dividend per Share *</Label>
                  <Input
                    id="dividend_amount"
                    type="number"
                    step="0.0001"
                    value={newDividend.dividend_amount}
                    onChange={(e) => setNewDividend({ ...newDividend, dividend_amount: e.target.value })}
                    placeholder="0.25"
                  />
                </div>
                <div>
                  <Label htmlFor="shares_owned">Shares Owned</Label>
                  <Input
                    id="shares_owned"
                    type="number"
                    step="0.0001"
                    value={newDividend.shares_owned}
                    onChange={(e) => setNewDividend({ ...newDividend, shares_owned: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label htmlFor="payment_date">Payment Date *</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={newDividend.payment_date}
                    onChange={(e) => setNewDividend({ ...newDividend, payment_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="ex_dividend_date">Ex-Dividend Date</Label>
                  <Input
                    id="ex_dividend_date"
                    type="date"
                    value={newDividend.ex_dividend_date}
                    onChange={(e) => setNewDividend({ ...newDividend, ex_dividend_date: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="total_received">Total Amount Received *</Label>
                  <Input
                    id="total_received"
                    type="number"
                    step="0.01"
                    value={newDividend.total_received}
                    onChange={(e) => setNewDividend({ ...newDividend, total_received: e.target.value })}
                    placeholder="25.00"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDividend} disabled={createDividendMutation.isPending}>
                  {createDividendMutation.isPending ? "Adding..." : "Add Dividend"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {csvData.length > 0 && selectedPortfolio && (
            <Button 
              variant="outline" 
              onClick={handleImportFromCSV}
              disabled={createDividendMutation.isPending}
            >
              Import from CSV ({csvData.length} records)
            </Button>
          )}
        </div>

        {selectedPortfolio && (
          <div className="space-y-4">
            <h3 className="font-medium">Dividend History</h3>
            {isLoading ? (
              <div className="text-center py-8">Loading dividends...</div>
            ) : dividends.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Per Share</TableHead>
                      <TableHead>Shares</TableHead>
                      <TableHead>Total Received</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dividends.map((dividend) => (
                      <TableRow key={dividend.id}>
                        <TableCell className="font-medium">{dividend.symbol}</TableCell>
                        <TableCell>{dividend.company_name || '-'}</TableCell>
                        <TableCell>{new Date(dividend.payment_date).toLocaleDateString()}</TableCell>
                        <TableCell>${dividend.dividend_amount.toFixed(4)}</TableCell>
                        <TableCell>{dividend.shares_owned?.toFixed(2) || '-'}</TableCell>
                        <TableCell>${dividend.total_received.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No dividends recorded for this portfolio yet.
              </div>
            )}
          </div>
        )}

        {!selectedPortfolio && portfolios.length > 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Select a portfolio to view and manage dividends.
          </div>
        )}

        {portfolios.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Create a portfolio first to start tracking dividends.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DividendManager;
