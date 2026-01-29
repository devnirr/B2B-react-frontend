import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Package, ShoppingCart, Users, DollarSign, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';
import { SkeletonStatsCard, SkeletonTable } from '../components/Skeleton';

export default function Dashboard() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await api.get('/analytics/dashboard');
      return response.data;
    },
  });

  // Fetch low stock items directly as fallback if not in dashboard stats
  const hasLowStockInDashboard = dashboardStats?.lowStockItems && Array.isArray(dashboardStats.lowStockItems) && dashboardStats.lowStockItems.length > 0;
  
  const { data: lowStockData, isLoading: lowStockLoading } = useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: async () => {
      try {
        const response = await api.get('/inventory');
        const allInventory = response.data?.data || response.data || [];
        // Filter for low stock items: quantity <= 10 OR quantity <= reorderPoint
        const lowStock = allInventory
          .filter((item: any) => {
            const quantity = item.quantity || 0;
            const reorderPoint = item.reorderPoint || 0;
            // Consider low stock if quantity <= 10 OR quantity <= reorderPoint (if reorderPoint is set)
            return quantity <= 10 || (reorderPoint > 0 && quantity <= reorderPoint);
          })
          .sort((a: any, b: any) => (a.quantity || 0) - (b.quantity || 0)) // Sort by quantity ascending
          .slice(0, 10);
        return lowStock;
      } catch (error) {
        console.error('Error fetching low stock items:', error);
        return [];
      }
    },
    enabled: !isLoading && !hasLowStockInDashboard,
  });

  // Fetch sales report for the selected date range
  const getDateRange = () => {
    if (dateRange === 'all') return { startDate: undefined, endDate: undefined };
    
    const endDate = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
    }
    
    return { 
      startDate: startDate.toISOString().split('T')[0], 
      endDate: endDate.toISOString().split('T')[0] 
    };
  };

  const { startDate, endDate } = getDateRange();

  const { data: salesReport } = useQuery({
    queryKey: ['analytics', 'sales', startDate, endDate, dateRange],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (startDate && dateRange !== 'all') params.append('startDate', startDate);
        if (endDate && dateRange !== 'all') params.append('endDate', endDate);
        const queryString = params.toString();
        const response = await api.get(`/analytics/sales${queryString ? `?${queryString}` : ''}`);
        return response.data;
      } catch (error) {
        return { orders: [], totalRevenue: 0, orderCount: 0 };
      }
    },
  });

  // Calculate revenue for the period
  const periodRevenue = salesReport?.totalRevenue || 0;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed' || statusLower === 'delivered') {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
    if (statusLower === 'pending' || statusLower === 'processing') {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
    if (statusLower === 'cancelled' || statusLower === 'failed') {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonTable />
          <SkeletonTable />
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Products',
      value: dashboardStats?.totalProducts?.toLocaleString() || '0',
      icon: Package,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      link: '/products',
    },
    {
      title: 'Total Orders',
      value: dashboardStats?.totalOrders?.toLocaleString() || '0',
      icon: ShoppingCart,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      link: '/orders',
    },
    {
      title: 'Total Customers',
      value: dashboardStats?.totalCustomers?.toLocaleString() || '0',
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      link: '/customers',
    },
    {
      title: 'Period Revenue',
      value: formatCurrency(periodRevenue),
      icon: DollarSign,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      link: '/analytics',
    },
  ];

  const recentOrders = dashboardStats?.recentOrders || [];
  // Use low stock items from dashboard stats, or fallback to direct query
  // Check if dashboard stats has lowStockItems and it's an array with items
  const dashboardLowStock = dashboardStats?.lowStockItems;
  const lowStockItems = (Array.isArray(dashboardLowStock) && dashboardLowStock.length > 0)
    ? dashboardLowStock 
    : (Array.isArray(lowStockData) && lowStockData.length > 0 ? lowStockData : []);

  // If dashboard stats failed to load, show error state
  if (!isLoading && !dashboardStats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Failed to load dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Unable to fetch dashboard statistics. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with your business.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              {(['7d', '30d', '90d', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    dateRange === range
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {range === 'all' ? 'All Time' : range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            onClick={() => stat.link && navigate(stat.link)}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer transition-all hover:shadow-md hover:scale-105 ${
              stat.link ? 'hover:border-primary' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            {stat.link && (
              <div className="mt-4 flex items-center text-sm text-primary hover:text-primary-dark">
                <span className="font-medium">View details</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent Orders and Low Stock Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
              <button
                onClick={() => navigate('/orders')}
                className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-6">
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer transition-colors"
                    onClick={() => navigate('/orders')}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {order.orderNumber || `ORD-${order.id}`}
                        </p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status || 'PENDING')}`}>
                          {order.status || 'PENDING'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.customer?.name || 'Unknown Customer'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {formatDate(order.orderDate || order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(typeof order.totalAmount === 'number' ? order.totalAmount : parseFloat(order.totalAmount || 0))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No recent orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Low Stock Items
              </h2>
              <button
                onClick={() => navigate('/inventory')}
                className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-6">
            {(isLoading || lowStockLoading) ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : lowStockItems && lowStockItems.length > 0 ? (
              <div className="space-y-4">
                {lowStockItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-900/30"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">
                        {item.product?.name || item.productName || 'Unknown Product'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.warehouse?.name || item.warehouseName || 'Unknown Warehouse'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600 dark:text-red-400">
                        {item.quantity || 0} left
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Low stock</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">All items are well stocked</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/products')}
            className="flex flex-col items-center justify-center p-4 bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 rounded-lg transition-colors border border-primary/20"
          >
            <Package className="w-6 h-6 text-primary mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Add Product</span>
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="flex flex-col items-center justify-center p-4 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 rounded-lg transition-colors border border-green-200 dark:border-green-800"
          >
            <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">New Order</span>
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="flex flex-col items-center justify-center p-4 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 rounded-lg transition-colors border border-purple-200 dark:border-purple-800"
          >
            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">View Analytics</span>
          </button>
          <button
            onClick={() => navigate('/warehouses')}
            className="flex flex-col items-center justify-center p-4 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 rounded-lg transition-colors border border-orange-200 dark:border-orange-800"
          >
            <Package className="w-6 h-6 text-orange-600 dark:text-orange-400 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Warehouses</span>
          </button>
        </div>
      </div>
    </div>
  );
}
