import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../lib/api';
import { Users, Plus, X, ChevronsLeft, ChevronsRight, Pencil, Trash2, AlertTriangle, ChevronDown, Eye, MoreVertical, Home } from 'lucide-react';
import { validators } from '../utils/validation';
import { SkeletonPage } from '../components/Skeleton';
import { useCheckCustomerEmail, useDebounce } from '../utils/emailDuplicateCheck';
import PhoneInput from '../components/PhoneInput';

enum CustomerType {
  RETAILER = 'RETAILER',
  B2B = 'B2B',
  WHOLESALE = 'WHOLESALE',
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
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white flex items-center justify-between ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${isOpen ? 'ring-2 ring-primary-500' : ''}`}
        style={{
          padding: '0.532rem 0.8rem 0.532rem 1.2rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          lineHeight: 1.6,
          backgroundColor: '#fff',
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
          className="absolute w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-auto custom-dropdown-menu"
          style={{
            zIndex: 10000,
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            minWidth: '100%',
          }}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlightedIndex;
            
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                  isSelected || isHighlighted
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                } ${index === 0 ? 'rounded-t-lg' : ''} ${index === options.length - 1 ? 'rounded-b-lg' : ''}`}
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  backgroundColor: isSelected || isHighlighted ? '#5955D1' : 'transparent',
                  color: isSelected || isHighlighted ? '#fff' : (index === highlightedIndex ? '#fff' : '#1C274C'),
                  display: 'block',
                  width: '100%',
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

// Waves effect button component
const ButtonWithWaves = ({ 
  children, 
  onClick, 
  className = '',
  disabled = false 
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, 600);

    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled}
      className={`btn-primary-lg relative overflow-hidden ${className} ${disabled ? 'opacity-65 cursor-not-allowed pointer-events-none' : ''}`}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
          style={{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </button>
  );
};

