import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { NotFoundPage } from './features/errors/ErrorPages';

// Lazy-loaded pages
const LandingPage = lazy(() => import('./features/landing/LandingPage'));
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const SignupPage = lazy(() => import('./features/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./features/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./features/auth/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const ProfilePage = lazy(() => import('./features/profile/ProfilePage'));
const ResumePage = lazy(() => import('./features/resume/ResumePage'));
const ResumeBuilderPage = lazy(() => import('./features/resume/ResumeBuilderPage'));
const CareerRecommendationPage = lazy(() => import('./features/career/CareerRecommendationPage'));
const SavedCareersPage = lazy(() => import('./features/career/SavedCareersPage'));
const SkillGapPage = lazy(() => import('./features/skillgap/SkillGapPage'));
const RoadmapPage = lazy(() => import('./features/roadmap/RoadmapPage'));
const AnalyticsPage = lazy(() => import('./features/analytics/AnalyticsPage'));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/resume/builder" element={<ResumeBuilderPage />} />
          <Route path="/career" element={<CareerRecommendationPage />} />
          <Route path="/saved-careers" element={<SavedCareersPage />} />
          <Route path="/skill-gap" element={<SkillGapPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
