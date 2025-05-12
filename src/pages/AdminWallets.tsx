
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, Plus, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Wallet {
  id: string;
  name: string;
  address: string;
  currency: string;
  is_active: boolean;
}

const AdminWallets = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    currency: "BTC",
    is_active: true,
  });

  useEffect(() => {
    if (isAdmin) {
      fetchWallets();
    }
  }, [isAdmin]);

  const fetchWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_wallets')
        .select('*')
        .order('currency');
        
      if (error) throw error;
      
      setWallets(data || []);
    } catch (error: any) {
      console.error("Error fetching wallets:", error);
      toast({
        title: "Failed to fetch wallets",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      currency: "BTC",
      is_active: true,
    });
    setIsEditing(false);
    setCurrentWallet(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isEditing && currentWallet) {
        // Update existing wallet
        const { error } = await supabase
          .from('admin_wallets')
          .update({
            name: formData.name,
            address: formData.address,
            currency: formData.currency,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentWallet.id);
          
        if (error) throw error;
        
        toast({
          title: "Wallet updated",
          description: `The ${formData.currency} wallet has been successfully updated.`,
        });
      } else {
        // Add new wallet
        const { error } = await supabase
          .from('admin_wallets')
          .insert({
            name: formData.name,
            address: formData.address,
            currency: formData.currency,
            is_active: formData.is_active,
          });
          
        if (error) throw error;
        
        toast({
          title: "Wallet added",
          description: `New ${formData.currency} wallet has been successfully added.`,
        });
      }
      
      // Refresh wallet list
      await fetchWallets();
      resetForm();
    } catch (error: any) {
      toast({
        title: "Operation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (wallet: Wallet) => {
    setIsEditing(true);
    setCurrentWallet(wallet);
    setFormData({
      name: wallet.name,
      address: wallet.address,
      currency: wallet.currency,
      is_active: wallet.is_active,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this wallet?")) {
      try {
        const { error } = await supabase
          .from('admin_wallets')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        toast({
          title: "Wallet deleted",
          description: "The wallet has been successfully removed.",
        });
        
        await fetchWallets();
      } catch (error: any) {
        toast({
          title: "Failed to delete wallet",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <Info className="h-16 w-16 text-gray-400" />
          <h2 className="text-2xl font-bold mt-4">Admin Access Required</h2>
          <p className="text-muted-foreground mt-2">
            You do not have permission to view this page.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Crypto Wallets</h1>
          <p className="text-muted-foreground">Manage cryptocurrency wallets for receiving payments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {isEditing ? "Edit Crypto Wallet" : "Add New Crypto Wallet"}
              </CardTitle>
              <CardDescription>
                {isEditing ? "Update your existing wallet" : "Add a new wallet for receiving payments"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Wallet Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Main BTC Wallet"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleSelectChange("currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                      <SelectItem value="USDT">Tether (USDT)</SelectItem>
                      <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                      <SelectItem value="BNB">Binance Coin (BNB)</SelectItem>
                      <SelectItem value="SOL">Solana (SOL)</SelectItem>
                      <SelectItem value="ADA">Cardano (ADA)</SelectItem>
                      <SelectItem value="XRP">XRP (XRP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Wallet Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter wallet address"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Make sure to verify this address multiple times. Cryptocurrency transactions cannot be reversed.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : isEditing ? "Update Wallet" : "Add Wallet"}
                  </Button>
                  {isEditing && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wallet Management</CardTitle>
              <CardDescription>
                Best practices for crypto wallet management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium">Security Best Practices</h3>
                <ul className="list-disc pl-4 mt-2 space-y-1">
                  <li>Use hardware wallets for large amounts</li>
                  <li>Enable all available security features</li>
                  <li>Regularly rotate wallet addresses</li>
                  <li>Monitor transactions regularly</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium">Wallet Address Verification</h3>
                <p className="mt-1">Always double-check wallet addresses before saving. Even a single incorrect character can result in permanent loss of funds.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registered Wallets</CardTitle>
            <CardDescription>
              All cryptocurrency wallets available for receiving payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {wallets.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No wallets registered yet</p>
              </div>
            ) : (
              <div className="border rounded-md">
                <div className="grid grid-cols-5 font-medium p-4 border-b bg-muted/50">
                  <div className="col-span-1">Currency</div>
                  <div className="col-span-1">Name</div>
                  <div className="col-span-2">Address</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
                {wallets.map((wallet) => (
                  <div key={wallet.id} className="grid grid-cols-5 p-4 border-b last:border-0 items-center">
                    <div className="col-span-1 font-medium">{wallet.currency}</div>
                    <div className="col-span-1">{wallet.name}</div>
                    <div className="col-span-2 truncate">{wallet.address}</div>
                    <div className="col-span-1 flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(wallet)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(wallet.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full mt-4" onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Wallet
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminWallets;
