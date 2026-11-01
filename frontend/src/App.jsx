import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import SubjectsPage from './pages/SubjectsPage';
import NotesPage from './pages/NotesPage';
import StudySessionPage from './pages/StudySessionPage';
import AIPlanner from './pages/AIPlanner';
import EditSubjectPage from './pages/EditSubjectPage';
import SearchResultsPage from './pages/SearchResultsPage';
import AllTasksCompletedPage from './pages/AllTasksCompletedPage';
import ErrorStatePage from './pages/ErrorStatePage';
import OfflineStatePage from './pages/OfflineStatePage';

import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

            {/* Main App - Protected */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
            <Route path="/tasks/completed" element={<ProtectedRoute><AllTasksCompletedPage /></ProtectedRoute>} />
            <Route path="/subjects" element={<ProtectedRoute><SubjectsPage /></ProtectedRoute>} />
            <Route path="/subjects/edit/:id" element={<ProtectedRoute><EditSubjectPage /></ProtectedRoute>} />
            <Route path="/notes" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
            <Route path="/study-session" element={<ProtectedRoute><StudySessionPage /></ProtectedRoute>} />
            <Route path="/ai-planner" element={<ProtectedRoute><AIPlanner /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><SearchResultsPage /></ProtectedRoute>} />

            {/* State Pages */}
            <Route path="/error" element={<ErrorStatePage />} />
            <Route path="/offline" element={<OfflineStatePage />} />

            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}