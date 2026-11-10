import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { RequireAuth } from '@/app/guards/RequireAuth';
import { RequireAdmin } from '@/app/guards/RequireAdmin';
import { RequirePermission } from '@/app/guards/RequirePermission';
import { RequireStaff } from '@/app/guards/RequireStaff';
import { StaffLayout } from '@/layouts/StaffLayout';
import { GuestOnly } from '@/app/guards/GuestOnly';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

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
const RegistrationHubPage = lazy(() => import('@/features/public/pages/RegistrationHubPage'));

// Lazy-loaded Auth Pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/features/auth/pages/VerifyEmailPage'));

// Lazy-loaded Student Application Pages
const StudentFormPage = lazy(() => import('@/features/student-application/pages/StudentFormPage'));
const StudentRequirementsPage = lazy(() => import('@/features/student-application/pages/StudentRequirementsPage'));
const StudentConfirmationPage = lazy(() => import('@/features/student-application/pages/StudentConfirmationPage'));
const StudentSuccessPage = lazy(() => import('@/features/student-application/pages/StudentSuccessPage'));

// Lazy-loaded Teacher Application Pages
const TeacherFormPage = lazy(() => import('@/features/teacher-application/pages/TeacherFormPage'));
const TeacherRequirementsPage = lazy(() => import('@/features/teacher-application/pages/TeacherRequirementsPage'));
const TeacherConfirmationPage = lazy(() => import('@/features/teacher-application/pages/TeacherConfirmationPage'));
const TeacherSuccessPage = lazy(() => import('@/features/teacher-application/pages/TeacherSuccessPage'));

// Applicant Account / Status Pages
const ApplicationListPage = lazy(() => import('@/features/student-application/pages/ApplicationListPage'));
const ApplicationStatusPage = lazy(() => import('@/features/student-application/pages/ApplicationStatusPage'));

// Lazy-loaded Admin Pages
const AdminDashboardPage = lazy(() => import('@/features/admin/dashboard/pages/DashboardAdminPage'));
const AdminStudentAppsPage = lazy(() => import('@/features/admin/student-applications/pages/StudentApplicationsPage'));
const AdminStudentAppDetailPage = lazy(() => import('@/features/admin/student-applications/pages/StudentApplicationDetailPage'));
const AdminTeacherAppsPage = lazy(() => import('@/features/admin/teacher-applications/pages/TeacherApplicationsPage'));
const AdminTeacherAppDetailPage = lazy(() => import('@/features/admin/teacher-applications/pages/TeacherApplicationDetailPage'));
const AdminPeriodsPage = lazy(() => import('@/features/admin/periods/pages/PeriodsPage'));
const AdminUnitsPage = lazy(() => import('@/features/admin/education-units/pages/EducationUnitsPage'));
const AdminRequirementsPage = lazy(() => import('@/features/admin/document-requirements/pages/DocumentRequirementsPage'));
const AdminVacanciesPage = lazy(() => import('@/features/admin/vacancies/pages/VacanciesPage'));
const AdminCmsPage = lazy(() => import('@/features/admin/cms/pages/CmsPage'));
const AdminMessagesPage = lazy(() => import('@/features/admin/messages/pages/MessagesPage'));
const AdminFinancePage = lazy(() => import('@/features/admin/finance/pages/FinancePage'));
const AdminUsersPage = lazy(() => import('@/features/admin/users-roles/pages/UsersRolesPage'));
const AdminLogsPage = lazy(() => import('@/features/admin/activity-logs/pages/ActivityLogsPage'));

