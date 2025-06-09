
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type BrokerStatus = 'not_connected' | 'connected' | 'error';

interface BrokerCardProps {
  name: string;
  description: string;
  logo: string;
  status: BrokerStatus;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function BrokerCard({ 
  name, 
  description, 
  logo, 
  status: initialStatus,
  onConnect,
  onDisconnect
}: BrokerCardProps) {
  const [status, setStatus] = useState<BrokerStatus>(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    
    // Simulate connection process
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStatus('connected');
      toast.success(`Successfully connected to ${name}!`);
      onConnect?.();
    } catch (error) {
      setStatus('error');
      toast.error(`Failed to connect to ${name}. Please check your credentials.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setStatus('not_connected');
    toast.success(`Disconnected from ${name}`);
    onDisconnect?.();
  };

  return (
    <Card className="overflow-hidden border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded flex items-center justify-center bg-gray-100">
            <img 
              src={logo} 
              alt={`${name} logo`} 
              className="w-6 h-6"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
                (e.target as HTMLImageElement).onerror = null;
              }}
            />
          </div>
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            {status === 'connected' && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Connected
              </Badge>
            )}
            {status === 'error' && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Error
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardContent>
      <CardFooter className="border-t bg-gray-50 py-2">
        {status === 'connected' ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={handleDisconnect}
            disabled={loading}
          >
            Disconnect
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={handleConnect}
            disabled={loading}
          >
            {loading ? 'Connecting...' : 'Connect'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
