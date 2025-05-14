
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingSection from "@/components/PricingSection";
import PricingComparison from "@/components/PricingComparison";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Pricing = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>Pricing - InvestorZen</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold mb-6">Pricing Plans</h1>
            <p className="text-xl text-gray-600">
              Choose the perfect plan for your investment journey. Upgrade anytime as your needs evolve.
            </p>
          </div>
          
          <Tabs defaultValue="cards" className="w-full mb-12">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="cards">Pricing Cards</TabsTrigger>
              <TabsTrigger value="comparison">Feature Comparison</TabsTrigger>
            </TabsList>
            <TabsContent value="cards">
              <PricingSection />
            </TabsContent>
            <TabsContent value="comparison">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-6 text-center">Compare Plans and Features</h2>
                <PricingComparison />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="max-w-3xl mx-auto mt-16 bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Can I switch plans later?</h3>
                <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Is there a discount for annual subscriptions?</h3>
                <p className="text-gray-600">Yes, you can save 20% by choosing annual billing for any of our paid plans.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Do you offer educational discounts?</h3>
                <p className="text-gray-600">We offer a 50% discount for students and educators. Contact our support team with proof of academic status to apply.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">How does the free trial work?</h3>
                <p className="text-gray-600">Your 14-day free trial starts when you register. You can cancel anytime during this period without being charged.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;
