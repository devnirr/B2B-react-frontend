import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft } from 'lucide-react';
import { SkeletonPage } from '../components/Skeleton';
import Breadcrumb from '../components/Breadcrumb';
import Pagination, { ITEMS_PER_PAGE } from '../components/ui/Pagination';

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'event';
  location?: string;
  description?: string;
}

export default function UpcomingEvents() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch orders to use as calendar events
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders', 'upcoming-events'],
    queryFn: async () => {
      const response = await api.get('/orders?skip=0&take=10000');
      return response.data?.data || [];
    },
  });

  // Transform orders into calendar events
  const events: CalendarEvent[] = useMemo(() => {
    if (!ordersData || ordersData.length === 0) return [];

    return ordersData
      .map((order: any) => {
        const orderDate = new Date(order.orderDate || order.createdAt);
        const requiredDate = order.requiredDate ? new Date(order.requiredDate) : null;
        
        // Use required date if available, otherwise use order date
        const eventDate = requiredDate || orderDate;
        const dateStr = eventDate.toISOString().split('T')[0];
        const timeStr = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        
        return {
          id: order.id,
          title: `Order ${order.orderNumber || `#${order.id}`}`,
          date: dateStr,
          time: timeStr,
          type: 'event',
          location: order.shippingAddress || undefined,
          description: `Order for ${order.customer?.name || 'Customer'} - Status: ${order.status}`,
        };
      })
      .sort((a: CalendarEvent, b: CalendarEvent) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [ordersData]);

  // Pagination calculations
  const totalEvents = events.length;
  const totalPages = Math.ceil(totalEvents / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEvents = events.slice(startIndex, endIndex);

  if (isLoading) {
    return <SkeletonPage />;
  }

  return (
    <div>
      <Breadcrumb currentPage="Upcoming Events" />
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upcoming Events</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage all your upcoming events</p>
          </div>
          <button
            onClick={() => navigate('/calendar')}
            className="px-4 text-[14px] py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Calendar
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            All Upcoming Events ({totalEvents})
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {startIndex + 1} to {Math.min(endIndex, totalEvents)} of {totalEvents} events
          </p>
        </div>

        {paginatedEvents.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No upcoming events</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">There are no events scheduled at this time.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center border-2 border-purple-200 dark:border-purple-800">
                        <CalendarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{event.title}</h4>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(event.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })} • {event.time}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{event.location}</span>
                          </div>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{event.description}</p>
                      )}
                      <span className={`inline-block mt-3 px-3 py-1 text-xs font-medium rounded-full ${
                        event.type === 'meeting'
                          ? 'bg-blue-500 text-white'
                          : 'bg-purple-500 text-white'
                      }`}>
                        {event.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalEvents}
                onPageChange={setCurrentPage}
                className="mt-6"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

