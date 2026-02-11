import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Image, FileText, BookOpen, Search, Grid, List, Upload, X, Edit, Trash2, Download, Eye} from 'lucide-react';
import api from '../lib/api';
import { SkeletonPage } from '../components/Skeleton';
import Breadcrumb from '../components/Breadcrumb';
import { CustomDropdown, SearchInput, DeleteModal } from '../components/ui';
import Pagination, { ITEMS_PER_PAGE } from '../components/ui/Pagination';


type TabType = 'images' | 'lookbooks' | 'brand-content';

export default function AssetsDAM() {
  const [activeTab, setActiveTab] = useState<TabType>('images');

  const tabs = [
    { id: 'images' as TabType, label: 'Images', icon: Image },
    { id: 'lookbooks' as TabType, label: 'Lookbooks / Line Sheets', icon: FileText },
    { id: 'brand-content' as TabType, label: 'Brand Content Library', icon: BookOpen },
  ];

  return (
    <div>
      <Breadcrumb currentPage="Assets (DAM)" />
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-bold text-gray-900 dark:text-white">Assets (DAM)</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1  text-[14px]">Digital Asset Management: Images, Lookbooks, and Brand Content</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'images' && <ImagesSection />}
        {activeTab === 'lookbooks' && <LookbooksSection />}
        {activeTab === 'brand-content' && <BrandContentSection />}
      </div>
    </div>
  );
}

