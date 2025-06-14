
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Edit2, Check, X, Star } from "lucide-react";
import { PortfolioSelector } from "@/components/ui/portfolio-selector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PortfolioManagerProps {
  csvData?: any[];
}

const PortfolioManager = ({ csvData = [] }: PortfolioManagerProps) => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPortfolio, setNewPortfolio] = useState({ name: "", description: "" });
  const [editingPortfolio, setEditingPortfolio] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ name: "", description: "" });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [importTargetPortfolio, setImportTargetPortfolio] = useState<string>("");

  console.log("PortfolioManager - User:", user?.id, "Is Admin:", isAdmin);

  // Simplified subscription logic
  const subscription = {
    plan: isAdmin ? 'Professional' : 'Free',
    portfolio_limit: isAdmin ? 999 : 1,
    watchlist_limit: isAdmin ? 20 : 1
  };

  // Fetch portfolios
  const { data: portfolios = [], isLoading, error, refetch } = useQuery({
    queryKey: ['portfolios', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log("No user ID available");
        return [];
      }
      
      console.log("Fetching portfolios for user:", user.id);
      
      try {
        const { data, error } = await supabase
          .from('portfolios')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Portfolios query error:", error);
          throw error;
        }
        
        console.log("Portfolios found:", data?.length || 0);
        return data || [];
      } catch (queryError) {
        console.error("Query error:", queryError);
        throw queryError;
      }
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 30000,
  });

  // Set first portfolio as import target by default
  useEffect(() => {
    if (portfolios.length > 0 && !importTargetPortfolio) {
      const defaultPortfolio = portfolios.find(p => p.is_default) || portfolios[0];
      setImportTargetPortfolio(defaultPortfolio.id);
    }
  }, [portfolios, importTargetPortfolio]);

  // Create portfolio mutation
  const createPortfolioMutation = useMutation({
    mutationFn: async (portfolio: { name: string; description: string }) => {
      console.log("Creating portfolio:", portfolio);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      const currentCount = portfolios?.length || 0;
      const limit = subscription?.portfolio_limit || 1;
      
      console.log("Portfolio limit check:", currentCount, "/", limit);
      
      if (currentCount >= limit) {
        throw new Error(`You can only create ${limit} portfolio(s) with your current plan`);
      }

      const portfolioData = {
        user_id: user.id,
        name: portfolio.name.trim(),
        description: portfolio.description?.trim() || null,
        is_default: portfolios.length === 0, // First portfolio is default
      };

      console.log("Inserting portfolio data:", portfolioData);

      const { data, error } = await supabase
        .from('portfolios')
        .insert([portfolioData])
        .select()
        .single();

      if (error) {
        console.error("Portfolio creation error:", error);
        throw error;
      }

      console.log("Portfolio created successfully:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("Portfolio creation mutation success:", data);
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      refetch();
      setNewPortfolio({ name: "", description: "" });
      setIsCreateDialogOpen(false);
      toast({
        title: "Portfolio created",
        description: "Your portfolio has been created successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Portfolio creation mutation error:", error);
      toast({
        title: "Error creating portfolio",
        description: error.message || "Failed to create portfolio. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update portfolio mutation
  const updatePortfolioMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { name: string; description: string } }) => {
      console.log("Updating portfolio:", id, updates);
      
      const { data, error } = await supabase
        .from('portfolios')
        .update({
          name: updates.name.trim(),
          description: updates.description?.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Portfolio update error:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      refetch();
      setEditingPortfolio(null);
      toast({
        title: "Portfolio updated",
        description: "Your portfolio has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Portfolio update mutation error:", error);
      toast({
        title: "Error updating portfolio",
        description: error.message || "Failed to update portfolio. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Set default portfolio mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (portfolioId: string) => {
      console.log("Setting default portfolio:", portfolioId);
      
      // First, unset all defaults
      const { error: unsetError } = await supabase
        .from('portfolios')
        .update({ is_default: false })
        .eq('user_id', user?.id);

      if (unsetError) {
        console.error("Error unsetting defaults:", unsetError);
        throw unsetError;
      }

      // Then set the new default
      const { data, error } = await supabase
        .from('portfolios')
        .update({ is_default: true })
        .eq('id', portfolioId)
        .select()
        .single();

      if (error) {
        console.error("Error setting default:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      refetch();
      toast({
        title: "Default portfolio updated",
        description: "This portfolio is now your default.",
      });
    },
    onError: (error: any) => {
      console.error("Set default mutation error:", error);
      toast({
        title: "Error setting default portfolio",
        description: error.message || "Failed to set default portfolio. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete portfolio mutation
  const deletePortfolioMutation = useMutation({
    mutationFn: async (portfolioId: string) => {
      console.log("Deleting portfolio:", portfolioId);
      
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioId);

      if (error) {
        console.error("Portfolio deletion error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      refetch();
      toast({
        title: "Portfolio deleted",
        description: "Your portfolio has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Portfolio deletion mutation error:", error);
      toast({
        title: "Error deleting portfolio",
        description: error.message || "Failed to delete portfolio. Please try again.",
        variant: "destructive",
      });
    },
  });

  console.log("Portfolio Manager - Loading:", isLoading, "Portfolios:", portfolios?.length, "Error:", error);
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading portfolios...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error("Portfolio Manager error:", error);
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>Error loading portfolios: {error.message}</p>
            <Button 
              onClick={() => refetch()} 
              className="mt-2"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentCount = portfolios?.length || 0;
  const limit = subscription?.portfolio_limit || 1;
  const canCreateMore = currentCount < limit;

  const handleCreatePortfolio = async () => {
    console.log("handleCreatePortfolio called with:", newPortfolio);
    
    if (!newPortfolio.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a portfolio name.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await createPortfolioMutation.mutateAsync(newPortfolio);
    } catch (error) {
      console.error("Error in handleCreatePortfolio:", error);
    }
  };

  const handleCreateFromCSV = async () => {
    if (csvData.length === 0) {
      toast({
        title: "Error",
        description: "No CSV data available. Please import data first.",
        variant: "destructive",
      });
      return;
    }

    if (!importTargetPortfolio) {
      toast({
        title: "Error",
        description: "Please select a target portfolio for import.",
        variant: "destructive",
      });
      return;
    }

    const portfolioName = `Imported Portfolio ${new Date().toLocaleDateString()}`;
    try {
      await createPortfolioMutation.mutateAsync({
        name: portfolioName,
        description: `Portfolio created from CSV with ${csvData.length} items`,
      });
    } catch (error) {
      console.error("Error in handleCreateFromCSV:", error);
    }
  };

  const startEditing = (portfolio: any) => {
    setEditingPortfolio(portfolio.id);
    setEditValues({ name: portfolio.name, description: portfolio.description || "" });
  };

  const handleUpdatePortfolio = async (portfolioId: string) => {
    if (!editValues.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a portfolio name.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await updatePortfolioMutation.mutateAsync({ id: portfolioId, updates: editValues });
    } catch (error) {
      console.error("Error in handleUpdatePortfolio:", error);
    }
  };

  const handleDeletePortfolio = async (portfolioId: string) => {
    if (confirm("Are you sure you want to delete this portfolio?")) {
      try {
        await deletePortfolioMutation.mutateAsync(portfolioId);
      } catch (error) {
        console.error("Error in handleDeletePortfolio:", error);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Management</CardTitle>
        <CardDescription>
          Manage your investment portfolios ({currentCount}/{limit} used)
          {csvData.length > 0 && (
            <span className="block mt-1 text-primary">
              {csvData.length} items ready to import from CSV
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {csvData.length > 0 && portfolios.length > 0 && (
          <PortfolioSelector
            portfolios={portfolios}
            value={importTargetPortfolio}
            onValueChange={setImportTargetPortfolio}
            label="Target Portfolio for CSV Import"
            placeholder="Select portfolio for import"
          />
        )}

        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!canCreateMore} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Portfolio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Portfolio</DialogTitle>
                <DialogDescription>
                  Add a new portfolio to track your investments.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Portfolio Name</Label>
                  <Input
                    id="name"
                    value={newPortfolio.name}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, name: e.target.value })}
                    placeholder="My Investment Portfolio"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newPortfolio.description}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })}
                    placeholder="Description of your portfolio..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={createPortfolioMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreatePortfolio} 
                  disabled={createPortfolioMutation.isPending}
                >
                  {createPortfolioMutation.isPending ? "Creating..." : "Create Portfolio"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {csvData.length > 0 && canCreateMore && (
            <Button 
              variant="outline" 
              onClick={handleCreateFromCSV}
              disabled={createPortfolioMutation.isPending}
            >
              Create from CSV ({csvData.length} items)
            </Button>
          )}
        </div>

        {!canCreateMore && (
          <p className="text-sm text-muted-foreground">
            You've reached your portfolio limit. Upgrade your plan to create more portfolios.
          </p>
        )}

        <div className="space-y-2">
          {portfolios?.map((portfolio) => (
            <div key={portfolio.id} className="flex items-center justify-between p-3 border rounded-lg">
              {editingPortfolio === portfolio.id ? (
                <div className="flex-1 space-y-2 mr-4">
                  <Input
                    value={editValues.name}
                    onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                    placeholder="Portfolio name"
                  />
                  <Textarea
                    value={editValues.description}
                    onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                    placeholder="Portfolio description"
                    rows={2}
                  />
                </div>
              ) : (
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{portfolio.name}</h3>
                    {portfolio.is_default && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  {portfolio.description && (
                    <p className="text-sm text-muted-foreground">{portfolio.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(portfolio.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                {editingPortfolio === portfolio.id ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdatePortfolio(portfolio.id)}
                      disabled={updatePortfolioMutation.isPending}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingPortfolio(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    {!portfolio.is_default && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDefaultMutation.mutate(portfolio.id)}
                        disabled={setDefaultMutation.isPending}
                        title="Set as default portfolio"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing(portfolio)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePortfolio(portfolio.id)}
                      disabled={deletePortfolioMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {portfolios?.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No portfolios yet. Create your first portfolio to get started!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioManager;
