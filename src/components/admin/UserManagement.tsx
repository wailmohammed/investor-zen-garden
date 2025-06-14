
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX, Mail, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  email_confirmed_at: string;
  is_admin?: boolean;
  full_name?: string;
  default_currency?: string;
  subscription_plan?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch profiles data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_subscriptions(plan)
        `);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        // Use mock data for demonstration
        const mockUsers = [
          {
            id: '1',
            email: 'wailafmohammed@gmail.com',
            created_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
            email_confirmed_at: new Date().toISOString(),
            is_admin: true,
            full_name: 'Wailaf Mohammed',
            default_currency: 'USD',
            subscription_plan: 'Professional'
          },
          {
            id: '2',
            email: 'user@example.com',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            last_sign_in_at: new Date(Date.now() - 3600000).toISOString(),
            email_confirmed_at: new Date(Date.now() - 86400000).toISOString(),
            is_admin: false,
            full_name: 'Regular User',
            default_currency: 'EUR',
            subscription_plan: 'Free'
          }
        ];
        setUsers(mockUsers);
      } else {
        // Map the data to include subscription plan
        const mappedUsers = profiles?.map(profile => ({
          ...profile,
          email: profile.email || 'No email',
          subscription_plan: (profile as any).user_subscriptions?.[0]?.plan || 'Free'
        })) || [];
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error("Error in fetchUsers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);

      if (profileError) {
        console.error("Profile update error:", profileError);
      }

      // Update subscription plan based on admin status
      const newPlan = !currentStatus ? 'Professional' : 'Free';
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .upsert({ 
          user_id: userId, 
          plan: newPlan,
          portfolio_limit: !currentStatus ? 999 : 1,
          watchlist_limit: !currentStatus ? 20 : 1
        });

      if (subscriptionError) {
        console.error("Subscription update error:", subscriptionError);
      }

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              is_admin: !currentStatus,
              subscription_plan: newPlan
            } 
          : user
      ));

      toast({
        title: "Success",
        description: `Admin status ${!currentStatus ? 'granted' : 'revoked'} and subscription updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update admin status",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (user: User) => {
    if (user.is_admin) return "bg-purple-100 text-purple-800";
    if (user.email_confirmed_at) return "bg-green-100 text-green-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getStatusText = (user: User) => {
    if (user.is_admin) return "Admin";
    if (user.email_confirmed_at) return "Active";
    return "Pending";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading users...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          User Management
        </CardTitle>
        <CardDescription>
          View and manage user accounts ({users.length} total users)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total Users</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">{users.length}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Admin Users</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {users.filter(u => u.is_admin).length}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Professional</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {users.filter(u => u.subscription_plan === 'Professional').length}
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Free Plan</span>
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {users.filter(u => u.subscription_plan === 'Free').length}
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user)}>
                        {getStatusText(user)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.subscription_plan === 'Professional' ? 'default' : 'secondary'}>
                        {user.subscription_plan || 'Free'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.default_currency || 'USD'}</TableCell>
                    <TableCell>
                      <div className="text-sm flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(user.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={user.is_admin ? "destructive" : "default"}
                        onClick={() => toggleAdminStatus(user.id, user.is_admin || false)}
                      >
                        {user.is_admin ? (
                          <>
                            <UserX className="w-3 h-3 mr-1" />
                            Revoke Admin
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3 h-3 mr-1" />
                            Make Admin
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
