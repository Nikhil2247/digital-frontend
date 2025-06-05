// App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Pages
import LoginPage from "./pages/LoginPage";
import EventList from "./pages/EventList";
import EventForm from "./pages/EventForm";
import Orders from "./pages/Orders";
import Tables from "./pages/Tables";
import EventPage from "./pages/EventPage";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import UserScanPage from "./pages/UserScanner";
import UnauthorizedPage from "./pages/UnauthorizedPage"; // Import UnauthorizedPage

// Auth & Route Handling
import { AuthProvider, useAuth } from "./context/AuthContext";
import HomePageRouter from "./pages/HomePageRouter"; // Import HomePageRouter
import SignupPage from "./pages/SignupPage";
import EventOrderPage from "./pages/EventOrderPage";
import Navbar from "./components/Navbar";
import UserRoleManagement from "./components/UserRoleManagement";

// --- Enhanced PrivateRoute ---
function PrivateRoute({ children, roles }) {
  // roles is an array of allowed role strings
  const { token, userData, logout } = useAuth(); // Assuming logout is available for critical errors

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists, userData should ideally be loaded by AuthContext.
  // If AuthContext is still initializing userData (e.g., async fetch after token found),
  // you might want a loading indicator here. For simplicity, assuming userData is readily available.
  if (!userData || !userData.role) {
    // This means user is authenticated (has token) but role is unknown or missing.
    // This could be a state during initial load if userData is fetched async, or data corruption.
    if (roles && roles.length > 0) {
      // Only if this route *requires* specific roles
      console.warn(
        "PrivateRoute: User authenticated but role unknown. Required roles:",
        roles
      );
      // Optional: For critical role-missing scenarios, you might auto-logout.
      // logout();
      return (
        <Navigate
          to="/unauthorized"
          state={{ message: "User role not found." }}
          replace
        />
      );
    }
    // If no specific roles are required for this route, but role is missing, let them pass
    // or redirect to a generic page. For now, let them pass if no roles defined for the route.
  }

  // If specific roles are required for this route
  if (roles && roles.length > 0) {
    const userRole = userData?.role?.toUpperCase();
    if (userRole && roles.map((r) => r.toUpperCase()).includes(userRole)) {
      return children; // User has the token and their role is in the allowed list
    } else {
      // User has the token, but their role is NOT in the allowed list or role is missing
      return (
        <Navigate
          to="/unauthorized"
          state={{ message: `Requires one of roles: ${roles.join(", ")}` }}
          replace
        />
      );
    }
  }

  // If no 'roles' prop is passed (or roles array is empty),
  // it means the route only requires authentication, not a specific role.
  return children;
}
// --- End of PrivateRoute ---

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/tables" element={<Tables />} /> {/* Assuming public */}
          <Route
            path="/event/:eventId/table/:tableNumber"
            element={<EventPage />}
          />{" "}
          {/* Assuming public */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          {/* Authenticated Routes - Root path handled by HomePageRouter */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                {" "}
                {/* Ensures user is logged in */}
                <HomePageRouter />{" "}
                {/* Handles role-based redirection from root */}
              </PrivateRoute>
            }
          />
          {/* Role-Specific Dashboards & Pages */}
          <Route
            path="/admin"
            element={
              <PrivateRoute roles={["ADMIN"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/roles"
            element={
              <PrivateRoute roles={["ADMIN"]}>
                <UserRoleManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/manager"
            element={
              <PrivateRoute roles={["MANAGER"]}>
                <ManagerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/vendor"
            element={
              <PrivateRoute roles={["VENDOR"]}>
                <VendorDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/order/:eventId"
            element={
              <PrivateRoute roles={["VENDOR"]}>
                <EventOrderPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/scan"
            element={
              // Assuming 'MANAGER' or 'ADMIN' can scan. Adjust roles as needed.
              <PrivateRoute roles={["ADMIN", "MANAGER"]}>
                <UserScanPage />
              </PrivateRoute>
            }
          />
          {/* General Authenticated Routes (any logged-in user or specific roles) */}
          <Route
            path="/events"
            element={
              // Any authenticated user can view events
              <PrivateRoute>
                <EventList />
              </PrivateRoute>
            }
          />
          <Route
            path="/events/new"
            element={
              // Example: Only Admin or Manager can create new events
              <PrivateRoute roles={["ADMIN", "MANAGER"]}>
                <EventForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/events/:id/edit"
            element={
              // Example: Only Admin or Manager can edit events
              <PrivateRoute roles={["ADMIN", "MANAGER"]}>
                <EventForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              // Any authenticated user can view their orders
              <PrivateRoute>
                <Orders />
              </PrivateRoute>
            }
          />
          {/* Fallback for any other authenticated route or a 404 for authenticated users */}
          {/* <Route path="*" element={<PrivateRoute><NotFoundPageForLoggedInUsers /></PrivateRoute>} /> */}
          {/* Or a general catch-all 404 if not handled by specific routes */}
          <Route path="*" element={<Navigate to="/" replace />} />{" "}
          {/* Or a proper 404 page */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}
