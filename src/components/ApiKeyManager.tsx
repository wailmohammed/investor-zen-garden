
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Save, Trash2 } from "lucide-react";

interface ApiKey {
  service: string;
  label: string;
  value: string;
  placeholder: string;
}

const ApiKeyManager = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      service: 'trading212',
      label: 'Trading212 API Key',
      value: '',
      placeholder: 'Enter your Trading212 API key'
    },
    {
      service: 'binance',
      label: 'Binance API Key',
      value: '',
      placeholder: 'Enter your Binance API key'
    },
    {
      service: 'binance_secret',
      label: 'Binance Secret Key',
      value: '',
      placeholder: 'Enter your Binance secret key'
    }
  ]);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = () => {
    // Load API keys from localStorage
    const savedKeys = apiKeys.map(key => ({
      ...key,
      value: localStorage.getItem(`${key.service}_api_key`) || ''
    }));
    setApiKeys(savedKeys);
  };

  const handleKeyChange = (service: string, value: string) => {
    setApiKeys(prev => prev.map(key => 
      key.service === service ? { ...key, value } : key
    ));
  };

  const saveApiKey = (service: string) => {
    const key = apiKeys.find(k => k.service === service);
    if (!key || !key.value.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem(`${service}_api_key`, key.value);
    toast({
      title: "API Key Saved",
      description: `${key.label} has been saved securely`,
    });
  };

  const deleteApiKey = (service: string) => {
    localStorage.removeItem(`${service}_api_key`);
    handleKeyChange(service, '');
    toast({
      title: "API Key Deleted",
      description: "API key has been removed",
    });
  };

  const toggleShowKey = (service: string) => {
    setShowKeys(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key Management</CardTitle>
        <CardDescription>
          Manage your broker API keys for real-time data synchronization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {apiKeys.map((key) => (
          <div key={key.service} className="space-y-3 p-4 border rounded-lg">
            <Label htmlFor={key.service}>{key.label}</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id={key.service}
                  type={showKeys[key.service] ? "text" : "password"}
                  value={key.value}
                  onChange={(e) => handleKeyChange(key.service, e.target.value)}
                  placeholder={key.placeholder}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => toggleShowKey(key.service)}
                >
                  {showKeys[key.service] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                onClick={() => saveApiKey(key.service)}
                size="sm"
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button
                onClick={() => deleteApiKey(key.service)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
            {key.value && (
              <p className="text-sm text-green-600">✓ API key configured</p>
            )}
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Security Notice</h4>
          <p className="text-sm text-blue-700">
            Your API keys are stored locally in your browser and used to fetch real-time data. 
            We recommend using read-only API keys with limited permissions for enhanced security.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeyManager;