// Lazy-loaded Staff / Guru Pages
const StaffLoginPage = lazy(() => import('@/features/staff/pages/StaffLoginPage'));
const StaffForgotPasswordPage = lazy(() => import('@/features/staff/pages/StaffForgotPasswordPage'));
const StaffResetPasswordPage = lazy(() => import('@/features/staff/pages/StaffResetPasswordPage'));
const StaffDashboardPage = lazy(() => import('@/features/staff/pages/StaffDashboardPage'));
const StaffNewsPage = lazy(() => import('@/features/staff/pages/StaffNewsPage'));
const StaffNewsFormPage = lazy(() => import('@/features/staff/pages/StaffNewsFormPage'));
const StaffWebsiteContentPage = lazy(() => import('@/features/staff/pages/StaffWebsiteContentPage'));
const StaffGalleryPage = lazy(() => import('@/features/staff/pages/StaffGalleryPage'));
const StaffAchievementsPage = lazy(() => import('@/features/staff/pages/StaffAchievementsPage'));
const StaffFaqPage = lazy(() => import('@/features/staff/pages/StaffFaqPage'));
const StaffMediaLibraryPage = lazy(() => import('@/features/staff/pages/StaffMediaLibraryPage'));
const StaffPublicationsPage = lazy(() => import('@/features/staff/pages/StaffPublicationsPage'));
const StaffProfilePage = lazy(() => import('@/features/staff/pages/StaffProfilePage'));
const StaffChangePasswordPage = lazy(() => import('@/features/staff/pages/StaffChangePasswordPage'));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingScreen message="Memuat halaman..." minHeight="min-h-[50vh]" />}>
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  // 1. Public & Main Layout Routes
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

      // Hub Pendaftaran
      { path: 'pendaftaran', element: <SuspenseWrapper><RegistrationHubPage /></SuspenseWrapper> },

      // Rute Masuk / Daftar Publik
      { path: 'masuk', element: <SuspenseWrapper><LoginPage /></SuspenseWrapper> },
      { path: 'daftar-akun', element: <SuspenseWrapper><RegisterPage /></SuspenseWrapper> },
      { path: 'lupa-kata-sandi', element: <SuspenseWrapper><ForgotPasswordPage /></SuspenseWrapper> },

      // Rute Pendaftaran Murid (Dilindungi Autentikasi)
      {
        path: 'pendaftaran/murid',
        element: <RequireAuth />,
        children: [
          { index: true, element: <SuspenseWrapper><StudentFormPage /></SuspenseWrapper> },
          { path: ':id', element: <SuspenseWrapper><StudentFormPage /></SuspenseWrapper> },
          { path: ':id/persyaratan', element: <SuspenseWrapper><StudentRequirementsPage /></SuspenseWrapper> },
          { path: ':id/konfirmasi', element: <SuspenseWrapper><StudentConfirmationPage /></SuspenseWrapper> },
          { path: ':id/selesai', element: <SuspenseWrapper><StudentSuccessPage /></SuspenseWrapper> },
        ],
      },

      // Rute Pendaftaran Guru (Dilindungi Autentikasi)
      {
        path: 'pendaftaran/guru',
        element: <RequireAuth />,
        children: [
          { index: true, element: <SuspenseWrapper><TeacherFormPage /></SuspenseWrapper> },
          { path: ':id', element: <SuspenseWrapper><TeacherFormPage /></SuspenseWrapper> },
          { path: ':id/persyaratan', element: <SuspenseWrapper><TeacherRequirementsPage /></SuspenseWrapper> },
          { path: ':id/konfirmasi', element: <SuspenseWrapper><TeacherConfirmationPage /></SuspenseWrapper> },
          { path: ':id/selesai', element: <SuspenseWrapper><TeacherSuccessPage /></SuspenseWrapper> },
        ],
      },

      // Rute Akun / Dasbor Status Pendaftaran
      {
        path: 'akun',
        element: <RequireAuth />,
        children: [
          { index: true, element: <Navigate to="pendaftaran" replace /> },
          { path: 'pendaftaran', element: <SuspenseWrapper><ApplicationListPage /></SuspenseWrapper> },
          { path: 'pendaftaran/murid/:id', element: <SuspenseWrapper><ApplicationStatusPage /></SuspenseWrapper> },
          { path: 'pendaftaran/guru/:id', element: <SuspenseWrapper><ApplicationStatusPage /></SuspenseWrapper> },
          // Backward compatibility aliases
          { path: 'pendaftaran-siswa', element: <Navigate to="/akun/pendaftaran" replace /> },
          { path: 'pendaftaran-siswa/:id', element: <SuspenseWrapper><ApplicationStatusPage /></SuspenseWrapper> },
          { path: 'lamaran-guru', element: <Navigate to="/akun/pendaftaran" replace /> },
          { path: 'lamaran-guru/:id', element: <SuspenseWrapper><ApplicationStatusPage /></SuspenseWrapper> },
        ],
      },
    ],
  },

  // 2. Auth Standalone Routes (Guest Only)
  {
    path: 'auth',
    element: <GuestOnly />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <SuspenseWrapper><LoginPage /></SuspenseWrapper> },
          { path: 'admin/login', element: <Navigate to="/masuk" replace /> },
          { path: 'register', element: <SuspenseWrapper><RegisterPage /></SuspenseWrapper> },
          { path: 'forgot-password', element: <SuspenseWrapper><ForgotPasswordPage /></SuspenseWrapper> },
          { path: 'reset-password', element: <SuspenseWrapper><ResetPasswordPage /></SuspenseWrapper> },
          { path: 'verify-email', element: <SuspenseWrapper><VerifyEmailPage /></SuspenseWrapper> },
        ],
      },
    ],
  },

  // 3. Admin Routes (Protected)
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
          { path: 'pendaftaran-siswa/:id', element: <SuspenseWrapper><AdminStudentAppDetailPage /></SuspenseWrapper> },
          { path: 'lamaran-guru', element: <SuspenseWrapper><AdminTeacherAppsPage /></SuspenseWrapper> },
          { path: 'lamaran-guru/:id', element: <SuspenseWrapper><AdminTeacherAppDetailPage /></SuspenseWrapper> },
          { path: 'periode', element: <SuspenseWrapper><AdminPeriodsPage /></SuspenseWrapper> },
          { path: 'unit-pendidikan', element: <SuspenseWrapper><AdminUnitsPage /></SuspenseWrapper> },
          { path: 'syarat-dokumen', element: <SuspenseWrapper><AdminRequirementsPage /></SuspenseWrapper> },
          { path: 'lowongan-guru', element: <SuspenseWrapper><AdminVacanciesPage /></SuspenseWrapper> },
          { path: 'cms', element: <SuspenseWrapper><AdminCmsPage /></SuspenseWrapper> },
          { path: 'pesan-kontak', element: <SuspenseWrapper><AdminMessagesPage /></SuspenseWrapper> },
          { path: 'keuangan', element: <SuspenseWrapper><AdminFinancePage /></SuspenseWrapper> },
          {
            element: <RequirePermission permission="users.manage" />,
            children: [{ path: 'pengguna', element: <SuspenseWrapper><AdminUsersPage /></SuspenseWrapper> }],
          },
          { path: 'log-aktivitas', element: <SuspenseWrapper><AdminLogsPage /></SuspenseWrapper> },
          { path: 'pengaturan', element: <Navigate to="/admin/cms?tab=identity" replace /> },
          { path: 'settings', element: <Navigate to="/admin/cms?tab=identity" replace /> },
        ],
      },
    ],
  },

  // 4. Staff & Guru Portal Routes
  {
    path: 'staff',
    children: [
      // Auth routes (unprotected)
      { path: 'login', element: <SuspenseWrapper><StaffLoginPage /></SuspenseWrapper> },
      { path: 'lupa-password', element: <SuspenseWrapper><StaffForgotPasswordPage /></SuspenseWrapper> },
      { path: 'reset-password', element: <SuspenseWrapper><StaffResetPasswordPage /></SuspenseWrapper> },

      // Protected routes
      {
        element: <RequireStaff />,
        children: [
          {
            element: <StaffLayout />,
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: 'dashboard', element: <SuspenseWrapper><StaffDashboardPage /></SuspenseWrapper> },
              { path: 'berita', element: <SuspenseWrapper><StaffNewsPage /></SuspenseWrapper> },
              { path: 'berita/tambah', element: <SuspenseWrapper><StaffNewsFormPage /></SuspenseWrapper> },
              { path: 'berita/edit/:id', element: <SuspenseWrapper><StaffNewsFormPage /></SuspenseWrapper> },
              { path: 'konten', element: <SuspenseWrapper><StaffWebsiteContentPage /></SuspenseWrapper> },
              { path: 'galeri', element: <SuspenseWrapper><StaffGalleryPage /></SuspenseWrapper> },
              { path: 'prestasi', element: <SuspenseWrapper><StaffAchievementsPage /></SuspenseWrapper> },
              { path: 'faq', element: <SuspenseWrapper><StaffFaqPage /></SuspenseWrapper> },
              { path: 'media', element: <SuspenseWrapper><StaffMediaLibraryPage /></SuspenseWrapper> },
              { path: 'publikasi', element: <SuspenseWrapper><StaffPublicationsPage /></SuspenseWrapper> },
              { path: 'profil', element: <SuspenseWrapper><StaffProfilePage /></SuspenseWrapper> },
              { path: 'ubah-password', element: <SuspenseWrapper><StaffChangePasswordPage /></SuspenseWrapper> },
            ],
          },
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
