
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatCard from "@/components/StatCard";
import { ChartBarIcon, DollarSign, TrendingUp, Calendar } from "lucide-react";

const monthlyData = [
  { month: 'Jan', amount: 262.41 },
  { month: 'Feb', amount: 218.76 },
  { month: 'Mar', amount: 304.25 },
  { month: 'Apr', amount: 245.32 },
  { month: 'May', amount: 295.14 },
  { month: 'Jun', amount: 324.53 },
  { month: 'Jul', amount: 274.82 },
  { month: 'Aug', amount: 231.45 },
  { month: 'Sep', amount: 291.67 },
  { month: 'Oct', amount: 259.38 },
  { month: 'Nov', amount: 268.21 },
  { month: 'Dec', amount: 273.92 }
];

const yearlyData = [
  { year: '2018', amount: 1450.28 },
  { year: '2019', amount: 1683.45 },
  { year: '2020', amount: 1893.21 },
  { year: '2021', amount: 2242.67 },
  { year: '2022', amount: 2658.32 },
  { year: '2023', amount: 2972.14 },
  { year: '2024', amount: 3249.86 }
];

export function DividendOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Annual Income" 
          value="$3,249.86" 
          change={{ 
            value: "+$277.72", 
            percentage: "+9.3%", 
            isPositive: true 
          }}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard 
          label="Monthly Average" 
          value="$271" 
          change={{ 
            value: "+$23.14", 
            percentage: "+9.3%", 
            isPositive: true 
          }}
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard 
          label="YoY Growth Rate" 
          value="9.3%" 
          change={{ 
            value: "+1.2%", 
            percentage: "+14.8%", 
            isPositive: true 
          }}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard 
          label="Dividend Payments" 
          value="148" 
          change={{ 
            value: "+12", 
            percentage: "+8.8%", 
            isPositive: true 
          }}
          icon={<ChartBarIcon className="h-5 w-5" />}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Monthly Income Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Dividend Income']} />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Annual Income Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Annual Income']} />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Income Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly">
            <TabsList className="mb-4">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
            <TabsContent value="monthly">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Dividend Income']} />
                    <Bar dataKey="amount" name="Monthly Income" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="quarterly">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { quarter: 'Q1', amount: 785.42 },
                    { quarter: 'Q2', amount: 864.99 },
                    { quarter: 'Q3', amount: 797.94 },
                    { quarter: 'Q4', amount: 801.51 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Dividend Income']} />
                    <Bar dataKey="amount" name="Quarterly Income" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="yearly">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Annual Income']} />
                    <Line type="monotone" dataKey="amount" name="Annual Income" stroke="#4f46e5" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
