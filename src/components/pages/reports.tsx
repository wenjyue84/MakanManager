"use client";

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  DollarSign,
  AlertTriangle,
  Package,
  Users,
  Trash2,
  ShoppingCart,
  FileText,
  Filter,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts@2.15.2';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { currentUser } from '../../lib/data';

// Sample data for charts
const disposalData = [
  { period: 'Week 1', value: 245.50, weight: 12.3, items: 15 },
  { period: 'Week 2', value: 312.80, weight: 18.5, items: 22 },
  { period: 'Week 3', value: 189.20, weight: 9.8, items: 12 },
  { period: 'Week 4', value: 428.60, weight: 23.1, items: 31 },
  { period: 'Week 5', value: 356.40, weight: 19.2, items: 24 },
  { period: 'Week 6', value: 298.70, weight: 15.6, items: 19 },
  { period: 'Week 7', value: 412.30, weight: 21.8, items: 28 },
  { period: 'Week 8', value: 275.90, weight: 14.2, items: 17 }
];

const onlineOrdersData = [
  { period: 'Week 1', revenue: 8540.50, orders: 142, avgOrder: 60.15 },
  { period: 'Week 2', revenue: 9235.80, orders: 156, avgOrder: 59.20 },
  { period: 'Week 3', revenue: 7890.20, orders: 134, avgOrder: 58.88 },
  { period: 'Week 4', revenue: 10125.60, orders: 168, avgOrder: 60.27 },
  { period: 'Week 5', revenue: 9456.40, orders: 159, avgOrder: 59.47 },
  { period: 'Week 6', revenue: 8798.70, orders: 147, avgOrder: 59.85 },
  { period: 'Week 7', revenue: 10512.30, orders: 175, avgOrder: 60.07 },
  { period: 'Week 8', revenue: 9275.90, orders: 154, avgOrder: 60.23 }
];

const issuesData = [
  { period: 'Week 1', issues: 8, resolved: 6, pending: 2, critical: 1 },
  { period: 'Week 2', issues: 12, resolved: 10, pending: 2, critical: 2 },
  { period: 'Week 3', issues: 6, resolved: 5, pending: 1, critical: 0 },
  { period: 'Week 4', issues: 15, resolved: 12, pending: 3, critical: 3 },
  { period: 'Week 5', issues: 9, resolved: 8, pending: 1, critical: 1 },
  { period: 'Week 6', issues: 11, resolved: 9, pending: 2, critical: 1 },
  { period: 'Week 7', issues: 14, resolved: 11, pending: 3, critical: 2 },
  { period: 'Week 8', issues: 7, resolved: 6, pending: 1, critical: 0 }
];

const monthlyData = {
  disposal: [
    { period: 'Jan', value: 1240.50, weight: 68.3, items: 89 },
    { period: 'Feb', value: 1456.80, weight: 78.5, items: 102 },
    { period: 'Mar', value: 1189.20, weight: 62.8, items: 81 },
    { period: 'Apr', value: 1628.60, weight: 89.1, items: 115 },
    { period: 'May', value: 1356.40, weight: 72.2, items: 94 },
    { period: 'Jun', value: 1498.70, weight: 81.6, items: 106 }
  ],
  orders: [
    { period: 'Jan', revenue: 34540.50, orders: 542, avgOrder: 63.71 },
    { period: 'Feb', revenue: 38235.80, orders: 612, avgOrder: 62.48 },
    { period: 'Mar', revenue: 31890.20, orders: 501, avgOrder: 63.65 },
    { period: 'Apr', revenue: 42125.60, orders: 668, avgOrder: 63.05 },
    { period: 'May', revenue: 39456.40, orders: 628, avgOrder: 62.84 },
    { period: 'Jun', revenue: 41798.70, orders: 658, avgOrder: 63.51 }
  ],
  issues: [
    { period: 'Jan', issues: 34, resolved: 29, pending: 5, critical: 6 },
    { period: 'Feb', issues: 42, resolved: 37, pending: 5, critical: 8 },
    { period: 'Mar', issues: 28, resolved: 25, pending: 3, critical: 4 },
    { period: 'Apr', issues: 51, resolved: 44, pending: 7, critical: 9 },
    { period: 'May', issues: 36, resolved: 32, pending: 4, critical: 5 },
    { period: 'Jun', issues: 39, resolved: 34, pending: 5, critical: 6 }
  ]
};

