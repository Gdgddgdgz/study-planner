import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// Fetch all subjects with stats
export function useSubjects() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const res = await api.get('/api/subjects');
      return res.data?.subjects || res.data?.data || [];
    },
  });
}

// Fetch a single subject with its chapters
export function useSubject(id) {
  return useQuery({
    queryKey: ['subject', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await api.get(`/api/subjects/${id}`);
      return res.data?.subject || res.data?.data;
    },
    enabled: Boolean(id),
  });
}

// Create a subject
export function useCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSubject) => {
      const res = await api.post('/api/subjects', newSubject);
      return res.data?.subject || res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Update a subject
export function useUpdateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const res = await api.put(`/api/subjects/${id}`, data);
      return res.data?.subject || res.data?.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['subject', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Delete a subject
export function useDeleteSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subjectId) => {
      const res = await api.delete(`/api/subjects/${subjectId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Onboard subjects batch
export function useOnboardSubjects() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subjectsList) => {
      const res = await api.post('/api/subjects/onboard', { subjectsList });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
