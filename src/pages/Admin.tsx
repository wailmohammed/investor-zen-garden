import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";

type UserType = {
  id: string;
  email: string;
  created_at: string;
  is_admin?: boolean;
  last_sign_in_at?: string;
};

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Since we don't have a proper admin check yet, we'll use this as a temporary solution
  // In a real application, you would implement proper admin checks
  useEffect(() => {
    // For demo purposes, we're setting the first user as admin
    const checkAdminStatus = async () => {
      try {
        if (!user) {
          navigate("/login");
          return;
        }

        // For now, we're considering the logged-in user as an admin for demo purposes
        setIsAdmin(true);
        fetchUsers();
      } catch (error: any) {
        console.error("Error checking admin status:", error.message);
        toast({
          title: "Error",
          description: "Failed to verify admin permissions.",
          variant: "destructive",
        });
        navigate("/dashboard");
      }
    };

    checkAdminStatus();
  }, [user, navigate, toast]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;

      // Get all users from auth.users (requires admin rights via RPC)
      // Note: This might fail if the RPC isn't properly set up
      let users = [];
      try {
        const { data: authUsers, error: usersError } = await supabase.rpc('get_all_users');
        if (!usersError && authUsers) {
          users = authUsers;
        }
      } catch (e) {
        console.error("Failed to get users from auth.users. Using profiles table instead.");
        // If we can't get users from auth.users, we'll just use the profiles
        users = profiles || [];
      }

      // Combine the data
      const combinedUsers = users.map((authUser: any) => {
        const profile = profiles?.find(p => p.id === authUser.id) || {};
        return {
          ...authUser,
          ...profile,
          // Since is_admin doesn't exist, we'll set it to false for now
          is_admin: false
        };
      });

      setUsers(combinedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error.message);
      toast({
        title: "Error",
        description: "Failed to load users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // This function would normally toggle admin status, but since the column doesn't exist,
  // we'll just show a toast notification for now
  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    toast({
      title: "Feature not available",
      description: "Admin status management is not currently implemented.",
      variant: "default",
    });
  };

  if (loading || !isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-lg">Loading admin panel...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users and system settings</p>
        </div>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage user accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Sign In</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {user.last_sign_in_at 
                              ? new Date(user.last_sign_in_at).toLocaleDateString() 
                              : "Never"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch 
                                checked={!!user.is_admin} 
                                onCheckedChange={() => toggleAdminStatus(user.id, !!user.is_admin)}
                                disabled={true} // Disabled since the feature isn't implemented
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/admin/users/${user.id}`)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Management</CardTitle>
                <CardDescription>
                  View and manage payment transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Payment transaction history will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure application settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="site-name">Site Name</Label>
                    <Input id="site-name" defaultValue="InvestorZen" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    <Switch id="maintenance-mode" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
