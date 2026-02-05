import { useQuery } from '@tanstack/react-query';
import { useState, useRef, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import api from '../lib/api';
import {
  Globe,
  Store,
  Package,
  ArrowLeftRight,
  ShoppingCart,
  Plus,
  X,
  ChevronsLeft,
  ChevronsRight,
  Pencil,
  Trash2,
  AlertTriangle,
  ChevronDown,
  Search,
  Filter,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  User,
  Truck,
  Box,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';
import { SkeletonPage } from '../components/Skeleton';
import Breadcrumb from '../components/Breadcrumb';

// Types
interface BOPISOrder {
  id?: string | number;
  orderId: number;
  orderNumber: string;
  customerId: number;
  customer?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  storeId: number;
  storeName?: string;
  storeAddress?: string;
  storeCity?: string;
  status: 'PENDING' | 'READY_FOR_PICKUP' | 'PICKED_UP' | 'CANCELLED' | 'EXPIRED';
  items: BOPISOrderItem[];
  orderDate: string;
  readyForPickupDate?: string;
  pickedUpDate?: string;
  expiryDate?: string;
  pickupInstructions?: string;
  customerNotes?: string;
  totalAmount: number;
  currency: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BOPISOrderItem {
  id?: string | number;
  orderLineId: number;
  productId: number;
  productName?: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  size?: string;
  color?: string;
  isReady: boolean;
  readyAt?: string;
}

interface BORISReturn {
  id?: string | number;
  returnId: number;
  returnNumber: string;
  orderId: number;
  orderNumber?: string;
  customerId: number;
  customer?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  storeId: number;
  storeName?: string;
  storeAddress?: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'RECEIVED' | 'PROCESSED' | 'REJECTED' | 'CANCELLED';
  items: BORISReturnItem[];
  returnDate: string;
  receivedDate?: string;
  processedDate?: string;
  reason: string;
  refundAmount: number;
  currency: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BORISReturnItem {
  id?: string | number;
  orderLineId: number;
  productId: number;
  productName?: string;
  sku?: string;
  quantity: number;
  condition: 'NEW' | 'USED' | 'DAMAGED' | 'DEFECTIVE';
  refundAmount: number;
  notes?: string;
}

interface EndlessAisleProduct {
  id?: string | number;
  productId: number;
  productName: string;
  sku: string;
  description?: string;
  basePrice: number;
  currency: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  availableAtWarehouses: EndlessAisleWarehouse[];
  estimatedShippingDays: number;
  isAvailable: boolean;
  category?: string;
  collection?: string;
  createdAt?: string;
}

interface EndlessAisleWarehouse {
  warehouseId: number;
  warehouseName: string;
  warehouseCity?: string;
  warehouseCountry?: string;
  availableQuantity: number;
  estimatedShippingDays: number;
}

interface Store {
  id: number;
  name: string;
  code?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  operatingHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
}

interface Warehouse {
  id: number;
  name: string;
  address?: string;
  city?: string;
  country?: string;
}

// Custom Select Component
const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  error = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
  error?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(options[highlightedIndex].value);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div ref={selectRef} className={`relative ${className}`} style={{ zIndex: isOpen ? 9999 : 'auto' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white flex items-center justify-between bg-white ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
        style={{
          padding: '0.532rem 0.8rem 0.532rem 1.2rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          lineHeight: 1.6,
        }}
      >
        <span className={selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div 
          className="absolute w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden custom-dropdown-menu"
          style={{
            zIndex: 10001,
            top: '100%',
            left: 0,
            right: 0,
            minWidth: '100%',
            position: 'absolute',
            maxHeight: '400px',
          }}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlightedIndex && !isSelected;
            
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  isSelected
                    ? 'bg-blue-500 text-white font-medium'
                    : isHighlighted
                    ? 'bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
                style={{
                  fontSize: '0.875rem',
                  fontWeight: isSelected ? 500 : 400,
                  display: 'block',
                  width: '100%',
                  lineHeight: '1.5',
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function Omnichannel() {
  const [activeTab, setActiveTab] = useState<'bopis' | 'boris' | 'endless-aisle'>('bopis');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Local storage keys
  const BOPIS_ORDERS_KEY = 'omnichannel_bopis_orders';
  const BORIS_RETURNS_KEY = 'omnichannel_boris_returns';
  const ENDLESS_AISLE_PRODUCTS_KEY = 'omnichannel_endless_aisle_products';
  const STORES_KEY = 'omnichannel_stores';

  // Fetch orders
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      try {
        const response = await api.get('/orders');
        return response.data || [];
      } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
      }
    },
  });

  // Fetch warehouses (used as stores for BOPIS/BORIS)
  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      try {
        const response = await api.get('/warehouses');
        return response.data || [];
      } catch (error) {
        console.error('Error fetching warehouses:', error);
        return [];
      }
    },
  });

  const warehouses: Warehouse[] = useMemo(() => {
    return Array.isArray(warehousesData) ? warehousesData : (warehousesData?.data || []);
  }, [warehousesData]);

  // Load BOPIS orders, BORIS returns, endless aisle products, and stores from localStorage
  const [bopisOrders, setBopisOrders] = useState<BOPISOrder[]>([]);
  const [borisReturns, setBorisReturns] = useState<BORISReturn[]>([]);
  const [endlessAisleProducts, setEndlessAisleProducts] = useState<EndlessAisleProduct[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    try {
      const storedBopisOrders = localStorage.getItem(BOPIS_ORDERS_KEY);
      if (storedBopisOrders) {
        setBopisOrders(JSON.parse(storedBopisOrders));
      }
    } catch (error) {
      console.error('Error loading BOPIS orders:', error);
    }

    try {
      const storedBorisReturns = localStorage.getItem(BORIS_RETURNS_KEY);
      if (storedBorisReturns) {
        setBorisReturns(JSON.parse(storedBorisReturns));
      }
    } catch (error) {
      console.error('Error loading BORIS returns:', error);
    }

    try {
      const storedEndlessAisle = localStorage.getItem(ENDLESS_AISLE_PRODUCTS_KEY);
      if (storedEndlessAisle) {
        setEndlessAisleProducts(JSON.parse(storedEndlessAisle));
      }
    } catch (error) {
      console.error('Error loading endless aisle products:', error);
    }

    try {
      const storedStores = localStorage.getItem(STORES_KEY);
      if (storedStores) {
        setStores(JSON.parse(storedStores));
      } else {
        // Initialize stores from warehouses if no stores exist
        const initialStores: Store[] = warehouses.map((w) => ({
          id: w.id,
          name: w.name,
          address: w.address,
          city: w.city,
          country: w.country,
          isActive: true,
        }));
        if (initialStores.length > 0) {
          setStores(initialStores);
          localStorage.setItem(STORES_KEY, JSON.stringify(initialStores));
        }
      }
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  }, [warehouses]);

  // Save functions
  const saveBopisOrders = (orders: BOPISOrder[]) => {
    try {
      localStorage.setItem(BOPIS_ORDERS_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving BOPIS orders:', error);
    }
  };

  const saveBorisReturns = (returns: BORISReturn[]) => {
    try {
      localStorage.setItem(BORIS_RETURNS_KEY, JSON.stringify(returns));
    } catch (error) {
      console.error('Error saving BORIS returns:', error);
    }
  };

  const saveEndlessAisleProducts = (products: EndlessAisleProduct[]) => {
    try {
      localStorage.setItem(ENDLESS_AISLE_PRODUCTS_KEY, JSON.stringify(products));
    } catch (error) {
      console.error('Error saving endless aisle products:', error);
    }
  };

  // Filter BOPIS orders
  const filteredBopisOrders = useMemo(() => {
    let filtered = bopisOrders;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(query) ||
          order.customer?.name.toLowerCase().includes(query) ||
          order.storeName?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (storeFilter !== 'all') {
      filtered = filtered.filter((order) => order.storeId === Number(storeFilter));
    }

    return filtered.sort((a, b) => {
      const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
      const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
      return dateB - dateA;
    });
  }, [bopisOrders, searchQuery, statusFilter, storeFilter]);

  if (isLoadingOrders) {
    return <SkeletonPage />;
  }

  return (
    <div>
      <Breadcrumb currentPage="Omnichannel" />
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Omnichannel</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage BOPIS, BORIS, and Endless Aisle operations
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">BOPIS Orders</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {bopisOrders.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Ready for Pickup</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                {bopisOrders.filter((o) => o.status === 'READY_FOR_PICKUP').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">BORIS Returns</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {borisReturns.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Endless Aisle Products</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {endlessAisleProducts.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('bopis');
                setCurrentPage(1);
              }}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'bopis'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                BOPIS Orders
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('boris');
                setCurrentPage(1);
              }}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'boris'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4" />
                BORIS Returns
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('endless-aisle');
                setCurrentPage(1);
              }}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'endless-aisle'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Endless Aisle
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* BOPIS Orders Tab */}
          {activeTab === 'bopis' && (
            <>
              {/* Search and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search BOPIS orders..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <CustomSelect
                    value={statusFilter}
                    onChange={(value) => {
                      setStatusFilter(value);
                      setCurrentPage(1);
                    }}
                    options={[
                      { value: 'all', label: 'All Status' },
                      { value: 'PENDING', label: 'Pending' },
                      { value: 'READY_FOR_PICKUP', label: 'Ready for Pickup' },
                      { value: 'PICKED_UP', label: 'Picked Up' },
                      { value: 'CANCELLED', label: 'Cancelled' },
                      { value: 'EXPIRED', label: 'Expired' },
                    ]}
                  />
                </div>
                <div>
                  <CustomSelect
                    value={storeFilter}
                    onChange={(value) => {
                      setStoreFilter(value);
                      setCurrentPage(1);
                    }}
                    options={[
                      { value: 'all', label: 'All Stores' },
                      ...stores.map((s) => ({ value: s.id.toString(), label: s.name })),
                    ]}
                  />
                </div>
              </div>

              {/* BOPIS Orders Table */}
              {filteredBopisOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {searchQuery || statusFilter !== 'all' || storeFilter !== 'all'
                      ? 'No matching BOPIS orders found'
                      : 'No BOPIS orders found'}
                  </p>
                  <button
                    onClick={() => {
                      toast.success('Create BOPIS order feature coming soon');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create First BOPIS Order
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Order #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Store
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Items
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Order Date
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredBopisOrders
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((order) => {
                          const store = stores.find((s) => s.id === order.storeId);
                          const itemsCount = order.items?.length || 0;
                          const readyItems = order.items?.filter((i) => i.isReady).length || 0;

                          return (
                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {order.orderNumber}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {order.customer?.name || 'Unknown'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {store?.name || order.storeName || 'Unknown'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {readyItems} / {itemsCount} ready
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    order.status === 'READY_FOR_PICKUP'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                      : order.status === 'PICKED_UP'
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                      : order.status === 'PENDING'
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                      : order.status === 'CANCELLED' || order.status === 'EXPIRED'
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                  }`}
                                >
                                  {order.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '—'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      toast('View BOPIS order details feature coming soon');
                                    }}
                                    className="text-primary-600 hover:text-primary-900 dark:text-primary-400 p-1 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
                                    title="View Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {Math.ceil(filteredBopisOrders.length / itemsPerPage) > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredBopisOrders.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredBopisOrders.length}</span> orders
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronDown className="w-4 h-4 rotate-90" />
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300 px-4">
                      Page {currentPage} of {Math.ceil(filteredBopisOrders.length / itemsPerPage)}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(Math.ceil(filteredBopisOrders.length / itemsPerPage), prev + 1))
                      }
                      disabled={currentPage >= Math.ceil(filteredBopisOrders.length / itemsPerPage)}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronDown className="w-4 h-4 -rotate-90" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.ceil(filteredBopisOrders.length / itemsPerPage))}
                      disabled={currentPage >= Math.ceil(filteredBopisOrders.length / itemsPerPage)}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* BORIS Returns Tab - Placeholder */}
          {activeTab === 'boris' && (
            <div className="flex flex-col items-center justify-center py-12">
              <ArrowLeftRight className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">BORIS Returns section coming soon...</p>
            </div>
          )}

          {/* Endless Aisle Tab - Placeholder */}
          {activeTab === 'endless-aisle' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Globe className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Endless Aisle section coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
