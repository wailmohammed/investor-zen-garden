
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Watchlist {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

interface UserSubscription {
  plan: string;
  watchlist_limit: number;
}

const WatchlistManager = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingWatchlist, setEditingWatchlist] = useState<Watchlist | null>(null);
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [newWatchlistDescription, setNewWatchlistDescription] = useState("");

  useEffect(() => {
    if (user) {
      fetchWatchlists();
      fetchSubscription();
    }
  }, [user]);

  const fetchWatchlists = async () => {
    try {
      const { data, error } = await supabase
        .from('watchlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching watchlists:", error);
        return;
      }

      setWatchlists(data || []);
    } catch (error) {
      console.error("Error fetching watchlists:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('plan, watchlist_limit')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error("Error fetching subscription:", error);
        setSubscription({ plan: isAdmin ? 'Professional' : 'Free', watchlist_limit: isAdmin ? 20 : 1 });
        return;
      }

      setSubscription(data);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setSubscription({ plan: isAdmin ? 'Professional' : 'Free', watchlist_limit: isAdmin ? 20 : 1 });
    }
  };

  const createWatchlist = async () => {
    if (!user || !newWatchlistName.trim()) return;

    if (watchlists.length >= (subscription?.watchlist_limit || 1)) {
      toast({
        title: "Watchlist limit reached",
        description: `Your ${subscription?.plan} plan allows ${subscription?.watchlist_limit} watchlist(s). Upgrade to create more.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('watchlists')
        .insert({
          user_id: user.id,
          name: newWatchlistName.trim(),
          description: newWatchlistDescription.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      setWatchlists(prev => [data, ...prev]);
      setNewWatchlistName("");
      setNewWatchlistDescription("");
      setIsCreateOpen(false);

      toast({
        title: "Watchlist created",
        description: `"${data.name}" has been created successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to create watchlist",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateWatchlist = async () => {
    if (!editingWatchlist || !newWatchlistName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('watchlists')
        .update({
          name: newWatchlistName.trim(),
          description: newWatchlistDescription.trim() || null,
        })
        .eq('id', editingWatchlist.id)
        .select()
        .single();

      if (error) throw error;

      setWatchlists(prev => prev.map(w => w.id === data.id ? data : w));
      setIsEditOpen(false);
      setEditingWatchlist(null);
      setNewWatchlistName("");
      setNewWatchlistDescription("");

      toast({
        title: "Watchlist updated",
        description: `"${data.name}" has been updated successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to update watchlist",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteWatchlist = async (watchlist: Watchlist) => {
    try {
      const { error } = await supabase
        .from('watchlists')
        .delete()
        .eq('id', watchlist.id);

      if (error) throw error;

      setWatchlists(prev => prev.filter(w => w.id !== watchlist.id));

      toast({
        title: "Watchlist deleted",
        description: `"${watchlist.name}" has been deleted.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete watchlist",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (watchlist: Watchlist) => {
    setEditingWatchlist(watchlist);
    setNewWatchlistName(watchlist.name);
    setNewWatchlistDescription(watchlist.description || "");
    setIsEditOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading watchlists...</div>
        </CardContent>
      </Card>
    );
  }

  const canCreateMore = watchlists.length < (subscription?.watchlist_limit || 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Watchlist Manager
        </CardTitle>
        <CardDescription>
          Manage your stock watchlists • {subscription?.plan} Plan ({watchlists.length}/{subscription?.watchlist_limit || 1} watchlists)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Your Watchlists</h3>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button disabled={!canCreateMore}>
                <Plus className="w-4 h-4 mr-2" />
                Create Watchlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Watchlist</DialogTitle>
                <DialogDescription>
                  Create a new watchlist to track stocks and investments.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="watchlist-name">Watchlist Name</Label>
                  <Input
                    id="watchlist-name"
                    placeholder="e.g., Tech Stocks, Dividend Champions"
                    value={newWatchlistName}
                    onChange={(e) => setNewWatchlistName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="watchlist-description">Description (Optional)</Label>
                  <Input
                    id="watchlist-description"
                    placeholder="Brief description of this watchlist"
                    value={newWatchlistDescription}
                    onChange={(e) => setNewWatchlistDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createWatchlist} disabled={!newWatchlistName.trim()}>
                  Create Watchlist
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {!canCreateMore && (
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            You've reached your watchlist limit. Upgrade to Professional to create more watchlists.
          </div>
        )}

        <div className="grid gap-4">
          {watchlists.map((watchlist) => (
            <div key={watchlist.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <h4 className="font-medium">{watchlist.name}</h4>
                {watchlist.description && (
                  <p className="text-sm text-muted-foreground">{watchlist.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Created {new Date(watchlist.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(watchlist)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteWatchlist(watchlist)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}

          {watchlists.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No watchlists yet. Create your first watchlist to get started!
            </div>
          )}
        </div>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Watchlist</DialogTitle>
              <DialogDescription>
                Update your watchlist name and description.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-watchlist-name">Watchlist Name</Label>
                <Input
                  id="edit-watchlist-name"
                  value={newWatchlistName}
                  onChange={(e) => setNewWatchlistName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-watchlist-description">Description (Optional)</Label>
                <Input
                  id="edit-watchlist-description"
                  value={newWatchlistDescription}
                  onChange={(e) => setNewWatchlistDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updateWatchlist} disabled={!newWatchlistName.trim()}>
                Update Watchlist
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default WatchlistManager;
