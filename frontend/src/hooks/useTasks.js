import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// Fetch all tasks with optional filters
export function useTasks(filter = 'All', subject = 'All') {
  return useQuery({
    queryKey: ['tasks', { filter, subject }],
    queryFn: async () => {
      const res = await api.get('/api/tasks', {
        params: {
          filter: filter !== 'All' ? filter : undefined,
          subject: subject !== 'All' ? subject : undefined,
        },
      });
      return res.data?.tasks || res.data?.data || [];
    },
  });
}

// Create a new task
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTask) => {
      const res = await api.post('/api/tasks', newTask);
      return res.data?.task || res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}

// Toggle a task done state
export function useToggleTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId) => {
      const res = await api.patch(`/api/tasks/${taskId}/toggle`);
      return res.data?.task || res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}

// Update task details
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const res = await api.put(`/api/tasks/${id}`, data);
      return res.data?.task || res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Delete a task
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId) => {
      const res = await api.delete(`/api/tasks/${taskId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}