const issueTypeData = [
  { name: 'Equipment', value: 35, color: '#2563eb' },
  { name: 'Service', value: 28, color: '#16a34a' },
  { name: 'Inventory', value: 20, color: '#f59e0b' },
  { name: 'Staff', value: 12, color: '#dc2626' },
  { name: 'Other', value: 5, color: '#8b5cf6' }
];

export function ReportsPage() {
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [dateRange, setDateRange] = useState('last8weeks');

  const isManagement = currentUser.roles.some(role => 
    ['owner', 'manager', 'head-of-kitchen', 'front-desk-manager'].includes(role)
  );

  // Calculate current data based on time range
  const currentDisposalData = timeRange === 'weekly' ? disposalData : monthlyData.disposal;
  const currentOrdersData = timeRange === 'weekly' ? onlineOrdersData : monthlyData.orders;
  const currentIssuesData = timeRange === 'weekly' ? issuesData : monthlyData.issues;

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const totalDisposalValue = currentDisposalData.reduce((sum, item) => sum + item.value, 0);
    const totalOrderRevenue = currentOrdersData.reduce((sum, item) => sum + item.revenue, 0);
    const totalIssues = currentIssuesData.reduce((sum, item) => sum + item.issues, 0);
    const resolvedIssues = currentIssuesData.reduce((sum, item) => sum + item.resolved, 0);
    
    const avgDisposal = totalDisposalValue / currentDisposalData.length;
    const avgRevenue = totalOrderRevenue / currentOrdersData.length;
    const resolutionRate = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0;

    // Calculate trends (comparing last 2 periods)
    const disposalTrend = currentDisposalData.length >= 2 
      ? ((currentDisposalData[currentDisposalData.length - 1].value - currentDisposalData[currentDisposalData.length - 2].value) / currentDisposalData[currentDisposalData.length - 2].value) * 100
      : 0;

    const revenueTrend = currentOrdersData.length >= 2
      ? ((currentOrdersData[currentOrdersData.length - 1].revenue - currentOrdersData[currentOrdersData.length - 2].revenue) / currentOrdersData[currentOrdersData.length - 2].revenue) * 100
      : 0;

    return {
      totalDisposalValue,
      totalOrderRevenue,
      totalIssues,
      resolutionRate,
      avgDisposal,
      avgRevenue,
      disposalTrend,
      revenueTrend
    };
  }, [currentDisposalData, currentOrdersData, currentIssuesData]);

  const handleExport = (type: string) => {
    // In a real app, this would generate and download the report
    console.log(`Exporting ${type} report...`);
  };

  if (!isManagement) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <BarChart3 className="size-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">
            Reports and analytics are only available to management personnel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into cafe operations and performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="size-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('summary')}>
            <Download className="size-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Time Range:</span>
              <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as 'weekly' | 'monthly')}>
                <TabsList>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Period:</span>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last8weeks">Last 8 {timeRange === 'weekly' ? 'Weeks' : 'Months'}</SelectItem>
                  <SelectItem value="last12weeks">Last 12 {timeRange === 'weekly' ? 'Weeks' : 'Months'}</SelectItem>
                  <SelectItem value="ytd">Year to Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="size-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">RM{summaryMetrics.totalDisposalValue.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">Total Disposal Cost</p>
                <div className="flex items-center gap-1 mt-1">
                  {summaryMetrics.disposalTrend >= 0 ? (
                    <TrendingUp className="size-3 text-red-600" />
                  ) : (
                    <TrendingDown className="size-3 text-green-600" />
                  )}
                  <span className={`text-xs ${summaryMetrics.disposalTrend >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {Math.abs(summaryMetrics.disposalTrend).toFixed(1)}% vs last period
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingCart className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">RM{summaryMetrics.totalOrderRevenue.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">Online Orders Revenue</p>
                <div className="flex items-center gap-1 mt-1">
                  {summaryMetrics.revenueTrend >= 0 ? (
                    <TrendingUp className="size-3 text-green-600" />
                  ) : (
                    <TrendingDown className="size-3 text-red-600" />
                  )}
                  <span className={`text-xs ${summaryMetrics.revenueTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(summaryMetrics.revenueTrend).toFixed(1)}% vs last period
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="size-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summaryMetrics.totalIssues}</p>
                <p className="text-sm text-muted-foreground">Total Issues Reported</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {summaryMetrics.resolutionRate.toFixed(1)}% resolution rate
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">RM{summaryMetrics.avgRevenue.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">Avg {timeRange === 'weekly' ? 'Weekly' : 'Monthly'} Revenue</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-muted-foreground">
                    RM{summaryMetrics.avgDisposal.toFixed(0)} avg disposal cost
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Disposal Value Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="size-5" />
              Disposal Value Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer 
              config={{
                value: { label: "Disposal Cost", color: "#dc2626" },
                weight: { label: "Weight (kg)", color: "#f59e0b" }
              }}
              className="h-[300px]"
            >
              <LineChart data={currentDisposalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value, name) => [
                      name === 'value' ? `RM${value}` : value,
                      name === 'value' ? 'Disposal Cost' : 'Weight (kg)'
                    ]}
                  />}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--color-value)" 
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-value)', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="var(--color-weight)" 
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-weight)', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Online Orders Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="size-5" />
              Online Orders Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer 
              config={{
                revenue: { label: "Revenue", color: "#16a34a" },
                orders: { label: "Orders", color: "#2563eb" }
              }}
              className="h-[300px]"
            >
              <AreaChart data={currentOrdersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value, name) => [
                      name === 'revenue' ? `RM${value}` : value,
                      name === 'revenue' ? 'Revenue' : name === 'orders' ? 'Orders' : 'Avg Order'
                    ]}
                  />}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--color-revenue)" 
                  fill="var(--color-revenue)" 
                  fillOpacity={0.3}
                  strokeWidth={3}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Issues Frequency Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5" />
              Issues Frequency & Resolution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer 
              config={{
                issues: { label: "Total Issues", color: "#f59e0b" },
                resolved: { label: "Resolved", color: "#16a34a" },
                critical: { label: "Critical", color: "#dc2626" }
              }}
              className="h-[300px]"
            >
              <BarChart data={currentIssuesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="issues" fill="var(--color-issues)" name="Total Issues" />
                <Bar dataKey="resolved" fill="var(--color-resolved)" name="Resolved" />
                <Bar dataKey="critical" fill="var(--color-critical)" name="Critical" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Issues by Type Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Issues by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer 
              config={{
                equipment: { label: "Equipment", color: "#2563eb" },
                service: { label: "Service", color: "#16a34a" },
                inventory: { label: "Inventory", color: "#f59e0b" },
                staff: { label: "Staff", color: "#dc2626" },
                other: { label: "Other", color: "#8b5cf6" }
              }}
              className="h-[300px]"
            >
              <PieChart>
                <Pie
                  data={issueTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {issueTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="size-5" />
              Detailed {timeRange === 'weekly' ? 'Weekly' : 'Monthly'} Breakdown
            </span>
            <Button variant="outline" size="sm" onClick={() => handleExport('detailed')}>
              <Download className="size-4 mr-2" />
              Export Table
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Period</th>
                  <th className="text-right p-3">Disposal Cost</th>
                  <th className="text-right p-3">Order Revenue</th>
                  <th className="text-right p-3">Issues</th>
                  <th className="text-right p-3">Resolution Rate</th>
                  <th className="text-right p-3">Net Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {currentDisposalData.map((_, index) => {
                  const disposal = currentDisposalData[index];
                  const orders = currentOrdersData[index];
                  const issues = currentIssuesData[index];
                  const resolutionRate = issues ? (issues.resolved / issues.issues) * 100 : 0;
                  const efficiency = orders ? ((orders.revenue - disposal.value) / orders.revenue) * 100 : 0;
                  
                  return (
                    <tr key={disposal.period} className="border-b hover:bg-accent">
                      <td className="p-3 font-medium">{disposal.period}</td>
                      <td className="p-3 text-right">RM{disposal.value.toFixed(2)}</td>
                      <td className="p-3 text-right">RM{orders.revenue.toFixed(2)}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span>{issues.issues}</span>
                          {issues.critical > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {issues.critical} critical
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <span className={resolutionRate >= 80 ? 'text-green-600' : resolutionRate >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                          {resolutionRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className={efficiency >= 90 ? 'text-green-600' : efficiency >= 80 ? 'text-yellow-600' : 'text-red-600'}>
                          {efficiency.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Key Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">✅ Positive Trends</h4>
              <ul className="space-y-2 text-sm">
                <li>• Online order revenue showing consistent growth</li>
                <li>• Issue resolution rate maintained above 80%</li>
                <li>• Disposal costs trending downward in recent periods</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-orange-600">⚠️ Areas for Improvement</h4>
              <ul className="space-y-2 text-sm">
                <li>• Equipment issues represent 35% of all reported problems</li>
                <li>• Critical issues still occurring regularly</li>
                <li>• Disposal costs spike during busy periods</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}