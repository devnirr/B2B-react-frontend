import { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

export default function KPIReports() {
  const [kpis] = useState([
    { id: 1, name: 'Sales Revenue', value: '$125,430', change: 12.5, trend: 'up' },
    { id: 2, name: 'Orders', value: '1,234', change: -3.2, trend: 'down' },
    { id: 3, name: 'Customers', value: '5,678', change: 8.7, trend: 'up' },
    { id: 4, name: 'Inventory Value', value: '$89,450', change: 5.3, trend: 'up' },
  ]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">KPI Reports</h1>
        <p className="text-gray-600 dark:text-gray-400">Key Performance Indicators and metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              {kpi.trend === 'up' ? (
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{kpi.name}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{kpi.value}</p>
            <p className={`text-sm ${kpi.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {kpi.trend === 'up' ? '+' : ''}{kpi.change}% from last period
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

