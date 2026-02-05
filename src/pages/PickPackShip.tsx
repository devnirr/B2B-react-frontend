import { useQuery } from '@tanstack/react-query';
import { useState, useRef, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import api from '../lib/api';
import {
  Plus,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  Search,
  ClipboardList,
  FileText,
  Printer,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Box,
  Tag,
  Barcode,
} from 'lucide-react';
import { SkeletonPage } from '../components/Skeleton';
import Breadcrumb from '../components/Breadcrumb';

// Types
// interface Order {
//   id: number;
//   orderNumber: string;
//   customerId: number;
//   customer?: {
//     id: number;
//     name: string;
//     address?: string;
//     city?: string;
//     country?: string;
//   };
//   type: 'DTC' | 'POS' | 'B2B' | 'WHOLESALE';
//   status: string;
//   totalAmount: number;
//   currency: string;
//   orderDate: string;
//   shippingAddress?: string;
//   orderLines?: OrderLine[];
// }

// interface OrderLine {
//   id: number;
//   productId: number;
//   product?: {
//     id: number;
//     name: string;
//     sku: string;
//   };
//   quantity: number;
//   fulfilledQty: number;
//   unitPrice: number;
//   size?: string;
//   color?: string;
// }

interface PickList {
  id?: string | number;
  pickListNumber: string;
  orderId: number;
  orderNumber?: string;
  warehouseId: number;
  warehouseName?: string;
  status: 'DRAFT' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedTo?: string;
  items: PickListItem[];
  createdAt?: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
}

interface PickListItem {
  id?: string | number;
  orderLineId: number;
  productId: number;
  productName?: string;
  sku?: string;
  binLocation?: string;
  quantity: number;
  pickedQuantity?: number;
  status: 'PENDING' | 'PICKED' | 'PARTIAL' | 'SKIPPED';
  pickedBy?: string;
  pickedAt?: string;
  notes?: string;
}

interface PackSlip {
  id?: string | number;
  packSlipNumber: string;
  orderId: number;
  orderNumber?: string;
  pickListId?: string | number;
  warehouseId: number;
  warehouseName?: string;
  status: 'DRAFT' | 'PACKING' | 'PACKED' | 'SHIPPED' | 'CANCELLED';
  packedBy?: string;
  packedAt?: string;
  items: PackSlipItem[];
  packageCount?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  notes?: string;
  createdAt?: string;
}

interface PackSlipItem {
  id?: string | number;
  orderLineId: number;
  productId: number;
  productName?: string;
  sku?: string;
  quantity: number;
  packedQuantity?: number;
  packageNumber?: number;
  notes?: string;
}

interface ShippingLabel {
  id?: string | number;
  labelNumber: string;
  orderId: number;
  orderNumber?: string;
  packSlipId?: string | number;
  shipmentNumber?: string;
  carrier: 'FEDEX' | 'UPS' | 'DHL' | 'USPS' | 'OTHER';
  serviceType?: string;
  trackingNumber?: string;
  fromAddress: {
    name: string;
    address: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  toAddress: {
    name: string;
    address: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  cost?: number;
  status: 'DRAFT' | 'GENERATED' | 'PRINTED' | 'SHIPPED' | 'CANCELLED';
  generatedAt?: string;
  printedAt?: string;
  labelUrl?: string;
  createdAt?: string;
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

export default function PickPackShip() {
  const [activeTab, setActiveTab] = useState<'pick-lists' | 'pack-slips' | 'shipping-labels'>('pick-lists');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Local storage keys
  const PICK_LISTS_KEY = 'pick_pack_ship_pick_lists';
  const PACK_SLIPS_KEY = 'pick_pack_ship_pack_slips';
  const SHIPPING_LABELS_KEY = 'pick_pack_ship_shipping_labels';

  // Fetch orders (for future use when creating pick lists/pack slips/shipping labels)
  const { isLoading: isLoadingOrders } = useQuery({
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

  // Orders are available for creating pick lists, pack slips, and shipping labels
  // const orders: Order[] = useMemo(() => {
  //   const data = Array.isArray(ordersData) ? ordersData : (ordersData?.data || []);
  //   return data.filter((order: any) => 
  //     order.status === 'CONFIRMED' || 
  //     order.status === 'PROCESSING' || 
  //     order.status === 'PARTIALLY_FULFILLED'
  //   );
  // }, [ordersData]);

  // Fetch warehouses
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

  // Load pick lists, pack slips, and shipping labels from localStorage
  const [pickLists, setPickLists] = useState<PickList[]>([]);
  const [packSlips, setPackSlips] = useState<PackSlip[]>([]);
  const [shippingLabels, setShippingLabels] = useState<ShippingLabel[]>([]);

  useEffect(() => {
    try {
      const storedPickLists = localStorage.getItem(PICK_LISTS_KEY);
      if (storedPickLists) {
        setPickLists(JSON.parse(storedPickLists));
      }
    } catch (error) {
      console.error('Error loading pick lists:', error);
    }

    try {
      const storedPackSlips = localStorage.getItem(PACK_SLIPS_KEY);
      if (storedPackSlips) {
        setPackSlips(JSON.parse(storedPackSlips));
      }
    } catch (error) {
      console.error('Error loading pack slips:', error);
    }

    try {
      const storedShippingLabels = localStorage.getItem(SHIPPING_LABELS_KEY);
      if (storedShippingLabels) {
        setShippingLabels(JSON.parse(storedShippingLabels));
      }
    } catch (error) {
      console.error('Error loading shipping labels:', error);
    }
  }, []);

  // Save functions (used when creating/updating items)
  // const savePickLists = (lists: PickList[]) => {
  //   try {
  //     localStorage.setItem(PICK_LISTS_KEY, JSON.stringify(lists));
  //   } catch (error) {
  //     console.error('Error saving pick lists:', error);
  //   }
  // };

  // const savePackSlips = (slips: PackSlip[]) => {
  //   try {
  //     localStorage.setItem(PACK_SLIPS_KEY, JSON.stringify(slips));
  //   } catch (error) {
  //     console.error('Error saving pack slips:', error);
  //   }
  // };

  // const saveShippingLabels = (labels: ShippingLabel[]) => {
  //   try {
  //     localStorage.setItem(SHIPPING_LABELS_KEY, JSON.stringify(labels));
  //   } catch (error) {
  //     console.error('Error saving shipping labels:', error);
  //   }
  // };

  // Filter pick lists
  const filteredPickLists = useMemo(() => {
    let filtered = pickLists;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (list) =>
          list.pickListNumber.toLowerCase().includes(query) ||
          list.orderNumber?.toLowerCase().includes(query) ||
          list.warehouseName?.toLowerCase().includes(query) ||
          list.assignedTo?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((list) => list.status === statusFilter);
    }

    if (warehouseFilter !== 'all') {
      filtered = filtered.filter((list) => list.warehouseId === Number(warehouseFilter));
    }

    return filtered.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [pickLists, searchQuery, statusFilter, warehouseFilter]);

  // Filter pack slips
  const filteredPackSlips = useMemo(() => {
    let filtered = packSlips;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (slip) =>
          slip.packSlipNumber.toLowerCase().includes(query) ||
          slip.orderNumber?.toLowerCase().includes(query) ||
          slip.warehouseName?.toLowerCase().includes(query) ||
          slip.packedBy?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((slip) => slip.status === statusFilter);
    }

    if (warehouseFilter !== 'all') {
      filtered = filtered.filter((slip) => slip.warehouseId === Number(warehouseFilter));
    }

    return filtered.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [packSlips, searchQuery, statusFilter, warehouseFilter]);

  // Filter shipping labels
  const filteredShippingLabels = useMemo(() => {
    let filtered = shippingLabels;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (label) =>
          label.labelNumber.toLowerCase().includes(query) ||
          label.orderNumber?.toLowerCase().includes(query) ||
          label.trackingNumber?.toLowerCase().includes(query) ||
          label.carrier.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((label) => label.status === statusFilter);
    }

    return filtered.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [shippingLabels, searchQuery, statusFilter]);

  // Get current tab data
  const currentData = useMemo(() => {
    if (activeTab === 'pick-lists') return filteredPickLists;
    if (activeTab === 'pack-slips') return filteredPackSlips;
    return filteredShippingLabels;
  }, [activeTab, filteredPickLists, filteredPackSlips, filteredShippingLabels]);

  // Pagination
  const totalItems = currentData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return currentData.slice(startIndex, startIndex + itemsPerPage);
  }, [currentData, currentPage, itemsPerPage]);

  // Summary metrics
  const summaryMetrics = useMemo(() => {
    const pickListsTotal = pickLists.length;
    const pickListsInProgress = pickLists.filter((l) => l.status === 'IN_PROGRESS' || l.status === 'ASSIGNED').length;
    const pickListsCompleted = pickLists.filter((l) => l.status === 'COMPLETED').length;

    const packSlipsTotal = packSlips.length;
    const packSlipsPacking = packSlips.filter((s) => s.status === 'PACKING').length;
    const packSlipsPacked = packSlips.filter((s) => s.status === 'PACKED').length;

    const shippingLabelsTotal = shippingLabels.length;
    const shippingLabelsGenerated = shippingLabels.filter((l) => l.status === 'GENERATED' || l.status === 'PRINTED').length;
    const shippingLabelsShipped = shippingLabels.filter((l) => l.status === 'SHIPPED').length;

    return {
      pickLists: { total: pickListsTotal, inProgress: pickListsInProgress, completed: pickListsCompleted },
      packSlips: { total: packSlipsTotal, packing: packSlipsPacking, packed: packSlipsPacked },
      shippingLabels: { total: shippingLabelsTotal, generated: shippingLabelsGenerated, shipped: shippingLabelsShipped },
    };
  }, [pickLists, packSlips, shippingLabels]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
      case 'ASSIGNED':
      case 'PACKING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'COMPLETED':
      case 'PACKED':
      case 'GENERATED':
      case 'PRINTED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  if (isLoadingOrders) {
    return <SkeletonPage />;
  }

  return (
    <div>
      <Breadcrumb currentPage="Pick / Pack / Ship" />
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pick / Pack / Ship</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage pick lists, pack slips, and shipping labels for order fulfillment
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-9 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Pick Lists</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {summaryMetrics.pickLists.total}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                {summaryMetrics.pickLists.inProgress}
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
              <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                {summaryMetrics.pickLists.completed}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Pack Slips</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {summaryMetrics.packSlips.total}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Packing</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {summaryMetrics.packSlips.packing}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Box className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Packed</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                {summaryMetrics.packSlips.packed}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Shipping Labels</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {summaryMetrics.shippingLabels.total}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Generated</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {summaryMetrics.shippingLabels.generated}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Barcode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Shipped</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {summaryMetrics.shippingLabels.shipped}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
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
                setActiveTab('pick-lists');
                setCurrentPage(1);
              }}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'pick-lists'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Pick Lists
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('pack-slips');
                setCurrentPage(1);
              }}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'pack-slips'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Pack Slips
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('shipping-labels');
                setCurrentPage(1);
              }}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'shipping-labels'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Shipping Labels
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'pick-lists' ? 'pick lists' : activeTab === 'pack-slips' ? 'pack slips' : 'shipping labels'}...`}
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
                  ...(activeTab === 'pick-lists'
                    ? [
                        { value: 'DRAFT', label: 'Draft' },
                        { value: 'ASSIGNED', label: 'Assigned' },
                        { value: 'IN_PROGRESS', label: 'In Progress' },
                        { value: 'COMPLETED', label: 'Completed' },
                      ]
                    : activeTab === 'pack-slips'
                    ? [
                        { value: 'DRAFT', label: 'Draft' },
                        { value: 'PACKING', label: 'Packing' },
                        { value: 'PACKED', label: 'Packed' },
                        { value: 'SHIPPED', label: 'Shipped' },
                      ]
                    : [
                        { value: 'DRAFT', label: 'Draft' },
                        { value: 'GENERATED', label: 'Generated' },
                        { value: 'PRINTED', label: 'Printed' },
                        { value: 'SHIPPED', label: 'Shipped' },
                      ]),
                ]}
              />
            </div>
            {(activeTab === 'pick-lists' || activeTab === 'pack-slips') && (
              <div>
                <CustomSelect
                  value={warehouseFilter}
                  onChange={(value) => {
                    setWarehouseFilter(value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: 'all', label: 'All Warehouses' },
                    ...warehouses.map((w) => ({ value: w.id.toString(), label: w.name })),
                  ]}
                />
              </div>
            )}
          </div>

          {/* Header with Create Button */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {activeTab === 'pick-lists' ? 'Pick Lists' : activeTab === 'pack-slips' ? 'Pack Slips' : 'Shipping Labels'}
            </h3>
            <button
              onClick={() => {
                if (activeTab === 'pick-lists') {
                  // Create pick list functionality will be added
                  toast.success('Create pick list feature coming soon');
                } else if (activeTab === 'pack-slips') {
                  toast.success('Create pack slip feature coming soon');
                } else {
                  toast.success('Create shipping label feature coming soon');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create {activeTab === 'pick-lists' ? 'Pick List' : activeTab === 'pack-slips' ? 'Pack Slip' : 'Shipping Label'}
            </button>
          </div>

          {/* Table */}
          {paginatedData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              {activeTab === 'pick-lists' && <ClipboardList className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />}
              {activeTab === 'pack-slips' && <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />}
              {activeTab === 'shipping-labels' && <Tag className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />}
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery || statusFilter !== 'all' || warehouseFilter !== 'all'
                  ? 'No matching items found'
                  : `No ${activeTab === 'pick-lists' ? 'pick lists' : activeTab === 'pack-slips' ? 'pack slips' : 'shipping labels'} found`}
              </p>
              {!searchQuery && statusFilter === 'all' && warehouseFilter === 'all' && (
                <button
                  onClick={() => {
                    if (activeTab === 'pick-lists') {
                      toast.success('Create pick list feature coming soon');
                    } else if (activeTab === 'pack-slips') {
                      toast.success('Create pack slip feature coming soon');
                    } else {
                      toast.success('Create shipping label feature coming soon');
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create First {activeTab === 'pick-lists' ? 'Pick List' : activeTab === 'pack-slips' ? 'Pack Slip' : 'Shipping Label'}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      {activeTab === 'pick-lists' && (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Pick List #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Order #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Warehouse
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Items
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Assigned To
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Status
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Actions
                          </th>
                        </>
                      )}
                      {activeTab === 'pack-slips' && (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Pack Slip #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Order #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Warehouse
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Packages
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Packed By
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Status
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Actions
                          </th>
                        </>
                      )}
                      {activeTab === 'shipping-labels' && (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Label #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Order #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Carrier
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Tracking #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Status
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Actions
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedData.map((item: any) => {
                      const warehouse = warehouses.find((w) => w.id === item.warehouseId);
                      const itemsCount = item.items?.length || 0;
                      const completedItems = activeTab === 'pick-lists' 
                        ? item.items?.filter((i: any) => i.status === 'PICKED').length || 0
                        : activeTab === 'pack-slips'
                        ? item.items?.filter((i: any) => i.packedQuantity && i.packedQuantity > 0).length || 0
                        : 0;
                      const progress = itemsCount > 0 ? Math.round((completedItems / itemsCount) * 100) : 0;

                      return (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          {activeTab === 'pick-lists' && (
                            <>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.pickListNumber}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {item.orderNumber || `Order #${item.orderId}`}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {warehouse?.name || item.warehouseName || 'Unknown'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {completedItems} / {itemsCount}
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                                  <div
                                    className="bg-primary-600 h-1.5 rounded-full"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {item.assignedTo || '—'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                                >
                                  {item.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      // View pick list details
                                      toast('View pick list details feature coming soon');
                                    }}
                                    className="text-primary-600 hover:text-primary-900 dark:text-primary-400 p-1 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
                                    title="View Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      // Print pick list
                                      window.print();
                                      toast.success('Printing pick list...');
                                    }}
                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                    title="Print"
                                  >
                                    <Printer className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                          {activeTab === 'pack-slips' && (
                            <>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.packSlipNumber}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {item.orderNumber || `Order #${item.orderId}`}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {warehouse?.name || item.warehouseName || 'Unknown'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {item.packageCount || 1} package{item.packageCount !== 1 ? 's' : ''}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {item.packedBy || '—'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                                >
                                  {item.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      // View pack slip details
                                      toast('View pack slip details feature coming soon');
                                    }}
                                    className="text-primary-600 hover:text-primary-900 dark:text-primary-400 p-1 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
                                    title="View Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      // Print pack slip
                                      window.print();
                                      toast.success('Printing pack slip...');
                                    }}
                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                    title="Print"
                                  >
                                    <Printer className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                          {activeTab === 'shipping-labels' && (
                            <>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.labelNumber}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {item.orderNumber || `Order #${item.orderId}`}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400">
                                  {item.carrier}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                                {item.trackingNumber || '—'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                                >
                                  {item.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      // View shipping label
                                      toast('View shipping label feature coming soon');
                                    }}
                                    className="text-primary-600 hover:text-primary-900 dark:text-primary-400 p-1 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
                                    title="View Label"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      // Print shipping label
                                      window.print();
                                      toast.success('Printing shipping label...');
                                    }}
                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                    title="Print Label"
                                  >
                                    <Printer className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      // Download shipping label
                                      toast.success('Downloading shipping label...');
                                    }}
                                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 p-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                                    title="Download"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                    <span className="font-medium">{totalItems}</span> items
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
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronDown className="w-4 h-4 -rotate-90" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
