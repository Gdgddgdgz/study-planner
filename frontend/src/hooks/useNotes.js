import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// Fetch notes (optional filters by subjectId, folderId)
export function useNotes(subjectId, folderId) {
  return useQuery({
    queryKey: ['notes', { subjectId, folderId }],
    queryFn: async () => {
      const res = await api.get('/api/notes', {
        params: {
          subjectId: subjectId || undefined,
          folderId: folderId || undefined,
        },
      });
      return res.data?.notes || res.data?.data || [];
    },
  });
}

// Upload file directly to AWS S3 via backend endpoint
export function useUploadNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, title, subjectId, folderId, content }) => {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      formData.append('title', title || (file ? file.name : 'Untitled Note'));
      formData.append('subjectId', subjectId);
      if (folderId) {
        formData.append('folderId', folderId);
      }
      if (content) {
        formData.append('content', content);
      }

      const res = await api.post('/api/notes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data?.note || res.data?.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      if (variables.subjectId) {
        queryClient.invalidateQueries({ queryKey: ['folders', variables.subjectId] });
      }
    },
  });
}

// Create text-only note record
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteData) => {
      const res = await api.post('/api/notes', noteData);
      return res.data?.note || res.data?.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      if (variables.subjectId) {
        queryClient.invalidateQueries({ queryKey: ['folders', variables.subjectId] });
      }
    },
  });
}

// Update note
export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...noteData }) => {
      const res = await api.put(`/api/notes/${id}`, noteData);
      return res.data?.note || res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

// Delete note record and S3 file
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, subjectId }) => {
      const res = await api.delete(`/api/notes/${noteId}`);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      if (variables?.subjectId) {
        queryClient.invalidateQueries({ queryKey: ['folders', variables.subjectId] });
      }
    },
  });
}
