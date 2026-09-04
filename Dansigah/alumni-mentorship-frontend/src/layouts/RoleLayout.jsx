import { useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import { useAuth } from "../context/AuthContext";

export default function RoleLayout({ role, links }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/unauthorized" replace />;

  const rolePath = user.role.toLowerCase();
  return (
    <div className="dashboard-shell">
      {menuOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <Sidebar links={links} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <button className="mobile-menu-button" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><i className="bi bi-list" /></button>
          <div className="topbar-context"><span>Alumni Engagement Network</span><strong>{role.charAt(0) + role.slice(1).toLowerCase()} Portal</strong></div>
          <div className="profile-menu-wrap">
            <button className="profile-menu" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen}>
              <span className="avatar avatar-sm">{user.name?.charAt(0)}</span>
              <span className="profile-menu-copy"><strong>{user.name}</strong><small>{user.role}</small></span>
              <i className="bi bi-chevron-down" />
            </button>
            {profileOpen && (
              <div className="profile-popover">
                {role !== "ADMIN" && <button onClick={() => navigate(`/${rolePath}/profile`)}><i className="bi bi-person" />My profile</button>}
                <button onClick={() => navigate(`/${rolePath}/notifications`)}><i className="bi bi-bell" />Notifications</button>
                <button onClick={() => { logout(); navigate("/login"); }}><i className="bi bi-box-arrow-right" />Logout</button>
              </div>
            )}
          </div>
        </header>
        <div className="dashboard-content"><Outlet /></div>
      </main>
    </div>
  );
}
