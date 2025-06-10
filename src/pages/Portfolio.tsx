
import DashboardLayout from "@/components/DashboardLayout";
import PortfolioManager from "@/components/Portfolio/PortfolioManager";
import WatchlistManager from "@/components/Portfolio/WatchlistManager";

const Portfolio = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Portfolio & Watchlist Management</h1>
          <p className="text-muted-foreground">Create and manage your investment portfolios and watchlists</p>
        </div>

        <div className="grid gap-6">
          <PortfolioManager />
          <WatchlistManager />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Portfolio;
