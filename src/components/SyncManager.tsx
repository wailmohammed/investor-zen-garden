
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Database, TrendingUp, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface SyncLog {
  id: string;
  broker_type: string;
  sync_type: string;
  status: string;
  positions_added: number;
  positions_updated: number;
  error_message?: string;
  created_at: string;
}

interface SyncSchedule {
  broker_type: string;
  last_auto_sync?: string;
  sync_count_today: number;
  is_enabled: boolean;
}

interface SyncManagerProps {
  portfolioId: string;
}

const SyncManager: React.FC<SyncManagerProps> = ({ portfolioId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [syncSchedules, setSyncSchedules] = useState<SyncSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (portfolioId && user) {
      loadSyncData();
    }
  }, [portfolioId, user]);

  const loadSyncData = async () => {
    try {
      setIsLoading(true);
      
      // Load sync logs
      const { data: logs, error: logsError } = await supabase
        .from('api_sync_logs')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (logsError) throw logsError;
      setSyncLogs(logs || []);

      // Load sync schedules
      const { data: schedules, error: schedulesError } = await supabase
        .from('auto_sync_schedule')
        .select('*')
        .eq('portfolio_id', portfolioId);

      if (schedulesError) throw schedulesError;
      setSyncSchedules(schedules || []);

    } catch (error) {
      console.error('Error loading sync data:', error);
      toast({
        title: "Error",
        description: "Failed to load sync data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutoSync = async (brokerType: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('auto_sync_schedule')
        .upsert({
          user_id: user?.id,
          portfolio_id: portfolioId,
          broker_type: brokerType,
          is_enabled: enabled
        });

      if (error) throw error;

      toast({
        title: enabled ? "Auto-sync Enabled" : "Auto-sync Disabled",
        description: `Auto-sync for ${brokerType} has been ${enabled ? 'enabled' : 'disabled'}`,
      });
      
      loadSyncData();
    } catch (error) {
      console.error('Error toggling auto-sync:', error);
      toast({
        title: "Error",
        description: "Failed to update auto-sync settings",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      failed: 'destructive',
      pending: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Clock className="h-6 w-6 animate-spin mr-2" />
          Loading sync data...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Synchronization Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="logs">Sync Logs</TabsTrigger>
              <TabsTrigger value="schedule">Auto-Sync</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  Data automatically syncs 4 times per day (every 6 hours) to provide fresh information while respecting API limits.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Trading212</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {syncSchedules.find(s => s.broker_type === 'trading212') && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Today's syncs:</span>
                          <span>{syncSchedules.find(s => s.broker_type === 'trading212')?.sync_count_today || 0}/4</span>
                        </div>
                        <Progress 
                          value={(syncSchedules.find(s => s.broker_type === 'trading212')?.sync_count_today || 0) * 25} 
                          className="h-2" 
                        />
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      Auto-sync active - next sync scheduled automatically
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Binance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {syncSchedules.find(s => s.broker_type === 'binance') && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Today's syncs:</span>
                          <span>{syncSchedules.find(s => s.broker_type === 'binance')?.sync_count_today || 0}/4</span>
                        </div>
                        <Progress 
                          value={(syncSchedules.find(s => s.broker_type === 'binance')?.sync_count_today || 0) * 25} 
                          className="h-2" 
                        />
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      Auto-sync active - next sync scheduled automatically
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <div className="space-y-3">
                {syncLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No sync logs found for this portfolio
                  </p>
                ) : (
                  syncLogs.map((log) => (
                    <Card key={log.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(log.status)}
                            <div>
                              <div className="font-medium">
                                {log.broker_type} - {log.sync_type} sync
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(log.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            {getStatusBadge(log.status)}
                            {log.status === 'success' && (
                              <div className="text-xs text-muted-foreground">
                                +{log.positions_added} added, ~{log.positions_updated} updated
                              </div>
                            )}
                            {log.error_message && (
                              <div className="text-xs text-red-600 max-w-48 truncate">
                                {log.error_message}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Auto-sync automatically fetches new data every 6 hours (4 times per day) 
                  to stay within API rate limits and provide fresh data.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {['trading212', 'binance'].map((brokerType) => {
                  const schedule = syncSchedules.find(s => s.broker_type === brokerType);
                  return (
                    <Card key={brokerType}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium capitalize">{brokerType}</h4>
                            <p className="text-sm text-muted-foreground">
                              {schedule?.last_auto_sync 
                                ? `Last sync: ${new Date(schedule.last_auto_sync).toLocaleString()}`
                                : 'Syncing automatically every 6 hours'
                              }
                            </p>
                          </div>
                          <Badge variant={schedule?.is_enabled ? "default" : "secondary"}>
                            {schedule?.is_enabled ? "Active" : "Disabled"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SyncManager;
