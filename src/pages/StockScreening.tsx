
import DashboardLayout from "@/components/DashboardLayout";
import StockScreener from "@/components/StockScreener/StockScreener";
import { PortfolioProvider } from "@/contexts/PortfolioContext";

const StockScreening = () => {
  return (
    <PortfolioProvider>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Stock Screener</h1>
            <p className="text-muted-foreground">Find the best dividend stocks based on your criteria</p>
          </div>

          <StockScreener />
        </div>
      </DashboardLayout>
    </PortfolioProvider>
  );
};

export default StockScreening;
