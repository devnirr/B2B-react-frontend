import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import api from '../lib/api';
import { SkeletonPage } from '../components/Skeleton';
import Breadcrumb from '../components/Breadcrumb';
import { SearchInput } from '../components/ui';
import Pagination, { ITEMS_PER_PAGE } from '../components/ui/Pagination';

interface AuditLog {
  id: number | string;
  user: string;
  action: string;
  entity: string;
  timestamp: string;
}

interface AuditLogResponse {
  id: number;
  userId: number;
  action: string;
  entityType: string;
  entityId: number | null;
  changes: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

export default function AuditLog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch audit logs from API
  const { data: auditLogsData, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      try {
        const response = await api.get('/audit-logs?skip=0&take=1000');
        return response.data?.data || [];
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }
    },
  });

  // Transform API data to display format
  const logs: AuditLog[] = useMemo(() => {
    if (!auditLogsData || !Array.isArray(auditLogsData)) {
      return [];
    }

    return auditLogsData.map((log: AuditLogResponse) => {
      // Get user name
      const userName = log.user
        ? `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim() || log.user.email || 'System'
        : 'System';

      // Format action
      const actionMap: Record<string, string> = {
        CREATE: 'Created',
        UPDATE: 'Updated',
        DELETE: 'Deleted',
        VIEW: 'Viewed',
        EXPORT: 'Exported',
      };
      const action = actionMap[log.action] || log.action;

      // Format entity
      const entity = log.entityId 
        ? `${log.entityType} #${log.entityId}`
        : log.entityType;

      // Format timestamp
      const timestamp = log.createdAt
        ? new Date(log.createdAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })
        : 'Unknown';

      return {
        id: log.id,
        user: userName,
        action: `${action} ${log.entityType}`,
        entity,
        timestamp,
      };
    });
  }, [auditLogsData]);

  // Sort by timestamp (most recent first)
  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });
  }, [logs]);

  // Filter by search query
  const filteredLogs = useMemo(() => {
    if (!searchQuery) return sortedLogs;
    
    const query = searchQuery.toLowerCase();
    return sortedLogs.filter(log => 
      log.user.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      log.entity.toLowerCase().includes(query)
    );
  }, [sortedLogs, searchQuery]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (isLoading) {
    return <SkeletonPage />;
  }

  return (
    <div>
      <Breadcrumb currentPage="Audit Log" />
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-bold text-gray-900 dark:text-white">Audit Log</h1>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
            placeholder="Search by user, action, or entity..."
          />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No audit logs found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
              There are no audit logs available at this time.
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Timestamp</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {log.user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white">{log.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white">{log.entity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-6 py-4 mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredLogs.length}
            onPageChange={setCurrentPage}
            className="border-0 pt-0 mt-0"
          />
        </div>
      )}
    </div>
  );
}

