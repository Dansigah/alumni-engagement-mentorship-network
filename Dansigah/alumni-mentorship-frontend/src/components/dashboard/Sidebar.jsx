import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ links, open, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className={`dashboard-sidebar ${open ? "is-open" : ""}`} aria-label="Dashboard navigation">
      <div className="sidebar-brand-row">
        <div className="brand"><i className="bi bi-mortarboard-fill me-2" />Past Pupils</div>
        <button className="sidebar-close" onClick={onClose} aria-label="Close menu"><i className="bi bi-x-lg" /></button>
      </div>
      <p className="sidebar-caption">Alumni Engagement Network</p>
      <nav>
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} onClick={onClose}>
            <i className={`bi ${link.icon} me-3`} />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <button className="logout-link" onClick={signOut}>
        <i className="bi bi-box-arrow-right me-3" />Logout
      </button>
    </aside>
  );
}
