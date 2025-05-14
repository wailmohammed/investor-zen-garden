
import React, { useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { DividendOverview } from "@/components/Dividends/DividendOverview";
import { DividendGrowth } from "@/components/Dividends/DividendGrowth";
import { DividendScores } from "@/components/Dividends/DividendScores";
import { DividendReport } from "@/components/Dividends/DividendReport";

const DividendStats = () => {
  const { defaultCurrency } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("overview");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dividend Statistics</h1>
            <p className="text-muted-foreground">Detailed analysis of your dividend income and portfolio</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Currency: {defaultCurrency}</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="growth">Growth Analysis</TabsTrigger>
            <TabsTrigger value="scores">Safety Scores</TabsTrigger>
            <TabsTrigger value="report">Performance Report</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <DividendOverview />
          </TabsContent>
          
          <TabsContent value="growth" className="space-y-6">
            <DividendGrowth />
          </TabsContent>
          
          <TabsContent value="scores" className="space-y-6">
            <DividendScores />
          </TabsContent>
          
          <TabsContent value="report" className="space-y-6">
            <DividendReport />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DividendStats;
