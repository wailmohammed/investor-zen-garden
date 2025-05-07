
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Bitcoin, Ethereum, Wallet, CreditCard } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';

const cryptoOptions = [
  { id: 'btc', name: 'Bitcoin (BTC)', icon: <Bitcoin className="h-6 w-6" />, address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5' },
  { id: 'eth', name: 'Ethereum (ETH)', icon: <Ethereum className="h-6 w-6" />, address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' },
  { id: 'xrp', name: 'Ripple (XRP)', icon: <CreditCard className="h-6 w-6" />, address: 'rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh' },
  { id: 'dog', name: 'Dogecoin (DOGE)', icon: <Wallet className="h-6 w-6" />, address: 'D8vFz4p1L37jdg9Hm1DdeZ5vxbY7NphHwU' },
  { id: 'sol', name: 'Solana (SOL)', icon: <CreditCard className="h-6 w-6" />, address: '5YNmRHBD3FQ9dJhYzuJ3tRYKPJ8gjE1GgakhrfxkUB7q' },
  { id: 'usdt', name: 'Tether (USDT)', icon: <CreditCard className="h-6 w-6" />, address: 'TEaLa1dmcmvRpYK7ZWjByh1nqK4xvL7qxB' }
];

interface PaymentForm {
  amount: string;
  cryptoType: string;
}

const CryptoPayment = () => {
  const [selectedCrypto, setSelectedCrypto] = useState(cryptoOptions[0]);
  const [step, setStep] = useState<'select' | 'confirm' | 'complete'>('select');
  const [formData, setFormData] = useState<PaymentForm>({
    amount: '100',
    cryptoType: 'btc'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCryptoSelect = (crypto: typeof cryptoOptions[0]) => {
    setSelectedCrypto(crypto);
    setFormData({...formData, cryptoType: crypto.id});
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, amount: e.target.value});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }
    
    setStep('confirm');
  };

  const handleConfirmPayment = async () => {
    try {
      setLoading(true);
      
      // Record the payment in Supabase
      const { error } = await supabase.from('crypto_payments').insert({
        user_id: user?.id,
        amount: parseFloat(formData.amount),
        crypto_type: formData.cryptoType,
        status: 'pending',
        wallet_address: selectedCrypto.address
      });
      
      if (error) throw error;
      
      // In a real app, you might integrate with a crypto payment service here
      
      toast({
        title: "Payment initiated",
        description: "Please send the crypto to the provided address.",
      });
      
      setStep('complete');
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-6">Crypto Payment</h1>
        
        {step === 'select' && (
          <Card>
            <CardHeader>
              <CardTitle>Select Payment Method</CardTitle>
              <CardDescription>Choose your preferred cryptocurrency</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="crypto" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
                  <TabsTrigger value="fiat" disabled>Fiat (Coming Soon)</TabsTrigger>
                </TabsList>
                <TabsContent value="crypto" className="mt-4">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (USD)</Label>
                      <Input 
                        id="amount"
                        type="number" 
                        placeholder="Enter amount" 
                        value={formData.amount}
                        onChange={handleAmountChange}
                        min="1"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Select Cryptocurrency</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {cryptoOptions.map((crypto) => (
                          <div 
                            key={crypto.id}
                            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedCrypto.id === crypto.id 
                                ? 'bg-primary/10 border-primary' 
                                : 'hover:bg-accent'
                            }`}
                            onClick={() => handleCryptoSelect(crypto)}
                          >
                            <div className="mr-3">{crypto.icon}</div>
                            <div>
                              <p className="font-medium">{crypto.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full">Continue to Payment</Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
        
        {step === 'confirm' && (
          <Card>
            <CardHeader>
              <CardTitle>Confirm Payment</CardTitle>
              <CardDescription>Please review your payment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <p className="text-sm font-medium">Amount</p>
                <p className="text-2xl font-bold">${formData.amount} USD</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Payment Method</p>
                <div className="flex items-center">
                  {selectedCrypto.icon}
                  <span className="ml-2">{selectedCrypto.name}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Send to this address:</p>
                <div className="p-3 bg-accent rounded-md break-all font-mono text-sm">
                  {selectedCrypto.address}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedCrypto.address);
                    toast({
                      title: "Address copied",
                      description: "The wallet address has been copied to your clipboard.",
                    });
                  }}
                >
                  Copy Address
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                className="w-full" 
                disabled={loading}
                onClick={handleConfirmPayment}
              >
                {loading ? "Processing..." : "I've sent the payment"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setStep('select')}
                disabled={loading}
              >
                Go Back
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {step === 'complete' && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Initiated</CardTitle>
              <CardDescription>We're waiting for your transaction to be confirmed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center py-6">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Wallet className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Transaction Pending</h3>
                <p className="text-center text-muted-foreground">
                  We'll notify you once your payment of ${formData.amount} in {selectedCrypto.name} is confirmed.
                  This typically takes 10-60 minutes depending on the network.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => navigate('/dashboard')}
              >
                Return to Dashboard
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CryptoPayment;
