
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Progress } from "@/components/ui/progress";

const dividendGrowthData = [
  { year: 2018, income: 1450.28, growth: 0 },
  { year: 2019, income: 1683.45, growth: 16.1 },
  { year: 2020, income: 1893.21, growth: 12.5 },
  { year: 2021, income: 2242.67, growth: 18.5 },
  { year: 2022, income: 2658.32, growth: 18.5 },
  { year: 2023, income: 2972.14, growth: 11.8 },
  { year: 2024, income: 3249.86, growth: 9.3 }
];

const topGrowers = [
  { name: "MSFT", lastDividend: 0.75, previousDividend: 0.68, growth: 10.3, years: 21 },
  { name: "AAPL", lastDividend: 0.24, previousDividend: 0.23, growth: 4.3, years: 12 },
  { name: "JNJ", lastDividend: 1.19, previousDividend: 1.13, growth: 5.3, years: 61 },
  { name: "PG", lastDividend: 0.9407, previousDividend: 0.8698, growth: 8.2, years: 67 },
  { name: "PEP", lastDividend: 1.27, previousDividend: 1.15, growth: 10.4, years: 51 }
];

const growthProjections = [
  { year: 2024, projected: 3249.86, actual: 3249.86 },
  { year: 2025, projected: 3574.85, actual: null },
  { year: 2026, projected: 3932.33, actual: null },
  { year: 2027, projected: 4325.57, actual: null },
  { year: 2028, projected: 4758.12, actual: null },
  { year: 2029, projected: 5233.93, actual: null }
];

export function DividendGrowth() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Dividend Growth History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dividendGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip formatter={(value, name) => [
                  name === 'income' ? `$${value}` : `${value}%`,
                  name === 'income' ? 'Annual Income' : 'YoY Growth'
                ]} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="income" stroke="#8884d8" activeDot={{ r: 8 }} name="Annual Income" />
                <Line yAxisId="right" type="monotone" dataKey="growth" stroke="#82ca9d" name="YoY Growth %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Top Dividend Growers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topGrowers.map((stock) => (
                <div key={stock.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{stock.name}</h4>
                      <div className="text-sm text-muted-foreground">
                        ${stock.previousDividend} → ${stock.lastDividend} | {stock.years} years of growth
                      </div>
                    </div>
                    <span className="text-finance-green font-medium">+{stock.growth}%</span>
                  </div>
                  <Progress value={stock.growth * 5} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>5-Year Projection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthProjections}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis domain={[0, 5500]} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Projected Income']} />
                  <Legend />
                  <Bar dataKey="actual" name="Actual Income" fill="#8884d8" />
                  <Bar dataKey="projected" name="Projected Income" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Projection Assumptions</h4>
              <ul className="text-sm space-y-1">
                <li>• Average dividend growth rate: 10.1% annually</li>
                <li>• New investments: $500/month</li>
                <li>• Dividend reinvestment: 100%</li>
                <li>• Portfolio yield: 3.1%</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
