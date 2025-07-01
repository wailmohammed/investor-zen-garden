
import React, { useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CreditCard, Shield, CheckCircle, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const CryptoPayment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('Premium');
  const [paymentMethod, setPaymentMethod] = useState<'bitcoin' | 'ethereum' | 'usdt'>('bitcoin');

  const plans = [
    {
      name: 'Premium',
      price: '$19',
      cryptoPrice: { bitcoin: '0.0003 BTC', ethereum: '0.006 ETH', usdt: '19 USDT' },
      description: 'Advanced tools for active investors',
      features: [
        'Up to 10 portfolios',
        'Unlimited investment tracking',
        'Advanced analytics and reports',
        'Real-time data updates',
        'Dividend tracking and forecasting',
        'Custom watchlists',
        'Tax optimization suggestions',
        'Priority email & chat support',
      ],
      highlighted: true,
    },
    {
      name: 'Professional',
      price: '$39',
      cryptoPrice: { bitcoin: '0.0006 BTC', ethereum: '0.012 ETH', usdt: '39 USDT' },
      description: 'For serious investors and professionals',
      features: [
        'All Premium features',
        'Unlimited portfolios',
        'API access',
        'Advanced screening tools',
        'Portfolio risk analysis',
        'Priority phone support',
        'Dedicated account manager',
      ],
      highlighted: false,
    }
  ];

  const currentPlan = plans.find(p => p.name === selectedPlan);

  const handleCryptoPayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to process payment",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Record the crypto payment intent
      const { data, error } = await supabase
        .from('crypto_payments')
        .insert({
          user_id: user.id,
          amount: selectedPlan === 'Premium' ? 19 : 39,
          currency: paymentMethod.toUpperCase(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Simulate crypto payment processing
      toast({
        title: "Crypto Payment Initiated",
        description: `Please send ${currentPlan?.cryptoPrice[paymentMethod]} to the wallet address shown below`,
      });

    } catch (error: any) {
      console.error('Crypto payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate crypto payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const cryptoWallets = {
    bitcoin: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    ethereum: '0x742d35Cc6634C0532925a3b8D17B2ba2e9F0d8B5',
    usdt: '0x742d35Cc6634C0532925a3b8D17B2ba2e9F0d8B5'
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Crypto Payment</h1>
            <p className="text-muted-foreground">
              Pay for your subscription using cryptocurrency
            </p>
          </div>
        </div>

        {/* Plan Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Select Your Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {plans.map((plan) => (
                <div 
                  key={plan.name}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedPlan === plan.name 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan(plan.name)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <div className="text-right">
                      <div className="text-xl font-bold">{plan.price}</div>
                      <div className="text-sm text-muted-foreground">/month</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                  <div className="space-y-1">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{plan.features.length - 3} more features
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Crypto Method Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Cryptocurrency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {(['bitcoin', 'ethereum', 'usdt'] as const).map((crypto) => (
                <div
                  key={crypto}
                  className={`p-4 border rounded-lg cursor-pointer text-center transition-all ${
                    paymentMethod === crypto
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod(crypto)}
                >
                  <div className="font-semibold capitalize mb-1">{crypto}</div>
                  <div className="text-sm text-muted-foreground">
                    {currentPlan?.cryptoPrice[crypto]}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Payment Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Send exactly <strong>{currentPlan?.cryptoPrice[paymentMethod]}</strong> to the wallet address below
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {paymentMethod.toUpperCase()} Wallet Address:
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono">
                  {cryptoWallets[paymentMethod]}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(cryptoWallets[paymentMethod]);
                    toast({
                      title: "Copied!",
                      description: "Wallet address copied to clipboard",
                    });
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Important Notes:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Send the exact amount to avoid payment delays</li>
                <li>• Payment confirmation may take 10-60 minutes</li>
                <li>• Your subscription will be activated automatically after confirmation</li>
                <li>• Contact support if you don't receive confirmation within 2 hours</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Confirm Payment Button */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Total Amount</div>
                <div className="text-sm text-muted-foreground">
                  {currentPlan?.price}/month • {currentPlan?.cryptoPrice[paymentMethod]}
                </div>
              </div>
              <Button 
                onClick={handleCryptoPayment}
                disabled={isProcessing || !user}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    I've Sent Payment
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CryptoPayment;
