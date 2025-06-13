
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { PortfolioSelector } from "@/components/ui/portfolio-selector";

interface Portfolio {
  id: string;
  name: string;
  description?: string;
  is_default: boolean;
}

const Settings = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [defaultPortfolio, setDefaultPortfolio] = useState<string>('');
  const [settings, setSettings] = useState({
    defaultCurrency: "USD",
    emailNotifications: true,
  });

  // Fetch portfolios and settings
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        // Fetch portfolios
        const { data: portfoliosData, error: portfoliosError } = await supabase
          .from('portfolios')
          .select('*')
          .eq('user_id', user.id)
          .order('name');

        if (portfoliosError) throw portfoliosError;
        
        setPortfolios(portfoliosData || []);
        
        // Set current default portfolio
        const defaultPortfolioData = portfoliosData?.find(p => p.is_default);
        if (defaultPortfolioData) {
          setDefaultPortfolio(defaultPortfolioData.id);
        }

        // Fetch user profile settings
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('default_currency')
          .eq('id', user.id)
          .single();

        if (!profileError && profileData) {
          setSettings(prev => ({
            ...prev,
            defaultCurrency: profileData.default_currency || 'USD'
          }));
        }
      } catch (error: any) {
        console.error('Error fetching settings:', error);
        toast({
          title: "Error",
          description: "Failed to load settings.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [user?.id, toast]);

  const handleCurrencyChange = async (value: string) => {
    setSettings((prev) => ({ ...prev, defaultCurrency: value }));
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ 
          default_currency: value,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);
      
      if (error) throw error;
      
      toast({
        title: "Settings updated",
        description: `Default currency set to ${value}.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDefaultPortfolioChange = async (portfolioId: string) => {
    try {
      setIsLoading(true);
      
      // First, remove default from all portfolios
      await supabase
        .from('portfolios')
        .update({ is_default: false })
        .eq('user_id', user?.id);
      
      // Then set the selected portfolio as default
      const { error } = await supabase
        .from('portfolios')
        .update({ is_default: true })
        .eq('id', portfolioId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      setDefaultPortfolio(portfolioId);
      
      // Update local state
      setPortfolios(prev => prev.map(p => ({
        ...p,
        is_default: p.id === portfolioId
      })));
      
      toast({
        title: "Default portfolio updated",
        description: "Your default portfolio has been set successfully.",
      });
    } catch (error: any) {
      console.error('Error updating default portfolio:', error);
      toast({
        title: "Failed to update default portfolio",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    toast({
      title: "Theme updated",
      description: `Theme set to ${newTheme}.`,
    });
  };

  const handleToggleChange = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    
    toast({
      title: "Setting updated",
      description: `${key} preference has been updated.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Settings</CardTitle>
              <CardDescription>
                Configure your default portfolio and investment preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {portfolios.length > 0 && (
                <div className="space-y-2">
                  <Label>Default Portfolio</Label>
                  <PortfolioSelector
                    portfolios={portfolios}
                    value={defaultPortfolio}
                    onValueChange={handleDefaultPortfolioChange}
                    placeholder="Select default portfolio"
                    disabled={isLoading}
                  />
                  <p className="text-sm text-muted-foreground">
                    This portfolio will be selected by default in the dashboard and for imports
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select
                  value={settings.defaultCurrency}
                  onValueChange={handleCurrencyChange}
                  disabled={isLoading}
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred theme or sync with your system settings
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications about account activity
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={() => handleToggleChange('emailNotifications')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Button variant="outline">Change Password</Button>
              </div>
              <div>
                <Button variant="outline">Enable Two-Factor Authentication</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
              <CardDescription>
                Manage your account data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Button variant="outline">Download My Data</Button>
              </div>
              <div>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
