import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// Fetch all topic folders for a subject
export function useSubjectFolders(subjectId) {
  return useQuery({
    queryKey: ['folders', subjectId],
    queryFn: async () => {
      if (!subjectId) return [];
      const res = await api.get(`/api/subjects/${subjectId}/folders`);
      return res.data?.folders || res.data?.data || [];
    },
    enabled: Boolean(subjectId),
  });
}

// Create a new topic folder for a subject
export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subjectId, name, description, color }) => {
      const res = await api.post(`/api/subjects/${subjectId}/folders`, {
        name,
        description,
        color,
      });
      return res.data?.folder || res.data?.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['folders', variables.subjectId] });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}

// Update a topic folder
export function useUpdateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, subjectId, name, description, color }) => {
      const res = await api.put(`/api/folders/${id}`, {
        name,
        description,
        color,
      });
      return res.data?.folder || res.data?.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['folders', variables.subjectId] });
    },
  });
}

// Delete a topic folder
export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, subjectId }) => {
      const res = await api.delete(`/api/folders/${id}`);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['folders', variables.subjectId] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}
