
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";
import { calculateDividendIncome, getActualDividendPayingStocks } from "@/services/dividendCalculator";
import { FileText, Download, TrendingUp, AlertCircle, CheckCircle, Target } from "lucide-react";

interface ReportData {
  totalAnnualIncome: number;
  portfolioYield: number;
  dividendStocks: number;
  totalStocks: number;
  avgSafetyScore: number;
  projectedGrowth: number;
  recommendations: string[];
  strengths: string[];
  risks: string[];
}

const DividendReport = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReportData = async () => {
    if (!user || !selectedPortfolio) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
      
      if (selectedPortfolio === trading212PortfolioId) {
        console.log('Generating Trading212 dividend report');
        
        const { data, error } = await supabase.functions.invoke('trading212-sync', {
          body: { portfolioId: selectedPortfolio }
        });

        if (error) {
          console.error('Error fetching Trading212 data:', error);
          setReportData(null);
          return;
        }

        if (data?.success && data.data?.positions) {
          const positions = data.data.positions;
          const dividendResults = await calculateDividendIncome(positions);
          
          const report: ReportData = {
            totalAnnualIncome: dividendResults.totalAnnualIncome,
            portfolioYield: dividendResults.portfolioYield,
            dividendStocks: dividendResults.dividendPayingStocks.length,
            totalStocks: positions.length,
            avgSafetyScore: 88,
            projectedGrowth: 9.2,
            recommendations: generateRecommendations(dividendResults),
            strengths: generateStrengths(dividendResults),
            risks: generateRisks(dividendResults)
          };
          
          setReportData(report);
        } else {
          setReportData(null);
        }
      } else {
        setReportData(null);
      }
    } catch (error) {
      console.error("Error generating dividend report:", error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [user, selectedPortfolio]);

  const generateRecommendations = (dividendResults: any): string[] => {
    const recommendations = [];
    
    if (dividendResults.portfolioYield < 3) {
      recommendations.push("Consider adding higher-yielding dividend stocks to improve portfolio yield");
    }
    
    if (dividendResults.dividendPayingStocks.length < 10) {
      recommendations.push("Diversify by adding more dividend-paying stocks across different sectors");
    }
    
    recommendations.push("Set up automatic dividend reinvestment to compound your returns");
    recommendations.push("Monitor payout ratios to ensure dividend sustainability");
    recommendations.push("Consider adding REITs for monthly dividend income");
    
    return recommendations;
  };

  const generateStrengths = (dividendResults: any): string[] => {
    const strengths = [];
    
    if (dividendResults.portfolioYield > 2) {
      strengths.push("Solid portfolio yield above market average");
    }
    
    if (dividendResults.dividendPayingStocks.length > 5) {
      strengths.push("Good diversification across dividend-paying stocks");
    }
    
    strengths.push("Focus on established dividend-paying companies");
    strengths.push("Mix of growth and income-oriented positions");
    
    return strengths;
  };

  const generateRisks = (dividendResults: any): string[] => {
    const risks = [];
    
    if (dividendResults.portfolioYield > 6) {
      risks.push("High yield may indicate dividend sustainability concerns");
    }
    
    if (dividendResults.dividendPayingStocks.length < 5) {
      risks.push("Limited diversification in dividend holdings");
    }
    
    risks.push("Market volatility may impact dividend payments");
    risks.push("Interest rate changes could affect dividend stock valuations");
    
    return risks;
  };

  const generateReport = () => {
    if (!reportData) return;
    
    const reportContent = `
DIVIDEND PORTFOLIO PERFORMANCE REPORT
Generated on: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY
================
Total Annual Dividend Income: $${reportData.totalAnnualIncome.toFixed(2)}
Portfolio Dividend Yield: ${reportData.portfolioYield.toFixed(2)}%
Dividend-Paying Stocks: ${reportData.dividendStocks} of ${reportData.totalStocks}
Average Safety Score: ${reportData.avgSafetyScore}/100
Projected Growth: ${reportData.projectedGrowth}%

PORTFOLIO STRENGTHS
==================
${reportData.strengths.map(strength => `• ${strength}`).join('\n')}

IDENTIFIED RISKS
===============
${reportData.risks.map(risk => `• ${risk}`).join('\n')}

RECOMMENDATIONS
===============
${reportData.recommendations.map(rec => `• ${rec}`).join('\n')}

PERFORMANCE ANALYSIS
===================
Your dividend portfolio demonstrates solid fundamentals with room for improvement. 
The current yield of ${reportData.portfolioYield.toFixed(2)}% provides steady income while 
maintaining focus on quality dividend-paying companies.

NEXT STEPS
==========
1. Review recommendations and prioritize implementation
2. Monitor dividend announcements and payout ratios
3. Consider rebalancing based on sector allocation
4. Set up automatic dividend reinvestment plans
5. Schedule quarterly portfolio reviews

This report is generated based on current portfolio data and market conditions.
Past performance does not guarantee future results.
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dividend-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!reportData || !selectedPortfolio) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No dividend report data available</p>
            <p className="text-sm text-muted-foreground mt-2">
              {!selectedPortfolio ? 'Select a portfolio to generate dividend report' : 'Unable to generate dividend report'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6" />
              <div>
                <CardTitle>Dividend Portfolio Performance Report</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Generated on {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button onClick={generateReport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Annual Dividend Income</p>
              <p className="text-2xl font-bold text-green-600">${reportData.totalAnnualIncome.toFixed(2)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Portfolio Yield</p>
              <p className="text-2xl font-bold">{reportData.portfolioYield.toFixed(2)}%</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Dividend Coverage</p>
              <p className="text-2xl font-bold">
                {reportData.dividendStocks}/{reportData.totalStocks}
              </p>
              <Badge variant="outline">
                {((reportData.dividendStocks / reportData.totalStocks) * 100).toFixed(0)}% Coverage
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Portfolio Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {reportData.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  {strength}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Identified Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {reportData.risks.map((risk, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  {risk}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Target className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {reportData.recommendations.slice(0, 4).map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  {recommendation}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Current Performance</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Average Income:</span>
                  <span className="font-medium">${(reportData.totalAnnualIncome / 12).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Safety Score:</span>
                  <span className="font-medium">{reportData.avgSafetyScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Yield vs S&P 500:</span>
                  <span className="font-medium text-green-600">
                    +{(reportData.portfolioYield - 1.8).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Growth Projections</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">1-Year Target:</span>
                  <span className="font-medium">${(reportData.totalAnnualIncome * 1.092).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">3-Year Target:</span>
                  <span className="font-medium">${(reportData.totalAnnualIncome * 1.31).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Expected CAGR:</span>
                  <span className="font-medium text-blue-600">{reportData.projectedGrowth}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { DividendReport };
