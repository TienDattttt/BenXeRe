import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Root from "./components/layouts/root";
import FlashScreen from "./components/loader";
import Protected from "./components/layouts/protected";
import "./index.css";

/* Lazy load pages */
const ErrorPage = lazy(() => import("./pages/error"));
const IndexPage = lazy(() => import("./pages/index"));
const OAuthCallback = lazy(() => import("./components/auth/oauth-callback"));
const BusAnimationDemo = lazy(() => import("./pages/bus-animation-demo"));
const RoutesPage = lazy(() => import("./pages/routes"));
const AuthPage = lazy(() => import("./pages/auth"));
// Forgot Password flow
const ForgotPasswordPage = lazy(() => import("./pages/auth/components/ForgotPassword"));
const OTPVerificationPage = lazy(() => import("./pages/auth/components/OTPVerification"));
const ResetPasswordPage = lazy(() => import("./pages/auth/components/ResetPassword"));
const BookingPage = lazy(() => import("./pages/booking"));
const BookingResultPage = lazy(() => import("./pages/booking-result"));
const RegisterBusPage = lazy(() => import("./pages/register-bus"));
const SchedulesPage = lazy(() => import("./pages/schedules"));
const MyOrdersPage = lazy(() => import("./pages/account/orders"));
const ReviewPage = lazy(() => import("./pages/account/review"));
const InformationPage = lazy(() => import("./pages/account/information"));
const BookingConfirm = lazy(() => import('./pages/booking/confirm'));
const VNPayCallbackHandler = lazy(() => import("./components/payment/VNPayCallbackHandler"));

/* Bus Owner Pages */
const BusOwnerDashboardPage = lazy(() => import("./pages/bus-owner/dashboard"));
const BusOwnerManagementPage = lazy(() => import("./pages/bus-owner/schedules-management"));
const AddBusPage = lazy(() => import("./pages/bus-owner/add-bus"));
const BusOwnerEmployeesPage = lazy(() => import("./pages/bus-owner/employee-management"));
const EditEmployeeAccountPage = lazy(() => import("./pages/bus-owner/account-edit"));
const ScheduleDetailPage = lazy(() => import("./pages/bus-owner/schedule-detail"));
const LoadingAnimation = lazy(() => import("./components/loading-animation"));
const BusOwnerReviewManagementPage = lazy(() => import("./pages/bus-owner/review-management"));
const BusOwnerStatisticsPage = lazy(() => import("./pages/bus-owner/StatisticsPage"));
const BusOwnerBusManagementPage = lazy(() => import("./pages/bus-owner/bus-management"));
/* Admin Pages */
const AdminDashboardPage = lazy(() => import("./pages/admin/Users"));
const AdminRoutesPage = lazy(() => import("./pages/admin/Routes"));
const AdminSchedulesPage = lazy(() => import("./pages/admin/Schedules"));
const AdminBusesPage = lazy(() => import("./pages/admin/Buses"));
const AdminSeatsPage = lazy(() => import("./pages/admin/Seats"));
const AdminUsersPage = lazy(() => import("./pages/admin/Users"));
const AdminCouponsPage = lazy(() => import("./pages/admin/Coupons"));
const AdminBannersPage = lazy(() => import("./pages/admin/Banners"));
const AdminFlashSalesPage = lazy(() => import("./pages/admin/FlashSales"));
const AdminBookingsPage = lazy(() => import("./pages/admin/Bookings"));

/* Customer Care Pages */
const CustomerCareSchedulesPage = lazy(() => import("./pages/customer-care/schedules"));

