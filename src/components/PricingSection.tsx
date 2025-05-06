
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Basic portfolio tracking for beginners',
    features: [
      'Track up to 10 investments',
      'Basic portfolio analytics',
      'Daily data updates',
      'Email support',
    ],
    cta: 'Start for Free',
    highlighted: false,
  },
  {
    name: 'Premium',
    price: '$19',
    description: 'Advanced tools for active investors',
    features: [
      'Unlimited investment tracking',
      'Advanced analytics and reports',
      'Real-time data updates',
      'Dividend tracking and forecasting',
      'Tax optimization suggestions',
      'Priority email & chat support',
    ],
    cta: 'Start 14-day Free Trial',
    highlighted: true,
  },
  {
    name: 'Professional',
    price: '$39',
    description: 'For serious investors and professionals',
    features: [
      'All Premium features',
      'API access',
      'Custom watchlists',
      'Advanced screening tools',
      'Portfolio risk analysis',
      'Priority phone support',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  }
];

const PricingSection = () => {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that's right for your investment needs. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <div 
              key={tier.name}
              className={`rounded-xl shadow-lg p-6 border ${tier.highlighted ? 'border-finance-blue ring-2 ring-finance-blue ring-opacity-50' : 'border-gray-200'}`}
            >
              <div className="h-full flex flex-col">
                {tier.highlighted && (
                  <div className="inline-flex rounded-full bg-finance-blue/10 px-4 py-1 text-xs font-semibold text-finance-blue uppercase tracking-wide mb-4 self-start">
                    Most Popular
                  </div>
                )}

                <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                <div className="mt-4 flex items-baseline text-gray-900">
                  <span className="text-4xl font-extrabold">{tier.price}</span>
                  <span className="ml-1 text-xl font-semibold">/month</span>
                </div>
                <p className="mt-2 text-gray-500">{tier.description}</p>

                <ul className="mt-6 space-y-4 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex">
                      <Check className="flex-shrink-0 h-5 w-5 text-finance-green" />
                      <span className="ml-3 text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Button 
                    className={`w-full ${tier.highlighted ? 'bg-finance-blue hover:bg-blue-700' : 'bg-gray-50 text-gray-800 hover:bg-gray-100'}`}
                    variant={tier.highlighted ? "default" : "outline"}
                  >
                    {tier.cta}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-gray-500">
            All plans come with a 14-day money-back guarantee. No credit card required for free plan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