// Images Section Component
function ImagesSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploadModalShowing, setIsUploadModalShowing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditModalShowing, setIsEditModalShowing] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isViewModalShowing, setIsViewModalShowing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [_isDeleteModalShowing, setIsDeleteModalShowing] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // View modal handlers
  const openViewModal = (asset: any) => {
    setSelectedAsset(asset);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalShowing(false);
    setTimeout(() => {
      setIsViewModalOpen(false);
      setSelectedAsset(null);
    }, 300);
  };

  // Helper function to validate URLs
  const isValidUrl = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;
    // Check if it's a valid URL format (starts with http://, https://, or /)
    try {
      // If it starts with http:// or https://, validate as URL
      if (url.startsWith('http://') || url.startsWith('https://')) {
        new URL(url);
        return true;
      }
      // If it starts with /, it's a relative path (valid)
      if (url.startsWith('/')) {
        return true;
      }
      // If it's a data URL (base64 image)
      if (url.startsWith('data:')) {
        return true;
      }
      // Otherwise, it's likely an invalid URL
      return false;
    } catch {
      return false;
    }
  };

  // Fetch images from DAM API (filter by IMAGE type)
  const { data: assetsResponse, isLoading } = useQuery({
    queryKey: ['dam', 'images', searchQuery],
    queryFn: async () => {
      try {
        // Fetch all data to filter by IMAGE type (since backend doesn't support type filtering)
        const response = await api.get(`/dam?skip=0&take=10000`);
        const allAssets = response.data?.data || response.data || [];
        // Filter only IMAGE type assets and validate URLs
        let images = allAssets.filter((asset: any) => {
          if (asset.type !== 'IMAGE') return false;
          // Only include assets with valid URLs or no URL (will show placeholder)
          const hasValidUrl = isValidUrl(asset.thumbnailUrl) || isValidUrl(asset.url);
          return hasValidUrl || (!asset.thumbnailUrl && !asset.url);
        });
        
        // Filter by search query if provided
        if (searchQuery) {
          images = images.filter((asset: any) =>
            asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }
        
        return {
          data: images,
          total: images.length,
        };
      } catch (error) {
        return { data: [], total: 0 };
      }
    },
  });

  const rawImages = assetsResponse?.data || [];
  const totalImages = assetsResponse?.total || 0;
  
  // Apply client-side pagination
  const images = rawImages.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
  const totalFiltered = totalImages;
  const totalPages = Math.ceil(totalFiltered / ITEMS_PER_PAGE);
  
  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (assetData: any) => {
      const response = await api.post('/dam', assetData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dam', 'images'] });
      toast.success('Image uploaded successfully!');
      closeUploadModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, assetData }: { id: number; assetData: any }) => {
      console.log('Update mutation called:', { id, assetData });
      const response = await api.patch(`/dam/${id}`, assetData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dam', 'images'] });
      toast.success('Image updated successfully!');
      closeEditModal();
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 
                          (Array.isArray(error.response?.data?.message) 
                            ? error.response.data.message.map((m: any) => typeof m === 'string' ? m : Object.values(m).join(', ')).join(', ') 
                            : 'Failed to update image');
      toast.error(errorMessage);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/dam/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dam', 'images'] });
      toast.success('Image deleted successfully!');
      closeDeleteModal();
    },
    onError: () => {
      toast.error('Failed to delete image');
    },
  });

  // Modal handlers
  const openUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setIsUploadModalShowing(false);
    setTimeout(() => {
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 300);
  };

  const openEditModal = (asset: any) => {
    setSelectedAsset(asset);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalShowing(false);
    setTimeout(() => {
      setIsEditModalOpen(false);
      setSelectedAsset(null);
    }, 300);
  };

  const openDeleteModal = (asset: any) => {
    setSelectedAsset(asset);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalShowing(false);
    setTimeout(() => {
      setIsDeleteModalOpen(false);
      setSelectedAsset(null);
    }, 300);
  };

  // Handle body scroll lock when modals are open
  useEffect(() => {
    if (isUploadModalOpen) {
      document.body.classList.add('modal-open');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsUploadModalShowing(true);
        });
      });
    } else {
      document.body.classList.remove('modal-open');
      setIsUploadModalShowing(false);
    }
  }, [isUploadModalOpen]);

  useEffect(() => {
    if (isEditModalOpen) {
      document.body.classList.add('modal-open');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsEditModalShowing(true);
        });
      });
    } else {
      document.body.classList.remove('modal-open');
      setIsEditModalShowing(false);
    }
  }, [isEditModalOpen]);

  useEffect(() => {
    if (isViewModalOpen) {
      document.body.classList.add('modal-open');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsViewModalShowing(true);
        });
      });
    } else {
      document.body.classList.remove('modal-open');
      setIsViewModalShowing(false);
    }
  }, [isViewModalOpen]);

  useEffect(() => {
    if (isDeleteModalOpen) {
      document.body.classList.add('modal-open');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsDeleteModalShowing(true);
        });
      });
    } else {
      document.body.classList.remove('modal-open');
      setIsDeleteModalShowing(false);
    }
  }, [isDeleteModalOpen]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setUploadFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle edit file selection
  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setEditFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle upload
  const handleUpload = async (formData: any) => {
    if (!uploadFile) {
      toast.error('Please select a file');
      return;
    }

    // For now, we'll use a placeholder URL. In production, you'd upload to a file storage service
    // and get the URL back
    const assetData = {
      name: formData.name || uploadFile.name,
      type: 'IMAGE' as const,
      url: uploadPreview || URL.createObjectURL(uploadFile), // Placeholder - should be actual upload URL
      thumbnailUrl: uploadPreview || URL.createObjectURL(uploadFile),
      description: formData.description || undefined,
      tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : undefined,
      fileSize: uploadFile.size,
      mimeType: uploadFile.type,
      productId: formData.productId || undefined,
    };

    uploadMutation.mutate(assetData);
  };

  // Handle update
  const handleUpdate = (formData: any) => {
    if (!selectedAsset) return;

    // Clean and validate the form data
    const name = formData.name?.trim();
    if (!name) {
      toast.error('Name is required');
      return;
    }

    const assetData: any = {
      name: name,
    };

    // Only include description if it's not empty
    if (formData.description && formData.description.trim()) {
      assetData.description = formData.description.trim();
    } else {
      assetData.description = undefined;
    }

    // Process tags - split by comma, trim, and filter out empty strings
    if (formData.tags && formData.tags.trim()) {
      const tagsArray = formData.tags
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);
      assetData.tags = tagsArray.length > 0 ? tagsArray : undefined;
    } else {
      assetData.tags = undefined;
    }

    // If a new file is selected, update the URL and thumbnail
    if (editFile) {
      // For now, we'll use a placeholder URL. In production, you'd upload to a file storage service
      // and get the URL back
      assetData.url = editPreview || URL.createObjectURL(editFile);
      assetData.thumbnailUrl = editPreview || URL.createObjectURL(editFile);
      assetData.fileSize = editFile.size;
      assetData.mimeType = editFile.type;
    }

    console.log('Updating image:', selectedAsset.id, assetData);
    updateMutation.mutate({ id: selectedAsset.id, assetData });
  };

  const handleDelete = () => {
    if (selectedAsset) {
      deleteMutation.mutate(selectedAsset.id);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return <SkeletonPage />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 relative w-full sm:max-w-md">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search images..."
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={openUploadModal}
              className="flex text-[14px] items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </button>
          </div>
        </div>
      </div>

      {/* Images Display */}
      {images.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Image className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No images found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
              {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by uploading your first image.'}
            </p>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
          {images.map((image: any) => (
            <div
              key={image.id}
              className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square relative bg-gray-100 dark:bg-gray-700">
                {(isValidUrl(image.thumbnailUrl) || isValidUrl(image.url)) ? (
                  <img
                    src={image.thumbnailUrl || image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                      if (placeholder) placeholder.classList.remove('hidden');
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
                <div className="hidden absolute inset-0 flex items-center justify-center">
                  <Image className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(image)}
                      className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-gray-900" />
                    </button>
                    <button
                      onClick={() => openViewModal(image)}
                      className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-gray-900" />
                    </button>
                    <button
                      onClick={() => {
                        const downloadUrl = image.url || image.thumbnailUrl;
                        if (downloadUrl && isValidUrl(downloadUrl)) {
                          const link = document.createElement('a');
                          link.href = downloadUrl;
                          link.download = image.name;
                          link.click();
                        } else {
                          toast.error('No valid download URL available');
                        }
                      }}
                      className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4 text-gray-900" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(image)}
                      className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={image.name}>
                  {image.name}
                </p>
                {image.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1" title={image.description}>
                    {image.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatFileSize(image.fileSize)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {images.map((image: any) => (
              <div
                key={image.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {(isValidUrl(image.thumbnailUrl) || isValidUrl(image.url)) ? (
                      <img
                        src={image.thumbnailUrl || image.url}
                        alt={image.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                          if (placeholder) placeholder.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`${(isValidUrl(image.thumbnailUrl) || isValidUrl(image.url)) ? 'hidden' : ''} w-full h-full flex items-center justify-center`}>
                      <Image className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{image.name}</h4>
                    {image.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{image.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatFileSize(image.fileSize)}</span>
                      <span>•</span>
                      <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                      {image.tags && image.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex flex-wrap gap-1">
                            {image.tags.slice(0, 3).map((tag: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                            {image.tags.length > 3 && (
                              <span className="text-xs">+{image.tags.length - 3}</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(image)}
                      className="p-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openViewModal(image)}
                      className="p-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const downloadUrl = image.url || image.thumbnailUrl;
                        if (downloadUrl && isValidUrl(downloadUrl)) {
                          const link = document.createElement('a');
                          link.href = downloadUrl;
                          link.download = image.name;
                          link.click();
                        } else {
                          toast.error('No valid download URL available');
                        }
                      }}
                      className="p-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(image)}
                      className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-6 py-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalFiltered}
            onPageChange={setCurrentPage}
            className="border-0 pt-0 mt-0"
          />
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <>
          <div className={`modal-backdrop fade ${isUploadModalShowing ? 'show' : ''}`} onClick={closeUploadModal} />
          <div className={`modal fade ${isUploadModalShowing ? 'show' : ''}`} onClick={closeUploadModal} role="dialog" aria-modal="true" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <div className="modal-content">
                <div className="modal-header border-b border-gray-200 dark:border-gray-700">
                  <h5 className="modal-title text-lg font-semibold text-gray-900 dark:text-white">Upload Image</h5>
                  <button
                    type="button"
                    onClick={closeUploadModal}
                    className="btn-close"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleUpload({
                      name: formData.get('name') as string,
                      description: formData.get('description') as string,
                      tags: formData.get('tags') as string,
                    });
                  }}
                >
                  <div className="modal-body p-6">
                    {/* File Upload */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Image File <span className="text-red-500">*</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                        {uploadPreview ? (
                          <div className="space-y-4">
                            <img src={uploadPreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                            <button
                              type="button"
                              onClick={() => {
                                setUploadFile(null);
                                setUploadPreview(null);
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = '';
                                }
                              }}
                              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              PNG, JPG, GIF up to 10MB
                            </p>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="hidden"
                              id="file-upload"
                            />
                            <label
                              htmlFor="file-upload"
                              className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer transition-colors"
                            >
                              Select File
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Name */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={uploadFile?.name || ''}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-[14px]"
                        placeholder="Enter image name"
                      />
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-[14px]"
                        placeholder="Enter description (optional)"
                      />
                    </div>

                    {/* Tags */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tags
                      </label>
                      <input
                        type="text"
                        name="tags"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-[14px]"
                        placeholder="Enter tags separated by commas (e.g., product, marketing, campaign)"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Separate multiple tags with commas
                      </p>
                    </div>
                  </div>
                  <div className="modal-footer border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeUploadModal}
                      className="px-4 text-[14px] py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!uploadFile || uploadMutation.isPending}
                      className="px-4 text-[14px] py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {uploadMutation.isPending ? 'Uploading...' : 'Upload Image'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedAsset && (
        <>
          <div className={`modal-backdrop fade ${isEditModalShowing ? 'show' : ''}`} onClick={closeEditModal} />
          <div className={`modal fade ${isEditModalShowing ? 'show' : ''}`} onClick={closeEditModal} role="dialog" aria-modal="true" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <div className="modal-content">
                <div className="modal-header border-b border-gray-200 dark:border-gray-700">
                  <h5 className="modal-title text-lg font-semibold text-gray-900 dark:text-white">Edit Image</h5>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="btn-close"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleUpdate({
                      name: formData.get('name') as string,
                      description: formData.get('description') as string,
                      tags: formData.get('tags') as string,
                    });
                  }}
                >
                  <div className="modal-body p-6">
                    {/* Preview */}
                    <div className="mb-4">
                      {editPreview ? (
                        <div>
                          <img
                            src={editPreview}
                            alt="New preview"
                            className="max-h-48 mx-auto rounded-lg"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                            New image preview
                          </p>
                        </div>
                      ) : (isValidUrl(selectedAsset.thumbnailUrl) || isValidUrl(selectedAsset.url)) ? (
                        <div>
                          <img
                            src={selectedAsset.thumbnailUrl || selectedAsset.url}
                            alt={selectedAsset.name}
                            className="max-h-48 mx-auto rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                              if (placeholder) placeholder.classList.remove('hidden');
                            }}
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                            Current image
                          </p>
                        </div>
                      ) : null}
                    </div>

                    {/* Replace Image */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Replace Image
                      </label>
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleEditFileSelect}
                        className="hidden"
                        id="edit-image-input"
                      />
                      <label
                        htmlFor="edit-image-input"
                        className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
                      >
                        <div className="flex flex-col items-center">
                          <Upload className="w-5 h-5 text-gray-400 dark:text-gray-500 mb-1" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {editFile ? editFile.name : 'Click to select a new image'}
                          </span>
                          {editFile && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditFile(null);
                                setEditPreview(null);
                                if (editFileInputRef.current) {
                                  editFileInputRef.current.value = '';
                                }
                              }}
                              className="mt-1 text-xs text-red-600 dark:text-red-400 hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Select a new image file to replace the current one (optional)
                      </p>
                    </div>

                    {/* Name */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={selectedAsset.name}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-[14px]"
                        placeholder="Enter image name"
                      />
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        rows={3}
                        defaultValue={selectedAsset.description || ''}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-[14px]"
                        placeholder="Enter description (optional)"
                      />
                    </div>

                    {/* Tags */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tags
                      </label>
                      <input
                        type="text"
                        name="tags"
                        defaultValue={selectedAsset.tags?.join(', ') || ''}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-[14px]"
                        placeholder="Enter tags separated by commas"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Separate multiple tags with commas
                      </p>
                    </div>
                  </div>
                  <div className="modal-footer border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="px-4 text-[14px] py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="px-4 text-[14px] py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {updateMutation.isPending ? 'Updating...' : 'Update Image'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedAsset && (
        <>
          <div className={`modal-backdrop fade ${isViewModalShowing ? 'show' : ''}`} onClick={closeViewModal} />
          <div className={`modal fade ${isViewModalShowing ? 'show' : ''}`} onClick={closeViewModal} role="dialog" aria-modal="true" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '50vw', maxHeight: '90vh' }}>
              <div className="modal-content">
                <div className="modal-header border-b border-gray-200 dark:border-gray-700">
                  <h5 className="modal-title text-lg font-semibold text-gray-900 dark:text-white">{selectedAsset.name}</h5>
                  <button
                    type="button"
                    onClick={closeViewModal}
                    className="btn-close"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="modal-body p-0 overflow-hidden" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                  <div className="flex flex-col lg:flex-row h-full">
                    {/* Image Preview Section */}
                    <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 min-h-[250px] lg:min-h-0">
                      {(isValidUrl(selectedAsset.thumbnailUrl) || isValidUrl(selectedAsset.url)) ? (
                        <img
                          src={selectedAsset.thumbnailUrl || selectedAsset.url}
                          alt={selectedAsset.name}
                          className="max-w-full max-h-[30vh] w-auto h-auto rounded-lg object-contain shadow-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                            if (placeholder) placeholder.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`${(isValidUrl(selectedAsset.thumbnailUrl) || isValidUrl(selectedAsset.url)) ? 'hidden' : ''} flex flex-col items-center justify-center h-48 bg-gray-100 dark:bg-gray-700 rounded-lg w-full`}>
                        <Image className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No image available</p>
                      </div>
                    </div>

                    {/* Asset Details Section */}
                    <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Name
                          </label>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedAsset.name}</p>
                        </div>

                        {selectedAsset.description && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                              Description
                            </label>
                            <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{selectedAsset.description}</p>
                          </div>
                        )}

                        {selectedAsset.tags && selectedAsset.tags.length > 0 && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                              Tags
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {selectedAsset.tags.map((tag: string, index: number) => (
                                <span
                                  key={index}
                                  className="px-2.5 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          {selectedAsset.fileSize && (
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                File Size
                              </label>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {selectedAsset.fileSize < 1024
                                  ? `${selectedAsset.fileSize} B`
                                  : selectedAsset.fileSize < 1024 * 1024
                                  ? `${(selectedAsset.fileSize / 1024).toFixed(1)} KB`
                                  : `${(selectedAsset.fileSize / (1024 * 1024)).toFixed(1)} MB`}
                              </p>
                            </div>
                          )}

                          {selectedAsset.mimeType && (
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                Type
                              </label>
                              <p className="text-sm text-gray-900 dark:text-white">{selectedAsset.mimeType}</p>
                            </div>
                          )}
                        </div>

                        {selectedAsset.createdAt && (
                          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                              Created At
                            </label>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {new Date(selectedAsset.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const downloadUrl = selectedAsset.url || selectedAsset.thumbnailUrl;
                      if (downloadUrl && isValidUrl(downloadUrl)) {
                        const link = document.createElement('a');
                        link.href = downloadUrl;
                        link.download = selectedAsset.name;
                        link.click();
                      } else {
                        toast.error('No valid download URL available');
                      }
                    }}
                    className="px-4 text-[14px] py-2 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={closeViewModal}
                    className="px-4 text-[14px] py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedAsset && (
        <DeleteModal
          title="Delete Image"
          message="Are you sure you want to delete"
          itemName={selectedAsset.name}
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}

// Lookbooks / Line Sheets Section Component
function LookbooksSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploadModalShowing, setIsUploadModalShowing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditModalShowing, setIsEditModalShowing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [_isDeleteModalShowing, setIsDeleteModalShowing] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch lookbooks/line sheets from DAM API (filter by DOCUMENT type and lookbook tags/description)
  const { data: assetsResponse, isLoading } = useQuery({
    queryKey: ['dam', 'lookbooks', searchQuery],
    queryFn: async () => {
      try {
        // Fetch all data to filter by type and keywords
        const response = await api.get(`/dam?skip=0&take=10000`);
        const allAssets = response.data?.data || response.data || [];
        // Filter DOCUMENT type assets that are lookbooks or line sheets
        let documents = allAssets.filter((asset: any) => {
          if (asset.type !== 'DOCUMENT') return false;
          const nameLower = asset.name.toLowerCase();
          const descLower = asset.description?.toLowerCase() || '';
          const tagsLower = asset.tags?.join(' ').toLowerCase() || '';
          const searchText = nameLower + ' ' + descLower + ' ' + tagsLower;
          return searchText.includes('lookbook') || searchText.includes('line sheet') || searchText.includes('linesheet');
        });
        // Filter by search query if provided
        if (searchQuery) {
          documents = documents.filter((asset: any) =>
            asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }
        return {
          data: documents,
          total: documents.length,
        };
      } catch (error) {
        return { data: [], total: 0 };
      }
    },
  });

  const rawLookbooks = assetsResponse?.data || [];
  const totalLookbooks = assetsResponse?.total || 0;
  
  // Apply client-side pagination
  const lookbooks = rawLookbooks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
  const totalFiltered = totalLookbooks;
  const totalPages = Math.ceil(totalFiltered / ITEMS_PER_PAGE);
  
  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (assetData: any) => {
      const response = await api.post('/dam', assetData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dam', 'lookbooks'] });
      toast.success('Lookbook uploaded successfully!');
      closeUploadModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload lookbook');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, assetData }: { id: number; assetData: any }) => {
      console.log('Update mutation called (lookbook):', { id, assetData });
      const response = await api.patch(`/dam/${id}`, assetData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dam', 'lookbooks'] });
      toast.success('Lookbook updated successfully!');
      closeEditModal();
    },
    onError: (error: any) => {
      console.error('Update error (lookbook):', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 
                          (Array.isArray(error.response?.data?.message) 
                            ? error.response.data.message.map((m: any) => typeof m === 'string' ? m : Object.values(m).join(', ')).join(', ') 
                            : 'Failed to update lookbook');
      toast.error(errorMessage);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/dam/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dam', 'lookbooks'] });
      toast.success('Lookbook deleted successfully!');
      closeDeleteModal();
    },
    onError: () => {
      toast.error('Failed to delete lookbook');
    },
  });

  // Modal handlers
  const openUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setIsUploadModalShowing(false);
    setTimeout(() => {
      setIsUploadModalOpen(false);
      setUploadFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 300);
  };

  const openEditModal = (asset: any) => {
    setSelectedAsset(asset);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalShowing(false);
    setTimeout(() => {
      setIsEditModalOpen(false);
      setSelectedAsset(null);
    }, 300);
  };

  const openDeleteModal = (asset: any) => {
    setSelectedAsset(asset);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalShowing(false);
    setTimeout(() => {
      setIsDeleteModalOpen(false);
      setSelectedAsset(null);
    }, 300);
  };

  // Handle body scroll lock when modals are open
  useEffect(() => {
    if (isUploadModalOpen) {
      document.body.classList.add('modal-open');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsUploadModalShowing(true);
        });
      });
    } else {
      document.body.classList.remove('modal-open');
      setIsUploadModalShowing(false);
    }
  }, [isUploadModalOpen]);

  useEffect(() => {
    if (isEditModalOpen) {
      document.body.classList.add('modal-open');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsEditModalShowing(true);
        });
      });
    } else {
      document.body.classList.remove('modal-open');
      setIsEditModalShowing(false);
    }
  }, [isEditModalOpen]);

  useEffect(() => {
    if (isDeleteModalOpen) {
      document.body.classList.add('modal-open');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsDeleteModalShowing(true);
        });
      });
    } else {
      document.body.classList.remove('modal-open');
      setIsDeleteModalShowing(false);
    }
  }, [isDeleteModalOpen]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (PDF, DOC, DOCX)
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a PDF or Word document');
        return;
      }
      // Validate file size (max 50MB for documents)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      setUploadFile(file);
    }
  };

  // Handle upload
  const handleUpload = async (formData: any) => {
    if (!uploadFile) {
      toast.error('Please select a file');
      return;
    }

    const assetData = {
      name: formData.name || uploadFile.name,
      type: 'DOCUMENT' as const,
      url: URL.createObjectURL(uploadFile), // Placeholder - should be actual upload URL
      description: formData.description || undefined,
      tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean).concat(['lookbook']) : ['lookbook'],
      fileSize: uploadFile.size,
      mimeType: uploadFile.type,
      productId: formData.productId || undefined,
    };

    uploadMutation.mutate(assetData);
  };

  // Handle update
  const handleUpdate = (formData: any) => {
    if (!selectedAsset) return;

    // Clean and validate the form data
    const name = formData.name?.trim();
    if (!name) {
      toast.error('Name is required');
      return;
    }

    const assetData: any = {
      name: name,
    };

    // Only include description if it's not empty
    if (formData.description && formData.description.trim()) {
      assetData.description = formData.description.trim();
    } else {
      assetData.description = undefined;
    }

    // Process tags - split by comma, trim, and filter out empty strings
    if (formData.tags && formData.tags.trim()) {
      const tagsArray = formData.tags
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);
      assetData.tags = tagsArray.length > 0 ? tagsArray : undefined;
    } else {
      assetData.tags = undefined;
    }

    console.log('Updating lookbook:', selectedAsset.id, assetData);
    updateMutation.mutate({ id: selectedAsset.id, assetData });
  };

  const handleDelete = () => {
    if (selectedAsset) {
      deleteMutation.mutate(selectedAsset.id);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return <SkeletonPage />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search lookbooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full ::placeholder-[12px] text-[14px] pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={openUploadModal}
            className="flex text-[14px] items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Lookbook
          </button>
        </div>
      </div>

      {/* Lookbooks List */}
      {lookbooks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No lookbooks found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
              {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by uploading your first lookbook or line sheet.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {lookbooks.map((lookbook: any) => (
                  <tr key={lookbook.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{lookbook.name}</div>
                      {lookbook.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{lookbook.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded">
                        {lookbook.mimeType?.split('/')[1]?.toUpperCase() || 'PDF'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {formatFileSize(lookbook.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(lookbook.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (lookbook.url) window.open(lookbook.url, '_blank');
                          }}
                          className="p-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (lookbook.url) {
                              const link = document.createElement('a');
                              link.href = lookbook.url;
                              link.download = lookbook.name;
                              link.click();
                            }
                          }}
                          className="p-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(lookbook)}
                          className="p-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(lookbook)}
                          className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-6 py-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalFiltered}
            onPageChange={setCurrentPage}
            className="border-0 pt-0 mt-0"
          />
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <>
          <div className={`modal-backdrop fade ${isUploadModalShowing ? 'show' : ''}`} onClick={closeUploadModal} />
          <div className={`modal fade ${isUploadModalShowing ? 'show' : ''}`} onClick={closeUploadModal} role="dialog" aria-modal="true" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <div className="modal-content">
                <div className="modal-header border-b border-gray-200 dark:border-gray-700">
                  <h5 className="modal-title text-lg font-semibold text-gray-900 dark:text-white">Upload Lookbook</h5>
                  <button type="button" onClick={closeUploadModal} className="btn-close" aria-label="Close">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleUpload({
                    name: formData.get('name') as string,
                    description: formData.get('description') as string,
                    tags: formData.get('tags') as string,
                  });
                }}>
                  <div className="modal-body p-6">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Document File <span className="text-red-500">*</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                        {uploadFile ? (
                          <div className="space-y-4">
                            <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">{uploadFile.name}</p>
                            <button type="button" onClick={() => { setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">Remove</button>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">PDF, DOC, DOCX up to 50MB</p>
                            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileSelect} className="hidden" id="lookbook-file-upload" />
                            <label htmlFor="lookbook-file-upload" className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer transition-colors">Select File</label>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name <span className="text-red-500">*</span></label>
                      <input type="text" name="name" defaultValue={uploadFile?.name || ''} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-[14px]" placeholder="Enter lookbook name" />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                      <textarea name="description" rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-[14px]" placeholder="Enter description (optional)" />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
                      <input type="text" name="tags" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-[14px]" placeholder="Enter tags separated by commas" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Separate multiple tags with commas</p>
                    </div>
                  </div>
                  <div className="modal-footer border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-end gap-3">
                    <button type="button" onClick={closeUploadModal} className="px-4 text-[14px] py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                    <button type="submit" disabled={!uploadFile || uploadMutation.isPending} className="px-4 text-[14px] py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">{uploadMutation.isPending ? 'Uploading...' : 'Upload Lookbook'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedAsset && (
        <>
          <div className={`modal-backdrop fade ${isEditModalShowing ? 'show' : ''}`} onClick={closeEditModal} />
          <div className={`modal fade ${isEditModalShowing ? 'show' : ''}`} onClick={closeEditModal} role="dialog" aria-modal="true" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <div className="modal-content">
                <div className="modal-header border-b border-gray-200 dark:border-gray-700">
                  <h5 className="modal-title text-lg font-semibold text-gray-900 dark:text-white">Edit Lookbook</h5>
                  <button type="button" onClick={closeEditModal} className="btn-close" aria-label="Close"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleUpdate({
                    name: formData.get('name') as string,
                    description: formData.get('description') as string,
                    tags: formData.get('tags') as string,
                  });
                }}>
                  <div className="modal-body p-6">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name <span className="text-red-500">*</span></label>
                      <input type="text" name="name" defaultValue={selectedAsset.name} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-[14px]" placeholder="Enter lookbook name" />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                      <textarea name="description" rows={3} defaultValue={selectedAsset.description || ''} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-[14px]" placeholder="Enter description (optional)" />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
                      <input type="text" name="tags" defaultValue={selectedAsset.tags?.join(', ') || ''} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-[14px]" placeholder="Enter tags separated by commas" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Separate multiple tags with commas</p>
                    </div>
                  </div>
                  <div className="modal-footer border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-end gap-3">
                    <button type="button" onClick={closeEditModal} className="px-4 text-[14px] py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                    <button type="submit" disabled={updateMutation.isPending} className="px-4 text-[14px] py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">{updateMutation.isPending ? 'Updating...' : 'Update Lookbook'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedAsset && (
        <DeleteModal
          title="Delete Lookbook"
          message="Are you sure you want to delete"
          itemName={selectedAsset.name}
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}

// Brand Content Library Section Component
function BrandContentSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploadModalShowing, setIsUploadModalShowing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditModalShowing, setIsEditModalShowing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [_isDeleteModalShowing, setIsDeleteModalShowing] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch brand content from DAM API (filter by brand-related tags/descriptions)
  const { data: assetsResponse, isLoading } = useQuery({
    queryKey: ['dam', 'brand-content', searchQuery, filterType],
    queryFn: async () => {
      try {
        // Fetch all data to filter by brand-related criteria
        const response = await api.get(`/dam?skip=0&take=10000`);
        const allAssets = response.data?.data || response.data || [];
        // Filter assets that are brand-related (have brand tags or are not product-specific)
        let brandAssets = allAssets.filter((asset: any) => {
          // Include assets without productId (general brand assets) or with brand-related tags
          const tagsLower = asset.tags?.join(' ').toLowerCase() || '';
          const descLower = asset.description?.toLowerCase() || '';
          const nameLower = asset.name.toLowerCase();
          const searchText = tagsLower + ' ' + descLower + ' ' + nameLower;
          return !asset.productId ||
            searchText.includes('brand') ||
            searchText.includes('logo') ||
            searchText.includes('marketing') ||
            searchText.includes('campaign');
        });

        // Filter by type if specified
        if (filterType !== 'all') {
          brandAssets = brandAssets.filter((asset: any) => asset.type === filterType);
        }

        // Filter by search query if provided
        if (searchQuery) {
          brandAssets = brandAssets.filter((asset: any) =>
            asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }

        return {
          data: brandAssets,
          total: brandAssets.length,
        };
      } catch (error) {
        return { data: [], total: 0 };
      }
    },
  });

  const rawBrandAssets = assetsResponse?.data || [];
  const totalBrandAssets = assetsResponse?.total || 0;
  
  // Apply client-side pagination
  const brandAssets = rawBrandAssets.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
  const totalFiltered = totalBrandAssets;
  const totalPages = Math.ceil(totalFiltered / ITEMS_PER_PAGE);
  
  // Reset to page 1 when search query or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType]);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (assetData: any) => {
      const response = await api.post('/dam', assetData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dam', 'brand-content'] });
      toast.success('Asset uploaded successfully!');
      closeUploadModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload asset');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, assetData }: { id: number; assetData: any }) => {
      console.log('Update mutation called (brand asset):', { id, assetData });
      const response = await api.patch(`/dam/${id}`, assetData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dam', 'brand-content'] });
      toast.success('Asset updated successfully!');
      closeEditModal();
    },
    onError: (error: any) => {
      console.error('Update error (brand asset):', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 
                          (Array.isArray(error.response?.data?.message) 
                            ? error.response.data.message.map((m: any) => typeof m === 'string' ? m : Object.values(m).join(', ')).join(', ') 
                            : 'Failed to update asset');
      toast.error(errorMessage);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/dam/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dam', 'brand-content'] });
      toast.success('Asset deleted successfully!');
      closeDeleteModal();
    },
    onError: () => {
      toast.error('Failed to delete asset');
    },
  });

  // Modal handlers
  const openUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setIsUploadModalShowing(false);
    setTimeout(() => {
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 300);
  };

  const openEditModal = (asset: any) => {
    setSelectedAsset(asset);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalShowing(false);
    setTimeout(() => {
      setIsEditModalOpen(false);
      setSelectedAsset(null);
    }, 300);
  };

  const openDeleteModal = (asset: any) => {
    setSelectedAsset(asset);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalShowing(false);
    setTimeout(() => {
      setIsDeleteModalOpen(false);
      setSelectedAsset(null);
    }, 300);
  };

  // Handle body scroll lock when modals are open
  useEffect(() => {
    if (isUploadModalOpen) {
      document.body.classList.add('modal-open');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsUploadModalShowing(true);
        });
      });
    } else {
      document.body.classList.remove('modal-open');
      setIsUploadModalShowing(false);
    }
  }, [isUploadModalOpen]);

  useEffect(() => {
    if (isEditModalOpen) {
      document.body.classList.add('modal-open');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsEditModalShowing(true);
        });
      });
    } else {
      document.body.classList.remove('modal-open');
      setIsEditModalShowing(false);
    }
  }, [isEditModalOpen]);

  useEffect(() => {
    if (isDeleteModalOpen) {
      document.body.classList.add('modal-open');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsDeleteModalShowing(true);
        });
      });
    } else {
      document.body.classList.remove('modal-open');
      setIsDeleteModalShowing(false);
    }
  }, [isDeleteModalOpen]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      setUploadFile(file);
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadPreview(null);
      }
    }
  };

  // Determine asset type from file
  const getAssetTypeFromFile = (file: File): 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER' => {
    if (file.type.startsWith('image/')) return 'IMAGE';
    if (file.type.startsWith('video/')) return 'VIDEO';
    if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('word')) return 'DOCUMENT';
    return 'OTHER';
  };

  // Handle upload
  const handleUpload = async (formData: any) => {
    if (!uploadFile) {
      toast.error('Please select a file');
      return;
    }

    const assetType = getAssetTypeFromFile(uploadFile);
    const assetData = {
      name: formData.name || uploadFile.name,
      type: assetType,
      url: uploadPreview || URL.createObjectURL(uploadFile), // Placeholder - should be actual upload URL
      thumbnailUrl: uploadPreview || (assetType === 'IMAGE' ? URL.createObjectURL(uploadFile) : undefined),
      description: formData.description || undefined,
      tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean).concat(['brand']) : ['brand'],
      fileSize: uploadFile.size,
      mimeType: uploadFile.type,
      productId: formData.productId || undefined,
    };

    uploadMutation.mutate(assetData);
  };

  // Handle update
  const handleUpdate = (formData: any) => {
    if (!selectedAsset) return;

    // Clean and validate the form data
    const name = formData.name?.trim();
    if (!name) {
      toast.error('Name is required');
      return;
    }

    const assetData: any = {
      name: name,
    };

    // Only include description if it's not empty
    if (formData.description && formData.description.trim()) {
      assetData.description = formData.description.trim();
    } else {
      assetData.description = undefined;
    }

    // Process tags - split by comma, trim, and filter out empty strings
    if (formData.tags && formData.tags.trim()) {
      const tagsArray = formData.tags
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);
      assetData.tags = tagsArray.length > 0 ? tagsArray : undefined;
    } else {
      assetData.tags = undefined;
    }

    console.log('Updating brand asset:', selectedAsset.id, assetData);
    updateMutation.mutate({ id: selectedAsset.id, assetData });
  };

  const handleDelete = () => {
    if (selectedAsset) {
      deleteMutation.mutate(selectedAsset.id);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return Image;
      case 'VIDEO':
        return FileText; // Could use a Video icon if available
      case 'DOCUMENT':
        return FileText;
      default:
        return FileText;
    }
  };

  if (isLoading) {
    return <SkeletonPage />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Search, Filter, and Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search brand content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 ::placeholder-[12px] text-[14px] py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <CustomDropdown
                  value={filterType}
                  onChange={(value) => setFilterType(value as any)}
                  options={[
                    { value: 'all', label: 'All Types' },
                    { value: 'IMAGE', label: 'Images' },
                    { value: 'VIDEO', label: 'Videos' },
                    { value: 'DOCUMENT', label: 'Documents' },
                    { value: 'OTHER', label: 'Other' },
                  ]}
                  placeholder="All Types"
                  className="min-w-[160px]"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={openUploadModal}
                className="flex text-[14px] items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Asset
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Brand Assets Display */}
      {brandAssets.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No brand content found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
              {searchQuery || filterType !== 'all' ? 'Try adjusting your search or filter criteria.' : 'Get started by uploading your first brand asset.'}
            </p>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
          {brandAssets.map((asset: any) => {
            const AssetIcon = getAssetIcon(asset.type);
            return (
              <div
                key={asset.id}
                className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-square relative bg-gray-100 dark:bg-gray-700">
                  {asset.type === 'IMAGE' && (asset.thumbnailUrl || asset.url) ? (
                    <img
                      src={asset.thumbnailUrl || asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`${asset.type === 'IMAGE' && (asset.thumbnailUrl || asset.url) ? 'hidden' : ''} absolute inset-0 flex items-center justify-center`}>
                    <AssetIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(asset)}
                        className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-gray-900" />
                      </button>
                      <button
                        onClick={() => {
                          if (asset.url) window.open(asset.url, '_blank');
                        }}
                        className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-gray-900" />
                      </button>
                      <button
                        onClick={() => {
                          if (asset.url) {
                            const link = document.createElement('a');
                            link.href = asset.url;
                            link.download = asset.name;
                            link.click();
                          }
                        }}
                        className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-gray-900" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(asset)}
                        className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={asset.name}>
                    {asset.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                      {asset.type}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(asset.fileSize)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Tags</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {brandAssets.map((asset: any) => (
                  <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{asset.name}</div>
                      {asset.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{asset.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400 rounded">
                        {asset.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {formatFileSize(asset.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {asset.tags && asset.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {asset.tags.slice(0, 3).map((tag: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                          {asset.tags.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">+{asset.tags.length - 3}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (asset.url) window.open(asset.url, '_blank');
                          }}
                          className="p-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (asset.url) {
                              const link = document.createElement('a');
                              link.href = asset.url;
                              link.download = asset.name;
                              link.click();
                            }
                          }}
                          className="p-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(asset)}
                          className="p-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(asset)}
                          className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-6 py-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalFiltered}
            onPageChange={setCurrentPage}
            className="border-0 pt-0 mt-0"
          />
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <>
          <div className={`modal-backdrop fade ${isUploadModalShowing ? 'show' : ''}`} onClick={closeUploadModal} />
          <div className={`modal fade ${isUploadModalShowing ? 'show' : ''}`} onClick={closeUploadModal} role="dialog" aria-modal="true" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <div className="modal-content">
                <div className="modal-header border-b border-gray-200 dark:border-gray-700">
                  <h5 className="modal-title text-lg font-semibold text-gray-900 dark:text-white">Upload Brand Asset</h5>
                  <button type="button" onClick={closeUploadModal} className="btn-close" aria-label="Close"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleUpload({
                    name: formData.get('name') as string,
                    description: formData.get('description') as string,
                    tags: formData.get('tags') as string,
                  });
                }}>
                  <div className="modal-body p-6">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Asset File <span className="text-red-500">*</span></label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                        {uploadPreview ? (
                          <div className="space-y-4">
                            <img src={uploadPreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                            <button type="button" onClick={() => { setUploadFile(null); setUploadPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">Remove</button>
                          </div>
                        ) : uploadFile ? (
                          <div className="space-y-4">
                            <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">{uploadFile.name}</p>
                            <button type="button" onClick={() => { setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">Remove</button>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">Images, Videos, Documents up to 50MB</p>
                            <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" id="brand-asset-file-upload" />
                            <label htmlFor="brand-asset-file-upload" className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer transition-colors">Select File</label>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name <span className="text-red-500">*</span></label>
                      <input type="text" name="name" defaultValue={uploadFile?.name || ''} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-[14px]" placeholder="Enter asset name" />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                      <textarea name="description" rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-[14px]" placeholder="Enter description (optional)" />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
                      <input type="text" name="tags" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-[14px]" placeholder="Enter tags separated by commas" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Separate multiple tags with commas</p>
                    </div>
                  </div>
                  <div className="modal-footer border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-end gap-3">
                    <button type="button" onClick={closeUploadModal} className="px-4 text-[14px] py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                    <button type="submit" disabled={!uploadFile || uploadMutation.isPending} className="px-4 text-[14px] py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">{uploadMutation.isPending ? 'Uploading...' : 'Upload Asset'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedAsset && (
        <>
          <div className={`modal-backdrop fade ${isEditModalShowing ? 'show' : ''}`} onClick={closeEditModal} />
          <div className={`modal fade ${isEditModalShowing ? 'show' : ''}`} onClick={closeEditModal} role="dialog" aria-modal="true" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <div className="modal-content">
                <div className="modal-header border-b border-gray-200 dark:border-gray-700">
                  <h5 className="modal-title text-lg font-semibold text-gray-900 dark:text-white">Edit Brand Asset</h5>
                  <button type="button" onClick={closeEditModal} className="btn-close" aria-label="Close"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleUpdate({
                    name: formData.get('name') as string,
                    description: formData.get('description') as string,
                    tags: formData.get('tags') as string,
                  });
                }}>
                  <div className="modal-body p-6">
                    {selectedAsset.type === 'IMAGE' && (selectedAsset.thumbnailUrl || selectedAsset.url) ? (
                      <div className="mb-4">
                        <img src={selectedAsset.thumbnailUrl || selectedAsset.url} alt={selectedAsset.name} className="max-h-48 mx-auto rounded-lg" />
                      </div>
                    ) : null}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name <span className="text-red-500">*</span></label>
                      <input type="text" name="name" defaultValue={selectedAsset.name} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-[14px]" placeholder="Enter asset name" />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                      <textarea name="description" rows={3} defaultValue={selectedAsset.description || ''} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-[14px]" placeholder="Enter description (optional)" />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
                      <input type="text" name="tags" defaultValue={selectedAsset.tags?.join(', ') || ''} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white text-[14px]" placeholder="Enter tags separated by commas" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Separate multiple tags with commas</p>
                    </div>
                  </div>
                  <div className="modal-footer border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-end gap-3">
                    <button type="button" onClick={closeEditModal} className="px-4 text-[14px] py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                    <button type="submit" disabled={updateMutation.isPending} className="px-4 text-[14px] py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">{updateMutation.isPending ? 'Updating...' : 'Update Asset'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedAsset && (
        <DeleteModal
          title="Delete Asset"
          message="Are you sure you want to delete"
          itemName={selectedAsset.name}
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}