/* Pages without Header/Footer */
const ROUTES_WITHOUT_HEADER_FOOTER = [
  "/auth/forgot-password",
  "/auth/otp-verification",
  "/auth/reset-password"
];

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root routesWithoutHeaderFooter={ROUTES_WITHOUT_HEADER_FOOTER} />,
    errorElement: <ErrorPage />,
    children: [
      /* Public routes */
      { path: "/", element: <IndexPage /> },
      { path: "/oauth2/redirect", element: <OAuthCallback /> },
      { path: "/bus-animation", element: <BusAnimationDemo /> },
      { path: "/routes", element: <RoutesPage /> },
      { path: "/auth", element: <AuthPage /> },
      
      /* Forgot Password flow */
      { path: "/auth/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/auth/otp-verification", element: <OTPVerificationPage /> },
      { path: "/auth/reset-password", element: <ResetPasswordPage /> },
      
      { path: "/register-bus", element: <RegisterBusPage /> },
      { path: "/schedules", element: <SchedulesPage /> },
      { path: "/booking", element: <BookingPage /> },
      { path: "/booking-result", element: <BookingResultPage /> },
      { path: "/booking/confirm", element: <BookingConfirm /> },
      { path: "/loading", element: <LoadingAnimation /> },
      
      /* Payment callback handlers */
      { path: "/payment-callback/vnpay", element: <VNPayCallbackHandler /> },
      { path: "/payment/return/vnpay", element: <VNPayCallbackHandler /> },

      { 
        path: "/account/reviews", 
        element: <Protected allowedRoles={['customer', 'bus_owner']}><ReviewPage /></Protected> 
      },
      { 
        path: "/account/orders", 
        element: <Protected allowedRoles={['customer', 'bus_owner']}><MyOrdersPage /></Protected> 
      },
      { 
        path: "/account/information", 
        element: <Protected allowedRoles={['customer', 'bus_owner']}><InformationPage /></Protected> 
      },

      { 
        path: "/bus-owner/dashboard", 
        element: <Protected allowedRoles={['bus_owner']}><BusOwnerDashboardPage /></Protected> 
      },
      { 
        path: "/bus-owner/schedules", 
        element: <Protected allowedRoles={['bus_owner']}><BusOwnerManagementPage /></Protected> 
      },
      { 
        path: "/bus-owner/buses", 
        element: <Protected allowedRoles={['bus_owner']}><BusOwnerBusManagementPage /></Protected> 
      },
      { 
        path: "/bus-owner/buses/add", 
        element: <Protected allowedRoles={['bus_owner']}><AddBusPage /></Protected> 
      },
      { 
        path: "/bus-owner/employees", 
        element: <Protected allowedRoles={['bus_owner']}><BusOwnerEmployeesPage /></Protected> 
      },
      { 
        path: "/bus-owner/schedules", 
        element: <Protected allowedRoles={['bus_owner']}><ScheduleDetailPage /></Protected> 
      },
      { 
        path: "/bus-owner/schedule-detail", 
        element: <Protected allowedRoles={['bus_owner']}><ScheduleDetailPage /></Protected> 
      },
      { 
        path: "/bus-owner/employees/edit", 
        element: <Protected allowedRoles={['bus_owner']}><EditEmployeeAccountPage /></Protected> 
      },
      { 
        path: "/bus-owner/reviews", 
        element: <Protected allowedRoles={['bus_owner']}><BusOwnerReviewManagementPage /></Protected> 
      },
      {
        path: "/bus-owner/statistics",
        element: <Protected allowedRoles={['bus_owner']}><BusOwnerStatisticsPage /></Protected>
      },

      { 
        path: "/admin/dashboard", 
        element: <Protected allowedRoles={['admin']}><AdminDashboardPage /></Protected> 
      },
      { 
        path: "/admin/routes", 
        element: <Protected allowedRoles={['admin']}><AdminRoutesPage /></Protected> 
      },
      { 
        path: "/admin/schedules", 
        element: <Protected allowedRoles={['admin']}><AdminSchedulesPage /></Protected> 
      },
      { 
        path: "/admin/buses", 
        element: <Protected allowedRoles={['admin']}><AdminBusesPage /></Protected> 
      },
      { 
        path: "/admin/seats", 
        element: <Protected allowedRoles={['admin']}><AdminSeatsPage /></Protected> 
      },
      { 
        path: "/admin/users", 
        element: <Protected allowedRoles={['admin']}><AdminUsersPage /></Protected> 
      },
      { 
        path: "/admin/coupons", 
        element: <Protected allowedRoles={['admin']}><AdminCouponsPage /></Protected> 
      },
      { 
        path: "/admin/banners", 
        element: <Protected allowedRoles={['admin']}><AdminBannersPage /></Protected> 
      },
      { 
        path: "/admin/flash-sales", 
        element: <Protected allowedRoles={['admin']}><AdminFlashSalesPage /></Protected> 
      },
      { 
        path: "/admin/bookings", 
        element: <Protected allowedRoles={['admin']}><AdminBookingsPage /></Protected> 
      },

      
      { 
        path: "/customer-care/schedules", 
        element: <Protected allowedRoles={['customer_care']}><CustomerCareSchedulesPage /></Protected>
      },
    ],
  },
]);

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <Suspense fallback={<FlashScreen />}>
      <RouterProvider router={router} />
    </Suspense>
  </StrictMode>
);