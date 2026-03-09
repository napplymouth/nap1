import React from 'react';
import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import { ProtectedRoute } from '../components/feature/ProtectedRoute';

// Lazy‑load page components
const HomePage = lazy(() => import('../pages/home/page'));
const AboutPage = lazy(() => import('../pages/about/page'));
const TrainingPage = lazy(() => import('../pages/training/page'));
const ContactPage = lazy(() => import('../pages/contact/page'));
const VolunteerPage = lazy(() => import('../pages/volunteer/page'));
const GetNaloxonePage = lazy(() => import('../pages/get-naloxone/page'));
const ResourcesPage = lazy(() => import('../pages/resources/page'));
const ThankYouPage = lazy(() => import('../pages/thank-you/page'));
const NotFound = lazy(() => import('../pages/NotFound'));
const MembersLoginPage = lazy(() => import('../pages/members/login/page'));
const MembersDashboardPage = lazy(() => import('../pages/members/dashboard/page'));
const MembersResourcesPage = lazy(() => import('../pages/members/resources/page'));
const MembersELearningPage = lazy(() => import('../pages/members/elearning/page'));
const MembersELearningCoursePage = lazy(() => import('../pages/members/elearning/course/page'));
const BookingCartPage = lazy(() => import('../pages/booking/page'));
const ManageBookingPage = lazy(() => import('../pages/manage-booking/page'));
const NewsPage = lazy(() => import('../pages/news/page'));
const NewsDetailPage = lazy(() => import('../pages/news/detail/page'));
const PartnersPage = lazy(() => import('../pages/partners/page'));
const EmergencyPage = lazy(() => import('../pages/emergency/page'));
const CheckoutPage = lazy(() => import('../pages/checkout/page'));
const ShopPage = lazy(() => import('../pages/shop/page'));
const ProductDetailPage = lazy(() => import('../pages/shop/detail/page'));
const EventsPage = lazy(() => import('../pages/events/page'));
const FAQPage = lazy(() => import('../pages/faq/page'));
const HarmReductionPosterPage = lazy(() => import('../pages/resources/harm-reduction-poster/page'));
const FamilySupportGuidePage = lazy(() => import('../pages/resources/family-support-guide/page'));
const PeerSupportPage = lazy(() => import('../pages/peer-support/page'));

const AdminLoginPage = lazy(() => import('../pages/admin/login/page'));
const AdminDashboardPage = lazy(() => import('../pages/admin/dashboard/page'));

const ProfessionalsLoginPage = lazy(() => import('../pages/professionals/login/page'));
const ProfessionalsDashboardPage = lazy(() => import('../pages/professionals/dashboard/page'));
const ProfessionalsJoinPage = lazy(() => import('../pages/professionals/join/page'));

const NaloxoneTrainingPage = lazy(() => import('../pages/naloxone-training/page'));
const SaferInjectionPage = lazy(() => import('../pages/safer-injection/page'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
  {
    path: '/training',
    element: <TrainingPage />,
  },
  {
    path: '/contact',
    element: <ContactPage />,
  },
  {
    path: '/volunteer',
    element: <VolunteerPage />,
  },
  {
    path: '/volunteers/login',
    lazy: async () => {
      const { default: Component } = await import('../pages/volunteers/login/page');
      return { Component };
    },
  },
  {
    path: '/volunteers/dashboard',
    lazy: async () => {
      const { default: Component } = await import('../pages/volunteers/dashboard/page');
      return { Component };
    },
  },
  {
    path: '/get-naloxone',
    element: <GetNaloxonePage />,
  },
  {
    path: '/resources',
    element: <ResourcesPage />,
  },
  {
    path: '/resources/harm-reduction-poster',
    element: <HarmReductionPosterPage />,
  },
  {
    path: '/resources/family-support-guide',
    element: <FamilySupportGuidePage />,
  },
  {
    path: '/peer-support',
    element: <PeerSupportPage />,
  },
  {
    path: '/safer-injection',
    element: <SaferInjectionPage />,
  },
  {
    path: '/shop',
    element: <ShopPage />,
  },
  {
    path: '/shop/:id',
    element: <ProductDetailPage />,
  },
  {
    path: '/checkout',
    element: <CheckoutPage />,
  },
  {
    path: '/thank-you',
    element: <ThankYouPage />,
  },
  {
    path: '/booking',
    element: <BookingCartPage />,
  },
  {
    path: '/manage-booking',
    element: <ManageBookingPage />,
  },
  {
    path: '/members/login',
    element: <MembersLoginPage />,
  },
  {
    path: '/members/register',
    element: <MembersLoginPage />,
  },
  {
    path: '/members/dashboard',
    element: (
      <ProtectedRoute allowedUserTypes={['member']}>
        <MembersDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/members/resources',
    element: (
      <ProtectedRoute allowedUserTypes={['member']}>
        <MembersResourcesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/members/elearning',
    element: (
      <ProtectedRoute allowedUserTypes={['member', 'volunteer']}>
        <MembersELearningPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/members/elearning/:courseId',
    element: (
      <ProtectedRoute allowedUserTypes={['member', 'volunteer']}>
        <MembersELearningCoursePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/news',
    element: <NewsPage />,
  },
  {
    path: '/news/:id',
    element: <NewsDetailPage />,
  },
  {
    path: '/partners',
    element: <PartnersPage />,
  },
  {
    path: '/emergency',
    element: <EmergencyPage />,
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute allowedUserTypes={['admin']}>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/professionals/login',
    element: <ProfessionalsLoginPage />,
  },
  {
    path: '/professionals/join',
    element: <ProfessionalsJoinPage />,
  },
  {
    path: '/professionals/dashboard',
    element: (
      <ProtectedRoute allowedUserTypes={['professional']}>
        <ProfessionalsDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/events',
    element: <EventsPage />,
  },
  {
    path: '/faq',
    element: <FAQPage />,
  },
  {
    path: '/naloxone-training',
    element: <NaloxoneTrainingPage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;