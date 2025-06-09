
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  status,
  onConnect,
  onDisconnect
}: BrokerCardProps) {
  const handleConnect = () => {
    onConnect?.();
  };

  const handleDisconnect = () => {
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
          >
            Disconnect
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={handleConnect}
          >
            Connect
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
