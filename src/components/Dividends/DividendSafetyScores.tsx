
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SafetyScore {
  symbol: string;
  company: string;
  score: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D';
  payoutRatio: number;
  dividendGrowth: number;
  yearsOfGrowth: number;
  debtToEquity: number;
  freeCashFlow: number;
  warnings: string[];
  strengths: string[];
}

const DividendSafetyScores = () => {
  const { user } = useAuth();
  const [safetyScores, setSafetyScores] = useState<SafetyScore[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'symbol' | 'grade'>('score');

  useEffect(() => {
    // Mock safety scores - in real app this would come from API
    const mockScores: SafetyScore[] = [
      {
        symbol: 'AAPL',
        company: 'Apple Inc.',
        score: 92,
        grade: 'A+',
        payoutRatio: 15.2,
        dividendGrowth: 8.5,
        yearsOfGrowth: 11,
        debtToEquity: 1.73,
        freeCashFlow: 93.3,
        warnings: [],
        strengths: ['Strong balance sheet', 'Growing free cash flow', 'Low payout ratio']
      },
      {
        symbol: 'KO',
        company: 'Coca-Cola Co.',
        score: 88,
        grade: 'A',
        payoutRatio: 75.3,
        dividendGrowth: 3.2,
        yearsOfGrowth: 59,
        debtToEquity: 1.45,
        freeCashFlow: 10.1,
        warnings: ['High payout ratio'],
        strengths: ['59 years of growth', 'Stable business model']
      },
      {
        symbol: 'T',
        company: 'AT&T Inc.',
        score: 65,
        grade: 'C+',
        payoutRatio: 95.2,
        dividendGrowth: -8.5,
        yearsOfGrowth: 0,
        debtToEquity: 0.85,
        freeCashFlow: 18.2,
        warnings: ['Very high payout ratio', 'Negative dividend growth', 'Recent dividend cuts'],
        strengths: ['High yield', 'Strong free cash flow']
      }
    ];
    setSafetyScores(mockScores);
  }, [user]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBadgeVariant = (grade: string) => {
    if (grade.startsWith('A')) return 'default';
    if (grade.startsWith('B')) return 'secondary';
    if (grade.startsWith('C')) return 'outline';
    return 'destructive';
  };

  const sortedScores = [...safetyScores].sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'symbol') return a.symbol.localeCompare(b.symbol);
    if (sortBy === 'grade') return a.grade.localeCompare(b.grade);
    return 0;
  });

  const averageScore = safetyScores.reduce((sum, stock) => sum + stock.score, 0) / safetyScores.length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Portfolio Dividend Safety</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(averageScore)}`}>
                {averageScore.toFixed(0)}
              </div>
              <p className="text-sm text-muted-foreground">Portfolio Average</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {safetyScores.filter(s => s.score >= 80).length}
              </div>
              <p className="text-sm text-muted-foreground">Safe Dividends</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {safetyScores.filter(s => s.score >= 60 && s.score < 80).length}
              </div>
              <p className="text-sm text-muted-foreground">At Risk</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {safetyScores.filter(s => s.score < 60).length}
              </div>
              <p className="text-sm text-muted-foreground">High Risk</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Safety Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedScores.map(stock => (
              <div key={stock.symbol} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{stock.symbol}</h3>
                    <p className="text-sm text-muted-foreground">{stock.company}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(stock.score)}`}>
                      {stock.score}
                    </div>
                    <Badge variant={getGradeBadgeVariant(stock.grade)}>
                      {stock.grade}
                    </Badge>
                  </div>
                </div>

                <Progress value={stock.score} className="mb-3" />

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Payout Ratio</p>
                    <p className="font-medium">{stock.payoutRatio}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Growth Rate</p>
                    <p className="font-medium">{stock.dividendGrowth}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Years Growth</p>
                    <p className="font-medium">{stock.yearsOfGrowth}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Debt/Equity</p>
                    <p className="font-medium">{stock.debtToEquity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">FCF Billions</p>
                    <p className="font-medium">${stock.freeCashFlow}B</p>
                  </div>
                </div>

                {stock.warnings.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center space-x-1 mb-1">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-600">Warnings</span>
                    </div>
                    {stock.warnings.map((warning, index) => (
                      <Badge key={index} variant="destructive" className="mr-1 mb-1">
                        {warning}
                      </Badge>
                    ))}
                  </div>
                )}

                {stock.strengths.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-1 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Strengths</span>
                    </div>
                    {stock.strengths.map((strength, index) => (
                      <Badge key={index} variant="outline" className="mr-1 mb-1 border-green-200 text-green-700">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DividendSafetyScores;
