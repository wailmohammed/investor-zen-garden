
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, PieChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Portfolio {
  id: string;
  name: string;
  description?: string;
  is_default: boolean;
  created_at: string;
}

interface UserSubscription {
  plan: string;
  portfolio_limit: number;
}

const PortfolioManager = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [newPortfolioName, setNewPortfolioName] = useState("");
  const [newPortfolioDescription, setNewPortfolioDescription] = useState("");

  useEffect(() => {
    if (user) {
      fetchPortfolios();
      fetchSubscription();
    }
  }, [user]);

  const fetchPortfolios = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching portfolios:", error);
        return;
      }

      setPortfolios(data || []);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('plan, portfolio_limit')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error("Error fetching subscription:", error);
        // Set default for demo
        setSubscription({ plan: isAdmin ? 'Professional' : 'Free', portfolio_limit: isAdmin ? 999 : 1 });
        return;
      }

      setSubscription(data);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setSubscription({ plan: isAdmin ? 'Professional' : 'Free', portfolio_limit: isAdmin ? 999 : 1 });
    }
  };

  const createPortfolio = async () => {
    if (!user || !newPortfolioName.trim()) return;

    if (portfolios.length >= (subscription?.portfolio_limit || 1)) {
      toast({
        title: "Portfolio limit reached",
        description: `Your ${subscription?.plan} plan allows ${subscription?.portfolio_limit} portfolio(s). Upgrade to create more.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('portfolios')
        .insert({
          user_id: user.id,
          name: newPortfolioName.trim(),
          description: newPortfolioDescription.trim() || null,
          is_default: portfolios.length === 0
        })
        .select()
        .single();

      if (error) throw error;

      setPortfolios(prev => [data, ...prev]);
      setNewPortfolioName("");
      setNewPortfolioDescription("");
      setIsCreateOpen(false);

      toast({
        title: "Portfolio created",
        description: `"${data.name}" has been created successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to create portfolio",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updatePortfolio = async () => {
    if (!editingPortfolio || !newPortfolioName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('portfolios')
        .update({
          name: newPortfolioName.trim(),
          description: newPortfolioDescription.trim() || null,
        })
        .eq('id', editingPortfolio.id)
        .select()
        .single();

      if (error) throw error;

      setPortfolios(prev => prev.map(p => p.id === data.id ? data : p));
      setIsEditOpen(false);
      setEditingPortfolio(null);
      setNewPortfolioName("");
      setNewPortfolioDescription("");

      toast({
        title: "Portfolio updated",
        description: `"${data.name}" has been updated successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to update portfolio",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deletePortfolio = async (portfolio: Portfolio) => {
    if (portfolio.is_default) {
      toast({
        title: "Cannot delete default portfolio",
        description: "You cannot delete your default portfolio.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolio.id);

      if (error) throw error;

      setPortfolios(prev => prev.filter(p => p.id !== portfolio.id));

      toast({
        title: "Portfolio deleted",
        description: `"${portfolio.name}" has been deleted.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete portfolio",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio);
    setNewPortfolioName(portfolio.name);
    setNewPortfolioDescription(portfolio.description || "");
    setIsEditOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading portfolios...</div>
        </CardContent>
      </Card>
    );
  }

  const canCreateMore = portfolios.length < (subscription?.portfolio_limit || 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          Portfolio Manager
        </CardTitle>
        <CardDescription>
          Manage your investment portfolios • {subscription?.plan} Plan ({portfolios.length}/{subscription?.portfolio_limit || 1} portfolios)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Your Portfolios</h3>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button disabled={!canCreateMore}>
                <Plus className="w-4 h-4 mr-2" />
                Create Portfolio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Portfolio</DialogTitle>
                <DialogDescription>
                  Create a new portfolio to organize your investments.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="portfolio-name">Portfolio Name</Label>
                  <Input
                    id="portfolio-name"
                    placeholder="e.g., Growth Stocks, Retirement Fund"
                    value={newPortfolioName}
                    onChange={(e) => setNewPortfolioName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="portfolio-description">Description (Optional)</Label>
                  <Input
                    id="portfolio-description"
                    placeholder="Brief description of this portfolio"
                    value={newPortfolioDescription}
                    onChange={(e) => setNewPortfolioDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createPortfolio} disabled={!newPortfolioName.trim()}>
                  Create Portfolio
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {!canCreateMore && (
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            You've reached your portfolio limit. Upgrade to Professional to create unlimited portfolios.
          </div>
        )}

        <div className="grid gap-4">
          {portfolios.map((portfolio) => (
            <div key={portfolio.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{portfolio.name}</h4>
                  {portfolio.is_default && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                </div>
                {portfolio.description && (
                  <p className="text-sm text-muted-foreground">{portfolio.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Created {new Date(portfolio.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(portfolio)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                {!portfolio.is_default && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deletePortfolio(portfolio)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {portfolios.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No portfolios yet. Create your first portfolio to get started!
            </div>
          )}
        </div>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Portfolio</DialogTitle>
              <DialogDescription>
                Update your portfolio name and description.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-portfolio-name">Portfolio Name</Label>
                <Input
                  id="edit-portfolio-name"
                  value={newPortfolioName}
                  onChange={(e) => setNewPortfolioName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-portfolio-description">Description (Optional)</Label>
                <Input
                  id="edit-portfolio-description"
                  value={newPortfolioDescription}
                  onChange={(e) => setNewPortfolioDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updatePortfolio} disabled={!newPortfolioName.trim()}>
                Update Portfolio
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PortfolioManager;
