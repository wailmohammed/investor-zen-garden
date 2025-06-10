
import DashboardLayout from "@/components/DashboardLayout";
import PortfolioManager from "@/components/Portfolio/PortfolioManager";

const Portfolio = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Management</h1>
          <p className="text-muted-foreground">Create and manage your investment portfolios</p>
        </div>

        <PortfolioManager />
      </div>
    </DashboardLayout>
  );
};

export default Portfolio;