export default function Customers() {
  const [page, setPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalShowing, setIsModalShowing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditModalShowing, setIsEditModalShowing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteModalShowing, setIsDeleteModalShowing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const queryClient = useQueryClient();

  // Handle body scroll lock when modal is open
  useEffect(() => {
    if (isModalOpen || isEditModalOpen || isDeleteModalOpen) {
      document.body.classList.add('modal-open');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (isModalOpen) setIsModalShowing(true);
          if (isEditModalOpen) setIsEditModalShowing(true);
          if (isDeleteModalOpen) setIsDeleteModalShowing(true);
        });
      });
    } else {
      document.body.classList.remove('modal-open');
      setIsModalShowing(false);
      setIsEditModalShowing(false);
      setIsDeleteModalShowing(false);
    }
  }, [isModalOpen, isEditModalOpen, isDeleteModalOpen]);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page],
    queryFn: async () => {
      const response = await api.get(`/customers?skip=${page * 10}&take=10`);
      return response.data;
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      const response = await api.post('/customers', customerData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer created successfully!');
      closeModal();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create customer';
      toast.error(errorMessage);
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, customerData }: { id: number; customerData: any }) => {
      const response = await api.patch(`/customers/${id}`, customerData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer updated successfully!');
      closeEditModal();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update customer';
      toast.error(errorMessage);
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/customers/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer deleted successfully!');
      closeDeleteModal();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete customer';
      toast.error(errorMessage);
    },
  });

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalShowing(false);
    setTimeout(() => {
      setIsModalOpen(false);
    }, 300);
  };

  const closeEditModal = () => {
    setIsEditModalShowing(false);
    setTimeout(() => {
      setIsEditModalOpen(false);
      setSelectedCustomer(null);
    }, 300);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalShowing(false);
    setTimeout(() => {
      setIsDeleteModalOpen(false);
      setSelectedCustomer(null);
    }, 300);
  };

  const [actionDropdown, setActionDropdown] = useState<number | null>(null);
  const actionDropdownRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return <SkeletonPage />;
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionDropdownRef.current && !actionDropdownRef.current.contains(event.target as Node)) {
        setActionDropdown(null);
      }
    };

    if (actionDropdown !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [actionDropdown]);

  // Format date helper
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    } catch {
      return '-';
    }
  };

  // Get status badge styling
  const getStatusBadge = (isActive: boolean | undefined) => {
    if (isActive === undefined) {
      return { bg: 'bg-warning-subtle', text: 'text-warning', label: 'Pending' };
    }
    return isActive
      ? { bg: 'bg-success-subtle', text: 'text-success', label: 'Active' }
      : { bg: 'bg-danger-subtle', text: 'text-danger', label: 'Inactive' };
  };

  return (
    <div>
      {/* Page Header with Breadcrumb */}
      <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-4">
        <div className="clearfix">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary">
                  <Home className="w-4 h-4 inline" /> Home
                </a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">Customers</li>
            </ol>
          </nav>
        </div>
        <a
          href="javascript:void(0);"
          onClick={(e) => {
            e.preventDefault();
            openModal();
          }}
          className="btn-link text-primary hover:text-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4 inline me-1" /> New Customer
        </a>
      </div>

      {/* Card */}
      <div className="row">
        <div className="col-12">
          <div className="card overflow-hidden">
            <div className="card-header d-flex flex-wrap gap-3 align-items-center justify-content-between border-0 pb-0">
              <h6 className="card-title mb-0">Customer List</h6>
              <div className="clearfix d-flex align-items-center gap-2">
                <div id="dt_CustomerList_Search"></div>
              </div>
            </div>
            <div className="card-body px-1 pt-2 pb-2">
              {!data?.data || data.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No customers found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
                    Get started by adding your first customer to the system.
                  </p>
                  <ButtonWithWaves onClick={openModal}>
                    <Plus className="w-5 h-5" />
                    Add Customer
                  </ButtonWithWaves>
                </div>
              ) : (
                <table className="table table-sm table-row-rounded data-row-checkbox">
                  <thead className="table-light">
                    <tr>
                      <th>
                        <div className="form-check">
                          <input className="form-check-input" data-row-checkbox type="checkbox" />
                        </div>
                      </th>
                      <th className="minw-200px">Name & Profile</th>
                      <th className="minw-150px">Phone</th>
                      <th className="minw-150px">Email</th>
                      <th className="minw-150px">Country</th>
                      <th className="minw-150px">Date</th>
                      <th className="minw-150px">Status</th>
                      <th className="minw-100px">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((customer: any) => {
                      const statusBadge = getStatusBadge(customer.isActive);
                      return (
                        <tr key={customer.id}>
                          <td>
                            <div className="form-check p-0 w-auto d-inline-block">
                              <input className="form-check-input m-0" data-checkbox="" type="checkbox" />
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar avatar-xxs me-2 rounded-circle" style={{ width: '24px', height: '24px', backgroundColor: 'rgba(89, 85, 209, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5955D1', fontWeight: 600, fontSize: '0.625rem' }}>
                                {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                              </div>
                              {customer.name}
                            </div>
                          </td>
                          <td>{customer.phone || '-'}</td>
                          <td>{customer.email || '-'}</td>
                          <td>{customer.country || '-'}</td>
                          <td>{formatDate(customer.createdAt)}</td>
                          <td>
                            <span className={`badge badge-lg ${statusBadge.bg} ${statusBadge.text}`}>
                              {statusBadge.label}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center position-relative">
                              <button
                                className="btn btn-subtle-secondary btn-sm btn-shadow btn-icon waves-effect me-1"
                                type="button"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <div className="btn-group position-relative" ref={actionDropdown === customer.id ? actionDropdownRef : null}>
                                <button
                                  className="btn btn-subtle-primary btn-sm btn-shadow btn-icon waves-effect dropdown-toggle"
                                  type="button"
                                  onClick={() => setActionDropdown(actionDropdown === customer.id ? null : customer.id)}
                                  aria-expanded={actionDropdown === customer.id}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                {actionDropdown === customer.id && (
                                  <ul className="dropdown-menu dropdown-menu-end show" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.25rem', zIndex: 1000 }}>
                                    <li>
                                      <a
                                        className="dropdown-item"
                                        href="javascript:void(0);"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setSelectedCustomer(customer);
                                          setIsEditModalOpen(true);
                                          setActionDropdown(null);
                                        }}
                                      >
                                        Edit
                                      </a>
                                    </li>
                                    <li>
                                      <a
                                        className="dropdown-item"
                                        href="javascript:void(0);"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setSelectedCustomer(customer);
                                          setIsDeleteModalOpen(true);
                                          setActionDropdown(null);
                                        }}
                                      >
                                        Delete
                                      </a>
                                    </li>
                                  </ul>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {data?.data && data.data.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-medium text-gray-900 dark:text-white">{page * 10 + 1}</span> to{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {Math.min((page + 1) * 10, data?.total || 0)}
            </span>{' '}
            of <span className="font-medium text-gray-900 dark:text-white">{data?.total || 0}</span> results
          </div>
          <nav aria-label="Page navigation">
            <ul className="pagination pagination-rounded pagination-primary">
              <li className="page-item">
        <button
                  type="button"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
                  className="page-link"
                  aria-label="Previous"
        >
                  <ChevronsLeft className="w-3.5 h-3.5" />
        </button>
              </li>
              {(() => {
                const totalPages = Math.max(1, Math.ceil((data?.total || 0) / 10));
                const currentPage = page + 1;
                const pages: (number | string)[] = [];

                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  pages.push(1);
                  if (currentPage > 3) {
                    pages.push('...');
                  }
                  const start = Math.max(2, currentPage - 1);
                  const end = Math.min(totalPages - 1, currentPage + 1);
                  for (let i = start; i <= end; i++) {
                    if (i !== 1 && i !== totalPages) {
                      pages.push(i);
                    }
                  }
                  if (currentPage < totalPages - 2) {
                    pages.push('...');
                  }
                  if (totalPages > 1) {
                    pages.push(totalPages);
                  }
                }

                return pages.map((pageNum, idx) => {
                  if (pageNum === '...') {
                    return (
                      <li key={`ellipsis-${idx}`} className="page-item">
                        <span className="page-link" style={{ cursor: 'default', pointerEvents: 'none' }}>
                          ...
        </span>
                      </li>
                    );
                  }
                  return (
                    <li key={pageNum} className="page-item">
                      <button
                        type="button"
                        onClick={() => setPage((pageNum as number) - 1)}
                        className={`page-link ${currentPage === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    </li>
                  );
                });
              })()}
              <li className="page-item">
        <button
                  type="button"
          onClick={() => setPage((p) => p + 1)}
                  disabled={!data?.data || data.data.length < 10 || page + 1 >= Math.ceil((data?.total || 0) / 10)}
                  className="page-link"
                  aria-label="Next"
        >
                  <ChevronsRight className="w-3.5 h-3.5" />
        </button>
              </li>
            </ul>
          </nav>
      </div>
      )}

      {/* Add Customer Modal */}
      {isModalOpen && (
        <AddCustomerModal
          onClose={closeModal}
          onSubmit={(customerData) => createCustomerMutation.mutate(customerData)}
          isLoading={createCustomerMutation.isPending}
          isShowing={isModalShowing}
        />
      )}

      {/* Edit Customer Modal */}
      {isEditModalOpen && selectedCustomer && (
        <EditCustomerModal
          customer={selectedCustomer}
          onClose={closeEditModal}
          onSubmit={(customerData) => updateCustomerMutation.mutate({ id: selectedCustomer.id, customerData })}
          isLoading={updateCustomerMutation.isPending}
          isShowing={isEditModalShowing}
        />
      )}

      {/* Delete Customer Modal */}
      {isDeleteModalOpen && selectedCustomer && (
        <DeleteCustomerModal
          customer={selectedCustomer}
          onClose={closeDeleteModal}
          onConfirm={() => deleteCustomerMutation.mutate(selectedCustomer.id)}
          isLoading={deleteCustomerMutation.isPending}
          isShowing={isDeleteModalShowing}
        />
      )}
    </div>
  );
}

// Add Customer Modal Component
function AddCustomerModal({
  onClose,
  onSubmit,
  isLoading,
  isShowing,
}: {
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  isShowing: boolean;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: CustomerType.B2B,
    companyName: '',
    taxId: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    creditLimit: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  
  // Debounce email for duplicate checking
  const debouncedEmail = useDebounce(formData.email, 500);
  const { data: emailCheckData, isLoading: isCheckingEmail } = useCheckCustomerEmail(
    debouncedEmail,
    undefined,
    !!debouncedEmail && debouncedEmail.trim().length > 0 && !validators.email(debouncedEmail)
  );

  // Check for duplicate email in real-time
  useEffect(() => {
    if (emailCheckData?.exists && debouncedEmail && debouncedEmail.trim() && !validators.email(debouncedEmail)) {
      setErrors((prev) => ({ ...prev, email: 'This email is already in use' }));
    } else if (emailCheckData?.exists === false && errors.email === 'This email is already in use') {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  }, [emailCheckData, debouncedEmail]);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading) return;
    const button = submitButtonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validation
    const nameError = validators.required(formData.name, 'Name');
    if (nameError) newErrors.name = nameError;
    else {
      const nameLengthError = validators.minLength(formData.name, 2, 'Name');
      if (nameLengthError) newErrors.name = nameLengthError;
    }

    // Email validation - validate if provided or if user started typing
    if (formData.email && formData.email.trim()) {
      const emailError = validators.email(formData.email);
      if (emailError) newErrors.email = emailError;
    }

    if (formData.phone) {
      const phoneError = validators.phone(formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    if (formData.postalCode) {
      const postalCodeError = validators.postalCode(formData.postalCode);
      if (postalCodeError) newErrors.postalCode = postalCodeError;
    }

    if (formData.taxId) {
      const taxIdError = validators.taxId(formData.taxId);
      if (taxIdError) newErrors.taxId = taxIdError;
    }

    if (formData.creditLimit) {
      const creditLimitError = validators.nonNegative(formData.creditLimit, 'Credit Limit');
      if (creditLimitError) newErrors.creditLimit = creditLimitError;
    }

    if (formData.companyName) {
      const companyNameLengthError = validators.maxLength(formData.companyName, 200, 'Company Name');
      if (companyNameLengthError) newErrors.companyName = companyNameLengthError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const customerData = {
      name: formData.name.trim(),
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      type: formData.type,
      companyName: formData.companyName.trim() || undefined,
      taxId: formData.taxId.trim() || undefined,
      address: formData.address.trim() || undefined,
      city: formData.city.trim() || undefined,
      country: formData.country.trim() || undefined,
      postalCode: formData.postalCode.trim() || undefined,
      creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined,
    };

    onSubmit(customerData);
  };

  const handleChange = (field: string, value: string | CustomerType) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    // Real-time email validation
    if (field === 'email' && typeof value === 'string' && value.trim()) {
      const emailError = validators.email(value);
      if (emailError) {
        setErrors((prev) => ({ ...prev, email: emailError }));
      }
    }
    // Real-time phone validation
    if (field === 'phone' && typeof value === 'string' && value.trim()) {
      const phoneError = validators.phone(value);
      if (phoneError) {
        setErrors((prev) => ({ ...prev, phone: phoneError }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.phone;
          return newErrors;
        });
      }
    }
  };

  const typeOptions = Object.values(CustomerType).map((type) => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
  }));

  return (
    <>
      <div
        className={`modal-backdrop fade ${isShowing ? 'show' : ''}`}
        onClick={onClose}
      />
      <div
        className={`modal fade ${isShowing ? 'show' : ''}`}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="addCustomerModalLabel"
        tabIndex={-1}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '42rem' }}
        >
          <div className="modal-content w-full max-h-[90vh] flex flex-col" style={{ overflow: 'visible' }}>
            <div className="modal-header">
              <h5 id="addCustomerModalLabel" className="modal-title text-xl font-semibold text-gray-900 dark:text-white">
                Add New Customer
              </h5>
              <button
                type="button"
                onClick={onClose}
                className="btn-close p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form id="addCustomerForm" onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="modal-body flex-1 overflow-y-auto" style={{ overflowX: 'visible', position: 'relative' }}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter customer name"
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                          errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Enter email"
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                      {isCheckingEmail && formData.email && !errors.email && (
                        <p className="mt-1 text-sm text-gray-500">Checking email availability...</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                      <PhoneInput
                        value={formData.phone}
                        onChange={(value) => handleChange('phone', value || '')}
                        error={!!errors.phone}
                        placeholder="Enter phone number"
                      />
                      {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                      <CustomSelect
                        options={typeOptions}
                        value={formData.type}
                        onChange={(value) => handleChange('type', value as CustomerType)}
                        placeholder="Select type"
                        error={!!errors.type}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter company name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tax ID</label>
                      <input
                        type="text"
                        value={formData.taxId}
                        onChange={(e) => handleChange('taxId', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter tax ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Credit Limit</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.creditLimit}
                        onChange={(e) => handleChange('creditLimit', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => handleChange('country', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter country"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Postal Code</label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => handleChange('postalCode', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter postal code"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  ref={submitButtonRef}
                  type="submit"
                  onClick={handleButtonClick}
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors font-medium disabled:opacity-65 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  {isLoading ? 'Adding...' : 'Add Customer'}
                  {ripples.map((ripple) => (
                    <span
                      key={ripple.id}
                      className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
                      style={{
                        left: `${ripple.x}px`,
                        top: `${ripple.y}px`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  ))}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

// Edit Customer Modal Component
function EditCustomerModal({
  customer,
  onClose,
  onSubmit,
  isLoading,
  isShowing,
}: {
  customer: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  isShowing: boolean;
}) {
  const [formData, setFormData] = useState({
    name: customer.name || '',
    email: customer.email || '',
    phone: customer.phone || '',
    type: customer.type || CustomerType.B2B,
    companyName: customer.companyName || '',
    taxId: customer.taxId || '',
    address: customer.address || '',
    city: customer.city || '',
    country: customer.country || '',
    postalCode: customer.postalCode || '',
    creditLimit: customer.creditLimit?.toString() || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  
  // Debounce email for duplicate checking
  const debouncedEmail = useDebounce(formData.email, 500);
  const { data: emailCheckData, isLoading: isCheckingEmail } = useCheckCustomerEmail(
    debouncedEmail,
    customer.id,
    !!debouncedEmail && debouncedEmail.trim().length > 0 && !validators.email(debouncedEmail) && debouncedEmail !== customer.email
  );

  // Check for duplicate email in real-time
  useEffect(() => {
    if (emailCheckData?.exists && debouncedEmail && debouncedEmail.trim() && !validators.email(debouncedEmail) && debouncedEmail !== customer.email) {
      setErrors((prev) => ({ ...prev, email: 'This email is already in use' }));
    } else if (emailCheckData?.exists === false && errors.email === 'This email is already in use') {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  }, [emailCheckData, debouncedEmail, customer.email]);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading) return;
    const button = submitButtonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validation
    const nameError = validators.required(formData.name, 'Name');
    if (nameError) newErrors.name = nameError;
    else {
      const nameLengthError = validators.minLength(formData.name, 2, 'Name');
      if (nameLengthError) newErrors.name = nameLengthError;
    }

    // Email validation - validate if provided or if user started typing
    if (formData.email && formData.email.trim()) {
      const emailError = validators.email(formData.email);
      if (emailError) newErrors.email = emailError;
    }

    if (formData.phone) {
      const phoneError = validators.phone(formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    if (formData.postalCode) {
      const postalCodeError = validators.postalCode(formData.postalCode);
      if (postalCodeError) newErrors.postalCode = postalCodeError;
    }

    if (formData.taxId) {
      const taxIdError = validators.taxId(formData.taxId);
      if (taxIdError) newErrors.taxId = taxIdError;
    }

    if (formData.creditLimit) {
      const creditLimitError = validators.nonNegative(formData.creditLimit, 'Credit Limit');
      if (creditLimitError) newErrors.creditLimit = creditLimitError;
    }

    if (formData.companyName) {
      const companyNameLengthError = validators.maxLength(formData.companyName, 200, 'Company Name');
      if (companyNameLengthError) newErrors.companyName = companyNameLengthError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const customerData = {
      name: formData.name.trim(),
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      type: formData.type,
      companyName: formData.companyName.trim() || undefined,
      taxId: formData.taxId.trim() || undefined,
      address: formData.address.trim() || undefined,
      city: formData.city.trim() || undefined,
      country: formData.country.trim() || undefined,
      postalCode: formData.postalCode.trim() || undefined,
      creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined,
    };

    onSubmit(customerData);
  };

  const handleChange = (field: string, value: string | CustomerType) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    // Real-time email validation
    if (field === 'email' && typeof value === 'string' && value.trim()) {
      const emailError = validators.email(value);
      if (emailError) {
        setErrors((prev) => ({ ...prev, email: emailError }));
      }
    }
    // Real-time phone validation
    if (field === 'phone' && typeof value === 'string' && value.trim()) {
      const phoneError = validators.phone(value);
      if (phoneError) {
        setErrors((prev) => ({ ...prev, phone: phoneError }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.phone;
          return newErrors;
        });
      }
    }
  };

  const typeOptions = Object.values(CustomerType).map((type) => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
  }));

  return (
    <>
      <div
        className={`modal-backdrop fade ${isShowing ? 'show' : ''}`}
        onClick={onClose}
      />
      <div
        className={`modal fade ${isShowing ? 'show' : ''}`}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="editCustomerModalLabel"
        tabIndex={-1}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '42rem' }}
        >
          <div className="modal-content w-full max-h-[90vh] flex flex-col" style={{ overflow: 'visible' }}>
            <div className="modal-header">
              <h5 id="editCustomerModalLabel" className="modal-title text-xl font-semibold text-gray-900 dark:text-white">
                Edit Customer
              </h5>
              <button
                type="button"
                onClick={onClose}
                className="btn-close p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form id="editCustomerForm" onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="modal-body flex-1 overflow-y-auto" style={{ overflowX: 'visible', position: 'relative' }}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter customer name"
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white ${
                          errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Enter email"
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                      {isCheckingEmail && formData.email && !errors.email && (
                        <p className="mt-1 text-sm text-gray-500">Checking email availability...</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                      <PhoneInput
                        value={formData.phone}
                        onChange={(value) => handleChange('phone', value || '')}
                        error={!!errors.phone}
                        placeholder="Enter phone number"
                      />
                      {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                      <CustomSelect
                        options={typeOptions}
                        value={formData.type}
                        onChange={(value) => handleChange('type', value as CustomerType)}
                        placeholder="Select type"
                        error={!!errors.type}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter company name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tax ID</label>
                      <input
                        type="text"
                        value={formData.taxId}
                        onChange={(e) => handleChange('taxId', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter tax ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Credit Limit</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.creditLimit}
                        onChange={(e) => handleChange('creditLimit', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => handleChange('country', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter country"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Postal Code</label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => handleChange('postalCode', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter postal code"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  ref={submitButtonRef}
                  type="submit"
                  onClick={handleButtonClick}
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors font-medium disabled:opacity-65 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  {isLoading ? 'Updating...' : 'Update Customer'}
                  {ripples.map((ripple) => (
                    <span
                      key={ripple.id}
                      className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
                      style={{
                        left: `${ripple.x}px`,
                        top: `${ripple.y}px`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  ))}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

// Delete Customer Modal Component
function DeleteCustomerModal({
  customer,
  onClose,
  onConfirm,
  isLoading,
  isShowing,
}: {
  customer: any;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  isShowing: boolean;
}) {
  return (
    <>
      <div
        className={`modal-backdrop fade ${isShowing ? 'show' : ''}`}
        onClick={onClose}
      />
      <div
        className={`modal fade ${isShowing ? 'show' : ''}`}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="deleteCustomerModalLabel"
        tabIndex={-1}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '28rem' }}
        >
          <div className="modal-content">
            <div className="modal-body text-center py-8 px-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" strokeWidth={2} />
                </div>
              </div>
              <h5 id="deleteCustomerModalLabel" className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Delete Customer
              </h5>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                Are you sure you want to delete
              </p>
              <p className="text-gray-900 dark:text-white font-semibold mb-4">
                "{customer.name}"?
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer border-t border-gray-200 dark:border-gray-700 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className="px-5 py-2.5 ml-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-65 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isLoading ? 'Deleting...' : 'Delete Customer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
