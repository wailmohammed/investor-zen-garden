
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useToast } from "@/hooks/use-toast";
import { addSampleDividendData } from "@/utils/sampleDividendData";
import { Database, Plus, RefreshCw } from "lucide-react";

const SampleDataButton = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleAddSampleData = async () => {
    if (!user?.id || !selectedPortfolio) {
      toast({
        title: "Error",
        description: "Please select a portfolio first",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const result = await addSampleDividendData(user.id, selectedPortfolio);
      
      toast({
        title: "Sample Data Added",
        description: `Added ${result.count} sample dividend stocks to your portfolio`,
        variant: "default",
      });

      // Refresh the page to show new data
      window.location.reload();
    } catch (error) {
      console.error('Error adding sample data:', error);
      toast({
        title: "Error",
        description: "Failed to add sample data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleAddSampleData}
      disabled={loading || !user?.id || !selectedPortfolio}
      className="bg-green-600 hover:bg-green-700"
    >
      {loading ? (
        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Plus className="h-4 w-4 mr-2" />
      )}
      Add Sample Dividend Data
    </Button>
  );
};

export { SampleDataButton };
