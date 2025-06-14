
import DashboardLayout from "@/components/DashboardLayout";
import { DividendOverview } from "@/components/Dividends/DividendOverview";
import { DividendPerformanceTable } from "@/components/Dividends/DividendPerformanceTable";
import DividendCalendar from "@/components/Dividends/DividendCalendar";
import DividendSafetyScores from "@/components/Dividends/DividendSafetyScores";
import { DividendGrowth } from "@/components/Dividends/DividendGrowth";
import { DividendScores } from "@/components/Dividends/DividendScores";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortfolioProvider } from "@/contexts/PortfolioContext";

const Dividends = () => {
  return (
    <PortfolioProvider>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Dividend Analytics</h1>
            <p className="text-muted-foreground">Track, analyze and optimize your dividend income</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="safety">Safety Scores</TabsTrigger>
              <TabsTrigger value="growth">Growth</TabsTrigger>
              <TabsTrigger value="scores">Scores</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <DividendOverview />
            </TabsContent>

            <TabsContent value="calendar">
              <DividendCalendar />
            </TabsContent>

            <TabsContent value="performance">
              <DividendPerformanceTable />
            </TabsContent>

            <TabsContent value="safety">
              <DividendSafetyScores />
            </TabsContent>

            <TabsContent value="growth">
              <DividendGrowth />
            </TabsContent>

            <TabsContent value="scores">
              <DividendScores />
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </PortfolioProvider>
  );
};

export default Dividends;
