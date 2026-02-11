import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Plus } from 'lucide-react';
import api from '../lib/api';
import { SkeletonPage } from '../components/Skeleton';
import Breadcrumb from '../components/Breadcrumb';
import { SearchInput } from '../components/ui';
import Pagination, { ITEMS_PER_PAGE } from '../components/ui/Pagination';

export default function ContentReadiness() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', 'content-readiness'],
    queryFn: async () => {
      try {
        const response = await api.get('/products?skip=0&take=1000');
        return response.data?.data || [];
      } catch (error) {
        return [];
      }
    },
  });

  const products = productsData || [];

  // Fetch DAM assets for content readiness
  const { data: damAssetsData } = useQuery({
    queryKey: ['dam-assets', 'content-readiness'],
    queryFn: async () => {
      try {
        const response = await api.get('/dam?skip=0&take=10000');
        return response.data?.data || [];
      } catch (error) {
        return [];
      }
    },
  });

  const damAssets = damAssetsData || [];

  // Transform products into content readiness format based on actual DAM assets
  const content = products.map((product: any) => {
    const hasImages = product.images && product.images.length > 0;
    const hasDescription = product.description && product.description.length > 0;
    
    // Get DAM assets for this product
    const productAssets = damAssets.filter((asset: any) => asset.productId === product.id);
    const imageAssets = productAssets.filter((asset: any) => asset.type === 'IMAGE');
    const videoAssets = productAssets.filter((asset: any) => asset.type === 'VIDEO');
    const documentAssets = productAssets.filter((asset: any) => asset.type === 'DOCUMENT');
    
    // Create content items based on actual assets
    const contentItems = [];
    
    // Images content
    if (imageAssets.length > 0 || hasImages) {
      contentItems.push({
        id: `${product.id}-images`,
        name: `${product.name || product.sku || 'Product'} - Images`,
        type: 'Images',
        status: imageAssets.length > 0 || hasImages ? 'Ready' : 'Draft',
        items: imageAssets.length || (hasImages ? product.images.length : 0),
      });
    }
    
    // Copy content
    if (documentAssets.length > 0 || hasDescription) {
      contentItems.push({
        id: `${product.id}-copy`,
        name: `${product.name || product.sku || 'Product'} - Copy`,
        type: 'Copy',
        status: hasDescription ? 'In Review' : 'Draft',
        items: documentAssets.length || (hasDescription ? 1 : 0),
      });
    }
    
    // Video content
    if (videoAssets.length > 0) {
      contentItems.push({
        id: `${product.id}-video`,
        name: `${product.name || product.sku || 'Product'} - Video`,
        type: 'Video',
        status: videoAssets.length > 0 ? 'Ready' : 'Draft',
        items: videoAssets.length,
      });
    }
    
    return contentItems;
  }).flat(); // Flatten the array of arrays

  // Filter by search query
  const filteredContent = useMemo(() => {
    if (!searchQuery) return content;
    const query = searchQuery.toLowerCase();
    return content.filter((item: any) => 
      item.name.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query)
    );
  }, [content, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredContent.length / ITEMS_PER_PAGE);
  const paginatedContent = useMemo(() => {
    return filteredContent.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [filteredContent, currentPage]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (isLoading) {
    return <SkeletonPage />;
  }

  return (
    <div>
      <Breadcrumb currentPage="Content Readiness" />
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-bold text-gray-900 dark:text-white">Content Readiness</h1>
          </div>
          {(!filteredContent || filteredContent.length === 0) ? null : (
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <Plus className="w-5 h-5" />
              Add Content
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search content..."
          className="max-w-md"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {paginatedContent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No content found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
              Get started by adding your first content to the inventory.
            </p>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <Plus className="w-5 h-5" />
              Add Content
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Content Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedContent.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white">{item.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white">{item.items}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.status === 'Ready' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : item.status === 'In Review'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredContent.length}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

