import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import api from '../lib/api';

// Hook to check if email exists (for customers)
export const useCheckCustomerEmail = (email: string, excludeId?: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['check-customer-email', email, excludeId],
    queryFn: async () => {
      if (!email || !email.trim()) return { exists: false };
      const response = await api.get(`/customers/check-email/${encodeURIComponent(email.trim())}${excludeId ? `?excludeId=${excludeId}` : ''}`);
      return response.data;
    },
    enabled: enabled && !!email && email.trim().length > 0,
    retry: false,
    staleTime: 0,
  });
};

// Hook to check if email exists (for users)
export const useCheckUserEmail = (email: string, excludeId?: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['check-user-email', email, excludeId],
    queryFn: async () => {
      if (!email || !email.trim()) return { exists: false };
      const response = await api.get(`/users/check-email/${encodeURIComponent(email.trim())}${excludeId ? `?excludeId=${excludeId}` : ''}`);
      return response.data;
    },
    enabled: enabled && !!email && email.trim().length > 0,
    retry: false,
    staleTime: 0,
  });
};

// Debounce utility
export const useDebounce = (value: string, delay: number = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

