
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  };

  const handleSeeDemo = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      // Navigate to demo or login page
      navigate("/login");
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-background to-muted py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Smart Investment
              <span className="block text-primary">Analytics for</span>
              <span className="block">Modern Investors</span>
            </h1>
            <p className="text-xl text-muted-foreground mt-6 leading-relaxed">
              Make data-driven decisions with our powerful portfolio tracking, 
              analysis tools, and personalized insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
                onClick={handleGetStarted}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-3"
                onClick={handleSeeDemo}
              >
                See Demo
              </Button>
            </div>
            <div className="flex items-center gap-8 mt-12">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Real-time tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Bank-level security</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Advanced analytics</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-card border rounded-xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Portfolio Summary</h3>
                <span className="text-sm text-primary font-medium">View Details</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                  <div className="text-2xl font-bold">$254,872.65</div>
                </div>
                <div className="flex justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Today's Change</div>
                    <div className="text-sm font-medium text-green-600">+$1,243.32 (+0.49%)</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Return</div>
                    <div className="text-sm font-medium text-green-600">+$45,631.28 (+21.8%)</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm font-medium mb-2">Portfolio Chart</div>
                  <div className="flex gap-1 h-8">
                    <div className="bg-primary rounded flex-1"></div>
                    <div className="bg-primary/70 rounded flex-1"></div>
                    <div className="bg-primary/40 rounded flex-1"></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Stocks</span>
                    <span>Bonds</span>
                    <span>Cash</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
