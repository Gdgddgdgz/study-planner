import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/api/dashboard');
      return res.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
}
