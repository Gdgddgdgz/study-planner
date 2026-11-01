import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// Fetch recent study sessions
export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const res = await api.get('/api/sessions');
      return res.data?.sessions || res.data?.data || [];
    },
  });
}

// Fetch session stats (today focus time, streak, etc.)
export function useSessionStats() {
  return useQuery({
    queryKey: ['sessionStats'],
    queryFn: async () => {
      const res = await api.get('/api/sessions/stats');
      return res.data?.stats || res.data?.data || {};
    },
  });
}

// Record a completed study session
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionData) => {
      const res = await api.post('/api/sessions', sessionData);
      return res.data?.session || res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessionStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
