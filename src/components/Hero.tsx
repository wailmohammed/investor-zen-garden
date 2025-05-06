
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
              Smart Investment Analytics for Modern Investors
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Make data-driven decisions with our powerful portfolio tracking, analysis tools, and personalized insights.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button className="bg-finance-blue hover:bg-blue-700 text-white px-6 py-3 text-base">
                Get Started Free
              </Button>
              <Button variant="outline" className="px-6 py-3 text-base">
                See Demo
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative bg-white p-6 rounded-xl shadow-xl">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-finance-blue text-white rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-900">Portfolio Summary</h3>
                    <span className="text-sm text-finance-blue">View Details</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-3">
                      <span className="text-gray-600">Total Value</span>
                      <span className="font-semibold">$254,872.65</span>
                    </div>
                    <div className="flex justify-between mb-3">
                      <span className="text-gray-600">Today's Change</span>
                      <span className="text-finance-green font-medium">+$1,243.32 (+0.49%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Return</span>
                      <span className="text-finance-green font-medium">+$45,631.28 (+21.8%)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="h-40 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-gray-400">Portfolio Chart</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-100 p-3 rounded">
                      <div className="text-xs text-gray-500">Stocks</div>
                      <div className="font-medium">65%</div>
                    </div>
                    <div className="bg-gray-100 p-3 rounded">
                      <div className="text-xs text-gray-500">Bonds</div>
                      <div className="font-medium">25%</div>
                    </div>
                    <div className="bg-gray-100 p-3 rounded">
                      <div className="text-xs text-gray-500">Cash</div>
                      <div className="font-medium">10%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
