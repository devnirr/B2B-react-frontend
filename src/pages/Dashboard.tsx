import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import {
  MoreVertical,
  ArrowRight,
  Download,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  Trash2,
} from 'lucide-react';
import { SkeletonStatsCard, SkeletonChart, SkeletonCard } from '../components/Skeleton';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      try {
      const response = await api.get('/analytics/dashboard');
      return response.data;
      } catch (error) {
        // Return mock data if API fails
        return {
          totalContacts: 5758,
          leadAnalytics: 70,
          activeDeals: 1249,
          totalEarning: 5700000,
          orders: 673,
          pickups: 245,
          pickupsAmount: 2780000,
          shipments: 120,
          shipmentsAmount: 65823,
          tasksDone: 25,
          revenue: 256054.5,
          retentionRate: 92,
        };
      }
    },
  });

  // Mock chart data
  const contactsData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 4500 },
    { name: 'May', value: 5500 },
    { name: 'Jun', value: 5758 },
  ];

  const leadAnalyticsData = [
    { name: 'Jan', value: 80 },
    { name: 'Feb', value: 75 },
    { name: 'Mar', value: 78 },
    { name: 'Apr', value: 72 },
    { name: 'May', value: 75 },
    { name: 'Jun', value: 70 },
  ];

  const trafficSourcesData = [
    { name: 'Organic Search', value: 41.5, color: '#5955D1' },
    { name: 'Direct Traffic', value: 27, color: '#8e8eff' },
    { name: 'Referral Traffic', value: 18, color: '#b3b3ff' },
    { name: 'Social Media', value: 10.3, color: '#d1d1ff' },
    { name: 'Email Traffic', value: 3.2, color: '#e6e6ff' },
  ];

  const tasksData = [
    { name: 'Follow-ups', value: 10, color: '#5955D1' },
    { name: 'In Progress', value: 8, color: '#8e8eff' },
    { name: 'Pending', value: 7, color: '#b3b3ff' },
  ];

  const ordersStatusData = [
    { name: 'Paid', value: 70, color: '#5955D1' },
    { name: 'Cancelled', value: 25, color: '#8e8eff' },
    { name: 'Refunded', value: 5, color: '#b3b3ff' },
  ];

  const revenueData = [
    { name: 'Jan', value: 150000 },
    { name: 'Feb', value: 180000 },
    { name: 'Mar', value: 220000 },
    { name: 'Apr', value: 240000 },
    { name: 'May', value: 250000 },
    { name: 'Jun', value: 256054 },
  ];

  const retentionData = [
    { name: 'Jan', value: 85 },
    { name: 'Feb', value: 87 },
    { name: 'Mar', value: 89 },
    { name: 'Apr', value: 90 },
    { name: 'May', value: 91 },
    { name: 'Jun', value: 92 },
  ];

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
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      {/* Breadcrumb */}
      <nav className="text-sm mb-4">
        <ol className="flex items-center gap-2">
          <li>
            <a href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
              Home
            </a>
          </li>
          <li className="text-gray-400 dark:text-gray-500">/</li>
          <li className="text-gray-900 dark:text-black font-medium">Dashboard</li>
        </ol>
      </nav>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Closed Deals */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-black mb-1">27</h2>
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">+10 Deals</p>
        </div>

        {/* Pipeline Value */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-black mb-1">$5.2M</h2>
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">+$270K</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Conversion Rate</h6>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-black">16%</h2>
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded">
              -2%
            </span>
          </div>
          <div className="h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[{ value: 10 }, { value: 15 }, { value: 12 }, { value: 16 }]}>
                <Line type="monotone" dataKey="value" stroke="#5955D1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leads Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Leads Breakdown</h6>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">Leads</span>
              <span className="text-xs font-semibold text-gray-900 dark:text-black">120</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-primary-500 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">Prospects</span>
              <span className="text-xs font-semibold text-gray-900 dark:text-black">85</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '71%' }}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">Opportunities</span>
              <span className="text-xs font-semibold text-gray-900 dark:text-black">40</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-purple-400 h-2 rounded-full" style={{ width: '33%' }}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">Closed Deals</span>
              <span className="text-xs font-semibold text-gray-900 dark:text-black">20</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-red-400 h-2 rounded-full" style={{ width: '17%' }}></div>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
            <Download className="w-4 h-4" />
            Annual report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="xl:col-span-2 space-y-6">
          {/* Top Row Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Contacts */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Contacts</h6>
                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-black">
                    {stats?.totalContacts?.toLocaleString() || '5,758'}
                  </h2>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-semibold rounded">
                    +2.57%
                  </span>
                </div>
                <div className="w-20 h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={contactsData.slice(-4)}>
                      <Bar dataKey="value" fill="#5955D1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Vs last month: 1,195</p>
                <button className="text-primary-600 hover:text-primary-700">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lead Analytics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Lead Analytics</h6>
                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-black">
                  {stats?.leadAnalytics || 70}
                </h2>
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded">
                  -2.57%
                </span>
              </div>
              <div className="h-24 -mx-6 -mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={leadAnalyticsData}>
                    <Area type="monotone" dataKey="value" stroke="#5955D1" fill="#5955D1" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                Compared to Last Month
              </div>
            </div>

            {/* Tasks Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tasks Overview</h6>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Tasks Done <span className="text-primary-600 font-semibold">{stats?.tasksDone || 25}</span>
                </span>
              </div>
              <div className="mb-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full"
                    style={{ width: '70%' }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  {tasksData.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: task.color, opacity: 0.3 + idx * 0.2 }}
                      ></div>
                      <span className="text-gray-600 dark:text-gray-400">{task.name}</span>
                    </div>
                  ))}
                </div>
                <div className="w-20 h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tasksData}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={35}
                        dataKey="value"
                      >
                        {tasksData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Active Deals */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Active Deals</h6>
                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-black">
                  {stats?.activeDeals?.toLocaleString() || '1,249'}
                </h2>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-semibold rounded">
                  +2.57%
                </span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Vs last month: 1,195</p>
                <button className="text-primary-600 hover:text-primary-700">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Revenue</h6>
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-full p-1">
                  <button className="px-3 py-1 text-xs rounded-full text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600">Today</button>
                  <button className="px-3 py-1 text-xs rounded-full text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600">Week</button>
                  <button className="px-3 py-1 text-xs rounded-full bg-primary-500 text-white">Month</button>
                </div>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-black">
                <span className="text-gray-600 dark:text-gray-400">$</span>
                {stats?.revenue?.toLocaleString() || '256,054'}
                <span className="text-primary-600">.50</span>
              </h2>
              <span className="text-sm text-green-600 dark:text-green-400">+20% vs last month</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#5955D1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Retention Rate */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Retention Rate</h6>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-black">
                  {stats?.retentionRate || 92}%
                </h2>
                <span className="text-sm text-green-600 dark:text-green-400">+15% vs last month</span>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={retentionData}>
                    <Bar dataKey="value" fill="#5955D1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order By Time */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Order By Time</h6>
              <div className="grid grid-cols-5 gap-2 h-48">
                {['8am', '10am', '12pm', '2pm', '4pm'].map((time, idx) => (
                  <div key={time} className="flex flex-col items-center justify-end">
                    <div
                      className="w-full bg-primary-500 rounded-t"
                      style={{
                        height: `${60 + Math.random() * 40}%`,
                        opacity: 0.6 + idx * 0.1,
                      }}
                    ></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">{time}</span>
                  </div>
                ))}
              </div>
            </div>
        </div>

          {/* New Customers Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h6 className="text-lg font-semibold text-gray-900 dark:text-black">New Customers</h6>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-black"
                  />
                </div>
                <button className="px-4 py-2 bg-primary-500 text-black rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 text-sm font-medium">
                  <Plus className="w-4 h-4" />
                  Add New
                </button>
              </div>
        </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Phone</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Days</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'William Johnson', phone: '+1 234 567 8900', email: 'william@example.com', days: 5, status: 'Active' },
                    { name: 'Benjamin Martinez', phone: '+1 234 567 8901', email: 'benjamin@example.com', days: 3, status: 'Active' },
                    { name: 'Alexander Brown', phone: '+1 234 567 8902', email: 'alexander@example.com', days: 7, status: 'Pending' },
                    { name: 'Michael Davis', phone: '+1 234 567 8903', email: 'michael@example.com', days: 2, status: 'Active' },
                    { name: 'David Wilson', phone: '+1 234 567 8904', email: 'david@example.com', days: 10, status: 'Pending' },
                    { name: 'Benjamin Martinez', phone: '+1 234 567 8905', email: 'benjamin2@example.com', days: 4, status: 'Pending' },
                  ].map((customer, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-black">{customer.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{customer.phone}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{customer.email}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{customer.days} days</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          customer.status === 'Active'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-primary-600 hover:text-primary-700 text-sm">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
        </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">Showing 1 to 6 of 12 entries</p>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
                <button className="px-3 py-1 rounded-lg bg-primary-500 text-black text-sm font-medium">1</button>
                <button className="px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">2</button>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
        </div>
      </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Traffic Sources */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Traffic Sources</h6>
              <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficSourcesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                  >
                    {trafficSourcesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          <div className="space-y-2">
              {trafficSourcesData.map((source, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: source.color }}
                    ></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{source.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-black">
                    {source.value}%
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
              <Download className="w-4 h-4" />
              Annual report
            </button>
          </div>

          {/* Total Earning */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 text-black">
            <h6 className="text-sm font-semibold mb-4 text-black">Total Earning</h6>
            <div className="mb-6">
              <h2 className="text-4xl font-bold mb-2 text-black">
                ${((stats?.totalEarning || 5700000) / 1000000).toFixed(1)}m
              </h2>
              <p className="text-sm text-black/90">{stats?.orders || 673} Orders</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/30">
              <div>
                <p className="text-xs text-black/80 mb-1">245 Pickups</p>
                <p className="text-lg font-semibold text-black">
                  ${((stats?.pickupsAmount || 2780000) / 1000000).toFixed(2)}m
                </p>
              </div>
              <div>
                <p className="text-xs text-black/80 mb-1">120 Shipment</p>
                <p className="text-lg font-semibold text-black">
                  ${(stats?.shipmentsAmount || 65823).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Orders Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Orders Status</h6>
            <div className="mb-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full"
                  style={{ width: '70%' }}
                ></div>
              </div>
            </div>
            <div className="space-y-3">
              {ordersStatusData.map((status, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: status.color }}
                    ></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{status.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-black">
                    {status.value}%
                  </span>
              </div>
            ))}
          </div>
        </div>

          {/* Task Update Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h6 className="text-lg font-semibold text-gray-900 dark:text-black">Task Update</h6>
              <div className="flex items-center gap-2">
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</button>
                <button className="px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-1 text-sm font-medium">
                  <Plus className="w-4 h-4" />
                  New Task
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                { task: 'Prepare monthly financial report', completed: false, time: '04:25PM' },
                { task: 'Develop new marketing strategy', completed: true, time: '04:25PM', color: 'purple' },
                { task: 'Reply to customer emails', completed: false, time: '04:25PM' },
                { task: 'Update website content', completed: false, time: '04:25PM' },
                { task: 'Review employee performance', completed: true, time: '04:25PM', color: 'purple' },
                { task: 'Reply to customer emails', completed: true, time: '04:25PM', color: 'green' },
                { task: 'Reply to customer emails', completed: true, time: '04:25PM', color: 'orange' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    readOnly
                    className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <p className={`text-sm ${item.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-black'}`}>
                      {item.task}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.time}</p>
                  </div>
                  <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>

    </div>
  );
}
