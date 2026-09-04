import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import HowItWorks from "./pages/public/HowItWorks";
import Contact from "./pages/public/Contact";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import StudentLayout from "./layouts/StudentLayout";
import AlumniLayout from "./layouts/AlumniLayout";
import AdminLayout from "./layouts/AdminLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import MentorProfile from "./pages/student/MentorProfile";
import StudentProfile from "./pages/student/StudentProfile";
import Mentors from "./pages/student/Mentors";
import Recommendations from "./pages/student/Recommendations";
import MentorshipRequests from "./pages/shared/MentorshipRequests";
import Sessions from "./pages/shared/Sessions";
import Referrals from "./pages/shared/Referrals";
import Events from "./pages/shared/Events";
import Notifications from "./pages/shared/Notifications";
import AlumniDashboard from "./pages/alumni/AlumniDashboard";
import AlumniProfile from "./pages/alumni/AlumniProfile";
import AdminReports from "./pages/admin/AdminReports";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminAlumni from "./pages/admin/AdminAlumni";
import {
  AdminUsers,
  AdminStudents,
  AdminMentorships,
  AdminReferrals,
  AdminSessions,
} from "./pages/admin/AdminPages";
import { useAuth } from "./context/AuthContext";
function Root() {
  const { user } = useAuth();
  return user ? (
    <Navigate
      replace
      to={
        user.role === "ADMIN"
          ? "/admin/dashboard"
          : user.role === "ALUMNI"
            ? "/alumni/dashboard"
            : "/student/dashboard"
      }
    />
  ) : (
    <Home />
  );
}
function Unauthorized() {
  return (
    <main className="public-page text-center">
      <div className="container">
        <div className="card border-0 shadow-sm p-5 mx-auto contact-card">
          <i className="bi bi-shield-lock display-3 text-primary" />
          <h2 className="mt-3">Access Denied</h2>
          <p className="text-muted">
            You do not have permission to view this page.
          </p>
          <a className="btn btn-primary" href="/">
            Return Home
          </a>
        </div>
      </div>
    </main>
  );
}
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Root />} />
      <Route path="/about" element={<About />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="profile/edit" element={<StudentProfile />} />
        <Route path="mentors" element={<Mentors />} />
        <Route path="mentors/:id" element={<MentorProfile />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="mentorship-requests" element={<MentorshipRequests />} />
        <Route path="request-mentorship" element={<Mentors />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="referrals" element={<Referrals />} />
        <Route path="request-referral" element={<Referrals />} />
        <Route path="events" element={<Events />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>
      <Route path="/alumni" element={<AlumniLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AlumniDashboard />} />
        <Route path="profile" element={<AlumniProfile />} />
        <Route path="mentorships" element={<MentorshipRequests />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="referrals" element={<Referrals />} />
        <Route path="events" element={<Events />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="alumni" element={<AdminAlumni />} />
        <Route path="pending-alumni" element={<AdminAlumni pendingOnly />} />
        <Route path="mentorships" element={<AdminMentorships />} />
        <Route path="referrals" element={<AdminReferrals />} />
        <Route path="sessions" element={<AdminSessions />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
