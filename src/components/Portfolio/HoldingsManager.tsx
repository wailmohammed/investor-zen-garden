
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PortfolioSelector } from '@/components/ui/portfolio-selector';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface Holding {
  id: string;
  portfolio_id: string;
  symbol: string;
  company_name?: string;
  shares: number;
  average_cost: number;
  current_price?: number;
  market_value?: number;
  gain_loss?: number;
  gain_loss_percentage?: number;
  created_at: string;
  updated_at: string;
}

const HoldingsManager = () => {
  const { user } = useAuth();
  const { selectedPortfolio, portfolios } = usePortfolio();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<string | null>(null);
  const [selectedPortfolioForAdd, setSelectedPortfolioForAdd] = useState<string>('');
  const [newHolding, setNewHolding] = useState({
    symbol: '',
    company_name: '',
    shares: 0,
    average_cost: 0,
    current_price: 0,
  });
  const [editValues, setEditValues] = useState({
    symbol: '',
    company_name: '',
    shares: 0,
    average_cost: 0,
    current_price: 0,
  });

  // Set default portfolio when dialog opens
  React.useEffect(() => {
    if (isAddDialogOpen && selectedPortfolio && !selectedPortfolioForAdd) {
      setSelectedPortfolioForAdd(selectedPortfolio);
    }
  }, [isAddDialogOpen, selectedPortfolio, selectedPortfolioForAdd]);

  // Fetch holdings for selected portfolio
  const { data: holdings = [], isLoading, refetch } = useQuery({
    queryKey: ['holdings', selectedPortfolio],
    queryFn: async () => {
      if (!selectedPortfolio) return [];
      
      const { data, error } = await supabase
        .from('holdings')
        .select('*')
        .eq('portfolio_id', selectedPortfolio)
        .order('symbol');
      
      if (error) throw error;
      
      // Calculate market values and gains/losses
      return data.map(holding => {
        const marketValue = holding.shares * (holding.current_price || holding.average_cost);
        const costBasis = holding.shares * holding.average_cost;
        const gainLoss = marketValue - costBasis;
        const gainLossPercentage = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
        
        return {
          ...holding,
          market_value: marketValue,
          gain_loss: gainLoss,
          gain_loss_percentage: gainLossPercentage,
        };
      });
    },
    enabled: !!selectedPortfolio,
  });

  // Add holding mutation
  const addHoldingMutation = useMutation({
    mutationFn: async (holding: typeof newHolding & { portfolio_id: string }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('holdings')
        .insert([{
          portfolio_id: holding.portfolio_id,
          user_id: user.id,
          symbol: holding.symbol.toUpperCase(),
          company_name: holding.company_name || null,
          shares: holding.shares,
          average_cost: holding.average_cost,
          current_price: holding.current_price || holding.average_cost,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holdings'] });
      refetch();
      setNewHolding({ symbol: '', company_name: '', shares: 0, average_cost: 0, current_price: 0 });
      setSelectedPortfolioForAdd('');
      setIsAddDialogOpen(false);
      toast({
        title: 'Holding added',
        description: 'New holding has been added to your portfolio.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error adding holding',
        description: error.message || 'Failed to add holding. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Update holding mutation
  const updateHoldingMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: typeof editValues }) => {
      const { data, error } = await supabase
        .from('holdings')
        .update({
          symbol: updates.symbol.toUpperCase(),
          company_name: updates.company_name || null,
          shares: updates.shares,
          average_cost: updates.average_cost,
          current_price: updates.current_price || updates.average_cost,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holdings'] });
      refetch();
      setEditingHolding(null);
      toast({
        title: 'Holding updated',
        description: 'Holding has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating holding',
        description: error.message || 'Failed to update holding. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Delete holding mutation
  const deleteHoldingMutation = useMutation({
    mutationFn: async (holdingId: string) => {
      const { error } = await supabase
        .from('holdings')
        .delete()
        .eq('id', holdingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holdings'] });
      refetch();
      toast({
        title: 'Holding deleted',
        description: 'Holding has been removed from your portfolio.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting holding',
        description: error.message || 'Failed to delete holding. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleAddHolding = () => {
    if (!selectedPortfolioForAdd) {
      toast({
        title: 'Portfolio required',
        description: 'Please select a portfolio to add the holding to.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!newHolding.symbol || newHolding.shares <= 0 || newHolding.average_cost <= 0) {
      toast({
        title: 'Invalid input',
        description: 'Please provide valid symbol, shares, and average cost.',
        variant: 'destructive',
      });
      return;
    }
    
    addHoldingMutation.mutate({
      ...newHolding,
      portfolio_id: selectedPortfolioForAdd,
    });
  };

  const startEditing = (holding: Holding) => {
    setEditingHolding(holding.id);
    setEditValues({
      symbol: holding.symbol,
      company_name: holding.company_name || '',
      shares: holding.shares,
      average_cost: holding.average_cost,
      current_price: holding.current_price || holding.average_cost,
    });
  };

  const handleUpdateHolding = (holdingId: string) => {
    if (!editValues.symbol || editValues.shares <= 0 || editValues.average_cost <= 0) {
      toast({
        title: 'Invalid input',
        description: 'Please provide valid symbol, shares, and average cost.',
        variant: 'destructive',
      });
      return;
    }
    updateHoldingMutation.mutate({ id: holdingId, updates: editValues });
  };

  const handleDeleteHolding = (holdingId: string) => {
    if (confirm('Are you sure you want to delete this holding?')) {
      deleteHoldingMutation.mutate(holdingId);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  if (!selectedPortfolio) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Please select a portfolio to manage holdings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Portfolio Holdings</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Holding
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Holding</DialogTitle>
                <DialogDescription>
                  Add a new stock or asset to your portfolio.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <PortfolioSelector
                  portfolios={portfolios}
                  value={selectedPortfolioForAdd}
                  onValueChange={setSelectedPortfolioForAdd}
                  label="Portfolio *"
                  placeholder="Select portfolio to add holding to"
                />
                <div>
                  <Label htmlFor="symbol">Symbol *</Label>
                  <Input
                    id="symbol"
                    value={newHolding.symbol}
                    onChange={(e) => setNewHolding({ ...newHolding, symbol: e.target.value })}
                    placeholder="AAPL"
                  />
                </div>
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={newHolding.company_name}
                    onChange={(e) => setNewHolding({ ...newHolding, company_name: e.target.value })}
                    placeholder="Apple Inc."
                  />
                </div>
                <div>
                  <Label htmlFor="shares">Shares *</Label>
                  <Input
                    id="shares"
                    type="number"
                    min="0"
                    step="0.001"
                    value={newHolding.shares}
                    onChange={(e) => setNewHolding({ ...newHolding, shares: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="average_cost">Average Cost per Share *</Label>
                  <Input
                    id="average_cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newHolding.average_cost}
                    onChange={(e) => setNewHolding({ ...newHolding, average_cost: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="current_price">Current Price per Share</Label>
                  <Input
                    id="current_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newHolding.current_price}
                    onChange={(e) => setNewHolding({ ...newHolding, current_price: parseFloat(e.target.value) || 0 })}
                    placeholder="Leave empty to use average cost"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddHolding} disabled={addHoldingMutation.isPending}>
                  {addHoldingMutation.isPending ? 'Adding...' : 'Add Holding'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading holdings...</div>
        ) : holdings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No holdings found in this portfolio.</p>
            <p className="text-sm mt-2">Add your first holding to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead className="text-right">Shares</TableHead>
                  <TableHead className="text-right">Avg Cost</TableHead>
                  <TableHead className="text-right">Current Price</TableHead>
                  <TableHead className="text-right">Market Value</TableHead>
                  <TableHead className="text-right">Gain/Loss</TableHead>
                  <TableHead className="text-right">%</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holdings.map((holding) => (
                  <TableRow key={holding.id}>
                    {editingHolding === holding.id ? (
                      <>
                        <TableCell>
                          <Input
                            value={editValues.symbol}
                            onChange={(e) => setEditValues({ ...editValues, symbol: e.target.value })}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editValues.company_name}
                            onChange={(e) => setEditValues({ ...editValues, company_name: e.target.value })}
                            className="w-32"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.001"
                            value={editValues.shares}
                            onChange={(e) => setEditValues({ ...editValues, shares: parseFloat(e.target.value) || 0 })}
                            className="w-24 text-right"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editValues.average_cost}
                            onChange={(e) => setEditValues({ ...editValues, average_cost: parseFloat(e.target.value) || 0 })}
                            className="w-24 text-right"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editValues.current_price}
                            onChange={(e) => setEditValues({ ...editValues, current_price: parseFloat(e.target.value) || 0 })}
                            className="w-24 text-right"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(editValues.shares * editValues.current_price)}
                        </TableCell>
                        <TableCell className="text-right">-</TableCell>
                        <TableCell className="text-right">-</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateHolding(holding.id)}
                              disabled={updateHoldingMutation.isPending}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingHolding(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-medium">{holding.symbol}</TableCell>
                        <TableCell>{holding.company_name || '-'}</TableCell>
                        <TableCell className="text-right">{holding.shares.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{formatCurrency(holding.average_cost)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(holding.current_price || holding.average_cost)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(holding.market_value || 0)}</TableCell>
                        <TableCell className={`text-right ${(holding.gain_loss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(holding.gain_loss || 0)}
                        </TableCell>
                        <TableCell className={`text-right ${(holding.gain_loss_percentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercentage(holding.gain_loss_percentage || 0)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditing(holding)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteHolding(holding.id)}
                              disabled={deleteHoldingMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HoldingsManager;
