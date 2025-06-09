
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Activity, Users, DollarSign, TrendingUp, Database, Server } from "lucide-react";

const SystemAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    userGrowth: [
      { month: 'Jan', users: 12, active: 8 },
      { month: 'Feb', users: 19, active: 15 },
      { month: 'Mar', users: 25, active: 22 },
      { month: 'Apr', users: 35, active: 28 },
      { month: 'May', users: 42, active: 35 },
      { month: 'Jun', users: 48, active: 41 }
    ],
    revenue: [
      { month: 'Jan', amount: 1200 },
      { month: 'Feb', amount: 1900 },
      { month: 'Mar', amount: 2300 },
      { month: 'Apr', amount: 2800 },
      { month: 'May', amount: 3200 },
      { month: 'Jun', amount: 3800 }
    ],
    subscriptionTypes: [
      { name: 'Basic', value: 45, color: '#8884d8' },
      { name: 'Pro', value: 30, color: '#82ca9d' },
      { name: 'Premium', value: 15, color: '#ffc658' },
      { name: 'Free Trial', value: 10, color: '#ff7300' }
    ],
    systemMetrics: {
      totalUsers: 148,
      activeUsers: 127,
      monthlyRevenue: 3800,
      systemUptime: 99.8,
      apiCalls: 15420,
      dataSize: 2.4
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Total Users</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{analytics.systemMetrics.totalUsers}</div>
            <div className="text-xs text-green-600">+12% from last month</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Active Users</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{analytics.systemMetrics.activeUsers}</div>
            <div className="text-xs text-green-600">+8% from last month</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium">Revenue</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900">
              {formatCurrency(analytics.systemMetrics.monthlyRevenue)}
            </div>
            <div className="text-xs text-green-600">+18% from last month</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Uptime</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{analytics.systemMetrics.systemUptime}%</div>
            <div className="text-xs text-green-600">Excellent</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium">API Calls</span>
            </div>
            <div className="text-2xl font-bold text-red-900">{analytics.systemMetrics.apiCalls.toLocaleString()}</div>
            <div className="text-xs text-green-600">+24% from last month</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium">Data Size</span>
            </div>
            <div className="text-2xl font-bold text-indigo-900">{analytics.systemMetrics.dataSize}GB</div>
            <div className="text-xs text-orange-600">+5% from last month</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Total and active users over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#8884d8" name="Total Users" />
                <Bar dataKey="active" fill="#82ca9d" name="Active Users" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue growth</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
            <CardDescription>User distribution by subscription type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.subscriptionTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.subscriptionTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* System Performance */}
        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>Real-time system metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm text-green-600">23%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '23%' }}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-yellow-600">67%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '67%' }}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Disk Usage</span>
                <span className="text-sm text-blue-600">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Network I/O</span>
                <span className="text-sm text-purple-600">89 MB/s</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemAnalytics;
