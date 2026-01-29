import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../lib/api';
import { Wallet, ShoppingCart, TrendingUp, Target, Search, MoreVertical } from 'lucide-react';
import Chart from 'react-apexcharts';
import { SkeletonStatsCard } from '../components/Skeleton';

export default function SalesDashboard() {
  const [salesTimeRange, setSalesTimeRange] = useState<'today' | 'week' | 'month'>('month');

  // Fetch sales data
  const { data: salesData, isLoading } = useQuery({
    queryKey: ['sales', 'dashboard'],
    queryFn: async () => {
      const response = await api.get('/analytics/sales');
      return response.data;
    },
  });

  // Sales Chart Configuration
  const getSalesChartConfig = () => {
    const baseConfig = {
      chart: {
        height: 320,
        type: 'area' as const,
        zoom: { enabled: false },
        toolbar: { show: false },
      },
      colors: ['#5955D1', '#dc3545'],
      fill: {
        type: ['gradient', 'gradient'],
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.1,
          gradientToColors: ['#5955D1'],
          inverseColors: false,
          opacityFrom: 0.08,
          opacityTo: 0.01,
          stops: [20, 100],
        },
      },
      dataLabels: { enabled: false },
      stroke: {
        width: [2, 2],
        curve: 'smooth' as const,
        dashArray: [0, 0],
      },
      markers: {
        size: 0,
        colors: ['#FFFFFF'],
        strokeColors: '#17a2b8',
        strokeWidth: 2,
        hover: { size: 6 },
      },
      yaxis: {
        min: 0,
        max: 8000,
        tickAmount: 5,
        labels: {
          formatter: (value: number) => `$${(value / 100).toFixed(0)}K`,
          style: {
            colors: 'var(--bs-body-color)',
            fontSize: '13px',
            fontWeight: '500',
            fontFamily: 'var(--bs-body-font-family)',
          },
        },
      },
      grid: {
        borderColor: 'var(--bs-border-color)',
        strokeDashArray: 5,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      legend: {
        show: true,
        position: 'bottom' as const,
        horizontalAlign: 'center' as const,
        markers: {
          size: 5,
          shape: 'circle' as const,
          radius: 10,
          width: 10,
          height: 10,
        },
        labels: {
          colors: 'var(--bs-heading-color)',
          fontFamily: 'var(--bs-body-font-family)',
          fontSize: '13px',
        },
      },
      tooltip: {
        y: {
          formatter: (val: number) => `$ ${val}K`,
        },
      },
    };

    if (salesTimeRange === 'today') {
      return {
        ...baseConfig,
        series: [
          { name: 'Income', data: [500, 700, 650, 800, 900, 950, 880, 920, 970, 1020, 1100, 1200] },
          { name: 'Expenses', data: [300, 450, 400, 500, 480, 530, 490, 510, 560, 580, 600, 650] },
        ],
        xaxis: {
          categories: ['2 AM', '4 AM', '6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM', '12 AM'],
          axisBorder: { color: 'var(--bs-border-color)' },
          axisTicks: { show: false },
          labels: {
            style: {
              colors: 'var(--bs-body-color)',
              fontSize: '13px',
              fontWeight: '500',
              fontFamily: 'var(--bs-body-font-family)',
            },
          },
        },
      };
    } else if (salesTimeRange === 'week') {
      return {
        ...baseConfig,
        series: [
          { name: 'Income', data: [4200, 5200, 4800, 6100, 7000, 6400, 7200] },
          { name: 'Expenses', data: [3100, 3700, 3400, 4000, 4600, 4200, 3900] },
        ],
        xaxis: {
          categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          axisBorder: { color: 'var(--bs-border-color)' },
          axisTicks: { show: false },
          labels: {
            style: {
              colors: 'var(--bs-body-color)',
              fontSize: '13px',
              fontWeight: '500',
              fontFamily: 'var(--bs-body-font-family)',
            },
          },
        },
      };
    } else {
      return {
        ...baseConfig,
        series: [
          { name: 'Income', data: [3500, 5000, 4200, 5500, 5000, 6200, 4800, 6500, 5800, 7200, 6600, 7500] },
          { name: 'Expenses', data: [2500, 3100, 2900, 3700, 3300, 4100, 3600, 3900, 4200, 4000, 4600, 4300] },
        ],
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          axisBorder: { color: 'var(--bs-border-color)' },
          axisTicks: { show: false },
          labels: {
            style: {
              colors: 'var(--bs-body-color)',
              fontSize: '13px',
              fontWeight: '500',
              fontFamily: 'var(--bs-body-font-family)',
            },
          },
        },
      };
    }
  };

  // Monthly Target Chart
  const monthlyTargetChartConfig = {
    series: [75],
    chart: {
      type: 'radialBar' as const,
      offsetY: 0,
      height: 350,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -95,
        endAngle: 95,
        track: {
          background: 'rgba(89, 85, 209, 0.6)',
          strokeWidth: '10%',
          margin: 25,
        },
        dataLabels: {
          name: { show: false },
          value: {
            show: true,
            offsetY: -35,
            fontSize: '28px',
            fontFamily: 'var(--bs-body-font-family)',
            fontWeight: 600,
            color: 'var(--bs-dark)',
            formatter: () => '75.7%',
          },
        },
      },
    },
    grid: {
      padding: { top: 0, bottom: 0, left: 0, right: 0 },
    },
    fill: {
      colors: ['#5955D1'],
    },
  };

  // Visitors Chart
  const visitorsChartConfig = {
    series: [
      { name: 'Current', data: [4500, 2050, 3100, 4800, 1800, 2500] },
      { name: 'Last Month', data: [4040, 2050, 4200, 2800, 1800, 2050] },
    ],
    chart: {
      height: 295,
      type: 'bar' as const,
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
    },
    colors: ['#5955D1', '#f8f9fa'],
    fill: {
      type: ['gradient'],
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.1,
        gradientToColors: ['#17a2b8'],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.6,
        stops: [20, 100],
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '75%',
        borderRadius: 4,
        distributed: false,
      },
    },
    grid: {
      borderColor: 'var(--bs-border-color)',
      strokeDashArray: 5,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val: number) => `${val} Visitors`,
      },
    },
    xaxis: {
      categories: [['Mobile'], ['Desktop'], ['Tablet'], ['iPad pro'], ['iPhone'], ['Other']],
      axisBorder: { color: 'var(--bs-border-color)' },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: 'var(--bs-body-color)',
          fontSize: '13px',
          fontWeight: 500,
          fontFamily: 'var(--bs-body-font-family)',
        },
      },
    },
    yaxis: { show: false },
  };

  // Sample sales data
  const recentSales = [
    { id: '#TXN10234', customer: 'Emma Johnson', product: 'Wireless Headphones', amount: '$2499', payment: 'Debit Card', status: 'Failed' },
    { id: '#TXN10235', customer: 'Liam Smith', product: 'Smart Watch', amount: '$3299', payment: 'UPI', status: 'Pending' },
    { id: '#TXN10236', customer: 'Olivia Brown', product: 'Laptop Sleeve', amount: '$1249', payment: 'Credit Card', status: 'Completed' },
    { id: '#TXN10237', customer: 'Noah Davis', product: 'Bluetooth Speaker', amount: '$2799', payment: 'Wallet', status: 'Completed' },
    { id: '#TXN10238', customer: 'Sophia Wilson', product: 'DSLR Camera', amount: '$45499', payment: 'UPI', status: 'Completed' },
  ];

  const [salesSearch, setSalesSearch] = useState('');

  const filteredSales = recentSales.filter((sale) =>
    sale.id.toLowerCase().includes(salesSearch.toLowerCase()) ||
    sale.customer.toLowerCase().includes(salesSearch.toLowerCase()) ||
    sale.product.toLowerCase().includes(salesSearch.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string }> = {
      Completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
      Pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
      Failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
    };
    const style = statusMap[status] || statusMap.Pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            <a href="/dashboard" className="hover:text-primary">Home</a> / Sales Dashboard
          </nav>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Dashboard</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonStatsCard key={i} />)
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Earning</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">$12,354</h2>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded">
                  +12.4%
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Orders</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">10,654</h2>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded">
                  +18.2%
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Revenue Growth</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">+18.5%</h2>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Target className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Conversion Rate</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">7.6%</h2>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Report Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
            <h6 className="text-sm font-semibold text-gray-900 dark:text-white mb-0">Sales Report</h6>
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-full p-1">
              <button
                onClick={() => setSalesTimeRange('today')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  salesTimeRange === 'today'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setSalesTimeRange('week')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  salesTimeRange === 'week'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setSalesTimeRange('month')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  salesTimeRange === 'month'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Month
              </button>
            </div>
          </div>
          <div className="flex gap-5 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-0">
                <span className="text-gray-600 dark:text-gray-400">$</span>87,352<span className="text-primary">50</span>
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Average Income <span className="px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded ml-1">+12.4%</span>
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-0">
                <span className="text-gray-600 dark:text-gray-400">$</span>97,500<span className="text-primary">50</span>
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Average Expenses <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded ml-1">-7.3%</span>
              </p>
            </div>
          </div>
          <div className="-mx-3">
            <Chart
              type="area"
              height={320}
              series={getSalesChartConfig().series}
              options={getSalesChartConfig()}
            />
          </div>
        </div>

        {/* Monthly Target */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h6 className="text-sm font-semibold text-gray-900 dark:text-white mb-0">Monthly Target</h6>
          </div>
          <div className="p-4 pt-0 border-b border-gray-200 dark:border-gray-700">
            <div className="mb-0 -mt-2">
              <Chart type="radialBar" height={350} series={monthlyTargetChartConfig.series} options={monthlyTargetChartConfig} />
              <div className="-mt-10 text-center text-gray-900 dark:text-white font-semibold">32,500 Sales</div>
            </div>
          </div>
          <div className="p-4">
            <h6 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Sales Status</h6>
            <div className="flex gap-1 mb-4 bg-transparent">
              <div className="flex-1 bg-transparent" style={{ width: '75%' }}>
                <div className="h-2 bg-primary rounded"></div>
              </div>
              <div className="flex-1 bg-transparent" style={{ width: '20%' }}>
                <div className="h-2 bg-primary/75 rounded"></div>
              </div>
              <div className="flex-1 bg-transparent" style={{ width: '3%' }}>
                <div className="h-2 bg-primary/50 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Paid', value: '75%', opacity: 'opacity-100' },
                { label: 'Cancelled', value: '22%', opacity: 'opacity-75' },
                { label: 'Refunded', value: '3%', opacity: 'opacity-50' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 bg-primary ${item.opacity} rounded`}></div>
                    <h6 className="font-light text-gray-900 dark:text-white mb-0 text-sm">{item.label}</h6>
                  </div>
                  <strong className="text-gray-900 dark:text-white font-semibold">{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sales by Country and Visitors Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales by Country */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h6 className="text-sm font-semibold text-gray-900 dark:text-white mb-0">Sales by Country</h6>
            <a href="#" className="text-sm text-primary hover:text-primary/80">View All</a>
          </div>
          <div className="mb-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-0">$45,314</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">+8.2% vs last month</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { country: 'America', products: '4,265', flag: '🇺🇸' },
              { country: 'China', products: '3,740', flag: '🇨🇳' },
              { country: 'Germany', products: '2,980', flag: '🇩🇪' },
              { country: 'Japan', products: '1,640', flag: '🇯🇵' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{item.flag}</span>
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-0">{item.country}</h5>
                </div>
                <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-0">
                  {item.products} <span className="text-xs text-gray-600 dark:text-gray-400 font-normal">PRODUCTS</span>
                </h5>
              </div>
            ))}
          </div>
        </div>

        {/* Total Visitors */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h6 className="text-sm font-semibold text-gray-900 dark:text-white mb-0">Total Visitors</h6>
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-0">
              <span className="text-gray-600 dark:text-gray-400">$</span>12,552.<span className="text-primary">50</span>
            </h2>
          </div>
          <div className="-mx-3 -mt-2">
            <Chart type="bar" height={295} series={visitorsChartConfig.series} options={visitorsChartConfig} />
          </div>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 items-center justify-between">
          <h6 className="text-sm font-semibold text-gray-900 dark:text-white mb-0">Recent Sales</h6>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={salesSearch}
              onChange={(e) => setSalesSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600" />
                </th>
                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold min-w-[100px]">Order ID</th>
                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold min-w-[200px]">Customer Name</th>
                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold min-w-[200px]">Product</th>
                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold min-w-[100px]">Amount</th>
                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold min-w-[100px]">Payment</th>
                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold min-w-[100px]">Status</th>
                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold min-w-[100px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/30">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600" />
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{sale.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs">
                        {sale.customer.charAt(0)}
                      </div>
                      <span className="text-gray-900 dark:text-white">{sale.customer}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{sale.product}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-semibold">{sale.amount}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{sale.payment}</td>
                  <td className="px-4 py-3">{getStatusBadge(sale.status)}</td>
                  <td className="px-4 py-3">
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

