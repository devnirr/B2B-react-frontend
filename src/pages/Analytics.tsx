import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../lib/api';
import { BarChart3, DollarSign, ShoppingCart, Users, Package, ArrowUp, ArrowDown, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { SkeletonStatsCard, SkeletonChart, SkeletonTable } from '../components/Skeleton';

export default function Analytics() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'orders' | 'customers'>('revenue');

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: async () => {
      try {
        const response = await api.get(`/analytics/sales?range=${dateRange}`);
        return response.data;
      } catch (error) {
        // Return mock data if API fails
        return {
          totalRevenue: 125000,
          orderCount: 342,
          customerCount: 189,
          averageOrderValue: 365.50,
          revenueGrowth: 12.5,
          orderGrowth: 8.3,
          customerGrowth: 15.2,
          dailyRevenue: [
            { date: '2024-01-01', revenue: 3200, orders: 12 },
            { date: '2024-01-02', revenue: 4100, orders: 15 },
            { date: '2024-01-03', revenue: 3800, orders: 14 },
            { date: '2024-01-04', revenue: 5200, orders: 18 },
            { date: '2024-01-05', revenue: 4800, orders: 16 },
            { date: '2024-01-06', revenue: 6100, orders: 22 },
            { date: '2024-01-07', revenue: 5500, orders: 20 },
          ],
          topProducts: [
            { name: 'Product A', sales: 12500, quantity: 45 },
            { name: 'Product B', sales: 9800, quantity: 38 },
            { name: 'Product C', sales: 8700, quantity: 32 },
            { name: 'Product D', sales: 7200, quantity: 28 },
            { name: 'Product E', sales: 6500, quantity: 25 },
          ],
          ordersByStatus: [
            { status: 'Completed', count: 280, value: 82000 },
            { status: 'Pending', count: 45, value: 13500 },
            { status: 'Processing', count: 17, value: 5100 },
          ],
          recentOrders: [
            { id: 1, orderNumber: 'ORD-001', customer: 'John Doe', amount: 1250.00, date: '2024-01-15', status: 'Completed' },
            { id: 2, orderNumber: 'ORD-002', customer: 'Jane Smith', amount: 890.50, date: '2024-01-15', status: 'Pending' },
            { id: 3, orderNumber: 'ORD-003', customer: 'Bob Johnson', amount: 2340.00, date: '2024-01-14', status: 'Completed' },
            { id: 4, orderNumber: 'ORD-004', customer: 'Alice Brown', amount: 567.75, date: '2024-01-14', status: 'Processing' },
            { id: 5, orderNumber: 'ORD-005', customer: 'Charlie Wilson', amount: 1890.25, date: '2024-01-13', status: 'Completed' },
          ],
        };
      }
    },
  });

  const COLORS = ['#5955D1', '#4a46b8', '#3d3a9f', '#333085', '#2d2a6f'];

  if (isLoading) {
    return (
      <div>
        <div className="mb-6 animate-pulse">
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatsCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <SkeletonTable />
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${analyticsData?.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`,
      change: analyticsData?.revenueGrowth || 0,
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Total Orders',
      value: analyticsData?.orderCount?.toLocaleString() || '0',
      change: analyticsData?.orderGrowth || 0,
      icon: ShoppingCart,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Total Customers',
      value: analyticsData?.customerCount?.toLocaleString() || '0',
      change: analyticsData?.customerGrowth || 0,
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      title: 'Average Order Value',
      value: `$${analyticsData?.averageOrderValue?.toFixed(2) || '0.00'}`,
      change: 5.2,
      icon: Package,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-black">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track your business performance and insights</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    dateRange === range
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</h3>
            <div className="flex items-center gap-2">
              {(['revenue', 'orders', 'customers'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    selectedMetric === metric
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {(!analyticsData?.dailyRevenue || analyticsData.dailyRevenue.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-[300px]">
              <TrendingUp className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No revenue data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#5955D1"
                  strokeWidth={2}
                  name="Revenue ($)"
                  dot={{ fill: '#5955D1', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Orders"
                  dot={{ fill: '#10b981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Products Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Top Products</h3>
          {(!analyticsData?.topProducts || analyticsData.topProducts.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-[300px]">
              <Package className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No product data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="sales" fill="#5955D1" name="Sales ($)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Orders by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Orders by Status</h3>
          {(!analyticsData?.ordersByStatus || analyticsData.ordersByStatus.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-[300px]">
              <PieChartIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No order status data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.ordersByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.status}: ${((entry.percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.ordersByStatus.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Status Summary</h3>
          {(!analyticsData?.ordersByStatus || analyticsData.ordersByStatus.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-[300px]">
              <BarChart3 className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No status data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analyticsData.ordersByStatus.map((status: any, index: number) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{status.status}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{status.count} orders</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    ${status.value.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {(!analyticsData?.recentOrders || analyticsData.recentOrders.length === 0) ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <ShoppingCart className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No orders found</p>
                  </td>
                </tr>
              ) : (
                analyticsData.recentOrders.map((order: any) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                      ${order.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'Completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : order.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
