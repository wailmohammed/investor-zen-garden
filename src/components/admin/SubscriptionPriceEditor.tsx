
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

const initialTiers = [
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

const SubscriptionPriceEditor = () => {
  const { user } = useAuth();
  const [tiers, setTiers] = useState<PricingTier[]>(initialTiers);
  const [currentPromo, setCurrentPromo] = useState({
    code: "SUMMER2025",
    discount: "20",
    expiry: "2025-08-31",
    active: true
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleTierChange = (index: number, field: keyof PricingTier, value: any) => {
    const newTiers = [...tiers];
    if (field === 'features') {
      value = value.split('\n');
    }
    newTiers[index] = { ...newTiers[index], [field]: value };
    setTiers(newTiers);
  };

  const handleHighlightChange = (index: number) => {
    const newTiers = tiers.map((tier, i) => ({
      ...tier,
      highlighted: i === index
    }));
    setTiers(newTiers);
  };

  const handlePromoChange = (field: string, value: any) => {
    setCurrentPromo({ ...currentPromo, [field]: value });
  };

  const savePricingChanges = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would save to Supabase
      // const { error } = await supabase
      //   .from('pricing_tiers')
      //   .upsert(tiers.map((tier, index) => ({ ...tier, id: index + 1 })));
      
      // if (error) throw error;

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Pricing plans have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to update pricing plans: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const savePromoChanges = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would save to Supabase
      // const { error } = await supabase
      //   .from('promo_codes')
      //   .upsert([{ ...currentPromo, id: 1 }]);
      
      // if (error) throw error;

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Promotion code has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to update promotion code: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>
            Update the pricing and features for each subscription tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tiers.map((tier, index) => (
            <div key={index} className="mb-8 p-4 border rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor={`name-${index}`}>Plan Name</Label>
                  <Input 
                    id={`name-${index}`}
                    value={tier.name}
                    onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`price-${index}`}>Price</Label>
                  <Input 
                    id={`price-${index}`}
                    value={tier.price}
                    onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <Label htmlFor={`description-${index}`}>Description</Label>
                <Input 
                  id={`description-${index}`}
                  value={tier.description}
                  onChange={(e) => handleTierChange(index, 'description', e.target.value)}
                />
              </div>
              
              <div className="mb-4">
                <Label htmlFor={`features-${index}`}>Features (one per line)</Label>
                <Textarea 
                  id={`features-${index}`}
                  value={tier.features.join('\n')}
                  onChange={(e) => handleTierChange(index, 'features', e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor={`cta-${index}`}>Call to Action</Label>
                  <Input 
                    id={`cta-${index}`}
                    value={tier.cta}
                    onChange={(e) => handleTierChange(index, 'cta', e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={tier.highlighted}
                    onCheckedChange={() => handleHighlightChange(index)}
                    id={`highlight-${index}`}
                  />
                  <Label htmlFor={`highlight-${index}`}>Highlight as Featured Plan</Label>
                </div>
              </div>
            </div>
          ))}
          
          <Button 
            onClick={savePricingChanges} 
            className="w-full mt-4"
            disabled={isLoading}
          >
            {isLoading ? "Saving Changes..." : "Save Pricing Changes"}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Promotion Management</CardTitle>
          <CardDescription>
            Create and manage promotional discount codes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="promo-code">Promo Code</Label>
              <Input 
                id="promo-code"
                value={currentPromo.code}
                onChange={(e) => handlePromoChange('code', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="discount">Discount Percentage</Label>
              <Input 
                id="discount"
                type="number"
                value={currentPromo.discount}
                onChange={(e) => handlePromoChange('discount', e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input 
                id="expiry"
                type="date"
                value={currentPromo.expiry}
                onChange={(e) => handlePromoChange('expiry', e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 pt-7">
              <Switch 
                checked={currentPromo.active}
                onCheckedChange={(checked) => handlePromoChange('active', checked)}
                id="active-promo"
              />
              <Label htmlFor="active-promo">Active</Label>
            </div>
          </div>
          
          <Button 
            onClick={savePromoChanges} 
            className="w-full mt-4"
            disabled={isLoading}
          >
            {isLoading ? "Saving Promo..." : "Save Promotion"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionPriceEditor;
