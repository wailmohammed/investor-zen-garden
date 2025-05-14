
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ChartLine, Settings, Users, Info, DollarSign } from "lucide-react";
import SubscriptionPriceEditor from "@/components/admin/SubscriptionPriceEditor";

const Admin = () => {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const [globalDefaultCurrency, setGlobalDefaultCurrency] = useState<string>("USD");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchGlobalSettings();
    }
  }, [isAdmin]);

  const fetchGlobalSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('global_settings')
        .select('default_currency')
        .single();
      
      if (error) {
        console.error("Error fetching global settings:", error);
        return;
      }
      
      if (data && data.default_currency) {
        setGlobalDefaultCurrency(data.default_currency);
      }
    } catch (error) {
      console.error("Error fetching global settings:", error);
    }
  };

  const updateGlobalDefaultCurrency = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('global_settings')
        .upsert({ 
          id: 'default', 
          default_currency: globalDefaultCurrency,
          updated_by: user?.id,
          updated_at: new Date().toISOString() 
        });
      
      if (error) {
        toast({
          title: "Failed to update global currency",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Global currency updated",
        description: `Default subscription currency set to ${globalDefaultCurrency}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating global currency",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage system settings and users</p>
        </div>

        <Tabs defaultValue="settings">
          <TabsList>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <ChartLine className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="pricing">
              <DollarSign className="w-4 h-4 mr-2" />
              Pricing
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Default Subscription Currency</CardTitle>
                <CardDescription>
                  Set the default currency for all new subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Currency</label>
                    <Select
                      value={globalDefaultCurrency}
                      onValueChange={setGlobalDefaultCurrency}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                        <SelectItem value="CAD">CAD ($)</SelectItem>
                        <SelectItem value="AUD">AUD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={updateGlobalDefaultCurrency} 
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update Default Currency"}
                </Button>
              </CardContent>
            </Card>

            {/* Additional admin settings cards would go here */}
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage user accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* User management UI would go here */}
                <p className="text-muted-foreground py-8 text-center">
                  User management functionality coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>System Analytics</CardTitle>
                <CardDescription>
                  View system performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Analytics UI would go here */}
                <p className="text-muted-foreground py-8 text-center">
                  Analytics dashboard coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4 mt-6">
            <SubscriptionPriceEditor />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
