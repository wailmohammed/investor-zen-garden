
import { BarChart, Database, Shield } from "lucide-react";

const features = [
  {
    name: 'Portfolio Tracking',
    description: 'Automatically sync and monitor all your investments in one place with real-time updates.',
    icon: Database,
  },
  {
    name: 'Advanced Analytics',
    description: 'Get deep insights with performance metrics, risk analysis, and projected future growth.',
    icon: BarChart,
  },
  {
    name: 'Security & Privacy',
    description: 'Your financial data is protected with bank-level security and encryption standards.',
    icon: Shield,
  },
];

const FeatureSection = () => {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            All the tools you need to invest smarter
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Our platform provides a comprehensive suite of investment tools designed for both beginners and experienced investors.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.name} className="bg-gray-50 rounded-xl p-8 transition-all hover:shadow-md">
              <div className="inline-flex items-center justify-center rounded-md bg-finance-blue p-2 text-white mb-5">
                <feature.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.name}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gray-50 rounded-xl p-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-finance-blue/10 transform -skew-x-12 translate-x-1/4 hidden lg:block"></div>
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Performance Dashboard</h3>
              <p className="text-gray-600 mb-6">
                Get a clear view of your portfolio's performance with our interactive dashboard. Track key metrics, visualize trends, and identify opportunities to optimize your investments.
              </p>
              <ul className="space-y-3">
                {['Real-time portfolio valuation', 'Historical performance tracking', 'Dividend tracking and reinvestment analysis', 'Detailed asset allocation breakdown'].map((item) => (
                  <li key={item} className="flex items-start">
                    <svg className="h-5 w-5 text-finance-green mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-400">Dashboard Preview</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;
