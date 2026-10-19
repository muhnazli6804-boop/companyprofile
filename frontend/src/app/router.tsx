import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { ApplicantLayout } from '@/layouts/ApplicantLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { RequireAuth } from '@/app/guards/RequireAuth';
import { RequireAdmin } from '@/app/guards/RequireAdmin';
import { GuestOnly } from '@/app/guards/GuestOnly';

// Lazy-loaded Public Pages
const HomePage = lazy(() => import('@/features/public/pages/HomePage'));
const AboutPage = lazy(() => import('@/features/public/pages/AboutPage'));
const VisionMissionPage = lazy(() => import('@/features/public/pages/VisionMissionPage'));
const UnitListPage = lazy(() => import('@/features/public/pages/UnitListPage'));
const UnitDetailPage = lazy(() => import('@/features/public/pages/UnitDetailPage'));
const PostListPage = lazy(() => import('@/features/public/pages/PostListPage'));
const PostDetailPage = lazy(() => import('@/features/public/pages/PostDetailPage'));
const GalleryPage = lazy(() => import('@/features/public/pages/GalleryPage'));
const RegistrationInfoPage = lazy(() => import('@/features/public/pages/RegistrationInfoPage'));
const VacancyListPage = lazy(() => import('@/features/public/pages/VacancyListPage'));
const ContactPage = lazy(() => import('@/features/public/pages/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('@/features/public/pages/PrivacyPolicyPage'));

// Lazy-loaded Auth Pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const AdminLoginPage = lazy(() => import('@/features/auth/pages/AdminLoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/features/auth/pages/VerifyEmailPage'));

// Lazy-loaded Applicant Pages
const StudentAppListPage = lazy(() => import('@/features/student-application/pages/ApplicationListPage'));
const StudentAppFormPage = lazy(() => import('@/features/student-application/pages/ApplicationFormPage'));
const StudentAppStatusPage = lazy(() => import('@/features/student-application/pages/ApplicationStatusPage'));
const TeacherAppListPage = lazy(() => import('@/features/teacher-application/pages/ApplicationListPage'));
const TeacherAppFormPage = lazy(() => import('@/features/teacher-application/pages/ApplicationFormPage'));
const TeacherAppStatusPage = lazy(() => import('@/features/teacher-application/pages/ApplicationStatusPage'));

// Lazy-loaded Admin Pages
const AdminDashboardPage = lazy(() => import('@/features/admin/dashboard/pages/DashboardAdminPage'));
const AdminStudentAppsPage = lazy(() => import('@/features/admin/student-applications/pages/StudentApplicationsPage'));
const AdminTeacherAppsPage = lazy(() => import('@/features/admin/teacher-applications/pages/TeacherApplicationsPage'));
const AdminPeriodsPage = lazy(() => import('@/features/admin/periods/pages/PeriodsPage'));
const AdminUnitsPage = lazy(() => import('@/features/admin/education-units/pages/EducationUnitsPage'));
const AdminRequirementsPage = lazy(() => import('@/features/admin/document-requirements/pages/DocumentRequirementsPage'));
const AdminVacanciesPage = lazy(() => import('@/features/admin/vacancies/pages/VacanciesPage'));
const AdminCmsPage = lazy(() => import('@/features/admin/cms/pages/CmsPage'));
const AdminMessagesPage = lazy(() => import('@/features/admin/messages/pages/MessagesPage'));
const AdminUsersPage = lazy(() => import('@/features/admin/users-roles/pages/UsersRolesPage'));
const AdminLogsPage = lazy(() => import('@/features/admin/activity-logs/pages/ActivityLogsPage'));
const AdminSettingsPage = lazy(() => import('@/features/admin/settings/pages/SettingsPage'));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="p-8 text-center text-muted">Memuat halaman...</div>}>
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  // 1. Public Routes
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <SuspenseWrapper><HomePage /></SuspenseWrapper> },
      { path: 'tentang', element: <SuspenseWrapper><AboutPage /></SuspenseWrapper> },
      { path: 'visi-misi', element: <SuspenseWrapper><VisionMissionPage /></SuspenseWrapper> },
      { path: 'unit', element: <SuspenseWrapper><UnitListPage /></SuspenseWrapper> },
      { path: 'unit/:slug', element: <SuspenseWrapper><UnitDetailPage /></SuspenseWrapper> },
      { path: 'berita', element: <SuspenseWrapper><PostListPage /></SuspenseWrapper> },
      { path: 'berita/:slug', element: <SuspenseWrapper><PostDetailPage /></SuspenseWrapper> },
      { path: 'galeri', element: <SuspenseWrapper><GalleryPage /></SuspenseWrapper> },
      { path: 'informasi-pendaftaran', element: <SuspenseWrapper><RegistrationInfoPage /></SuspenseWrapper> },
      { path: 'lowongan-guru', element: <SuspenseWrapper><VacancyListPage /></SuspenseWrapper> },
      { path: 'kontak', element: <SuspenseWrapper><ContactPage /></SuspenseWrapper> },
      { path: 'kebijakan-privasi', element: <SuspenseWrapper><PrivacyPolicyPage /></SuspenseWrapper> },
    ],
  },

  // 2. Auth Routes (Guest Only)
  {
    path: 'auth',
    element: <GuestOnly />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <SuspenseWrapper><LoginPage /></SuspenseWrapper> },
          { path: 'admin/login', element: <SuspenseWrapper><AdminLoginPage /></SuspenseWrapper> },
          { path: 'register', element: <SuspenseWrapper><RegisterPage /></SuspenseWrapper> },
          { path: 'forgot-password', element: <SuspenseWrapper><ForgotPasswordPage /></SuspenseWrapper> },
          { path: 'reset-password', element: <SuspenseWrapper><ResetPasswordPage /></SuspenseWrapper> },
          { path: 'verify-email', element: <SuspenseWrapper><VerifyEmailPage /></SuspenseWrapper> },
        ],
      },
    ],
  },

  // 3. Applicant Routes (Protected)
  {
    path: 'akun',
    element: <RequireAuth />,
    children: [
      {
        element: <ApplicantLayout />,
        children: [
          { index: true, element: <Navigate to="pendaftaran-siswa" replace /> },
          { path: 'pendaftaran-siswa', element: <SuspenseWrapper><StudentAppListPage /></SuspenseWrapper> },
          { path: 'pendaftaran-siswa/baru', element: <SuspenseWrapper><StudentAppFormPage /></SuspenseWrapper> },
          { path: 'pendaftaran-siswa/:id', element: <SuspenseWrapper><StudentAppStatusPage /></SuspenseWrapper> },
          { path: 'lamaran-guru', element: <SuspenseWrapper><TeacherAppListPage /></SuspenseWrapper> },
          { path: 'lamaran-guru/baru', element: <SuspenseWrapper><TeacherAppFormPage /></SuspenseWrapper> },
          { path: 'lamaran-guru/:id', element: <SuspenseWrapper><TeacherAppStatusPage /></SuspenseWrapper> },
        ],
      },
    ],
  },

  // 4. Admin Routes (Protected)
  {
    path: 'admin',
    element: <RequireAdmin />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <SuspenseWrapper><AdminDashboardPage /></SuspenseWrapper> },
          { path: 'pendaftaran-siswa', element: <SuspenseWrapper><AdminStudentAppsPage /></SuspenseWrapper> },
          { path: 'lamaran-guru', element: <SuspenseWrapper><AdminTeacherAppsPage /></SuspenseWrapper> },
          { path: 'periode', element: <SuspenseWrapper><AdminPeriodsPage /></SuspenseWrapper> },
          { path: 'unit-pendidikan', element: <SuspenseWrapper><AdminUnitsPage /></SuspenseWrapper> },
          { path: 'syarat-dokumen', element: <SuspenseWrapper><AdminRequirementsPage /></SuspenseWrapper> },
          { path: 'lowongan-guru', element: <SuspenseWrapper><AdminVacanciesPage /></SuspenseWrapper> },
          { path: 'cms', element: <SuspenseWrapper><AdminCmsPage /></SuspenseWrapper> },
          { path: 'pesan-kontak', element: <SuspenseWrapper><AdminMessagesPage /></SuspenseWrapper> },
          { path: 'pengguna', element: <SuspenseWrapper><AdminUsersPage /></SuspenseWrapper> },
          { path: 'log-aktivitas', element: <SuspenseWrapper><AdminLogsPage /></SuspenseWrapper> },
          { path: 'pengaturan', element: <SuspenseWrapper><AdminSettingsPage /></SuspenseWrapper> },
        ],
      },
    ],
  },

  // Catch-all
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
