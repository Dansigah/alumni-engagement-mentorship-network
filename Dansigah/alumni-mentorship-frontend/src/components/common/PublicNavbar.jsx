import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

export default function PublicNavbar({ brandName = "Past Pupils", brandSubtitle = "Alumni & Mentorship Network" }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <nav className="navbar navbar-expand-lg public-navbar sticky-top" aria-label="Public navigation">
      <div className="container">
        <Link className="navbar-brand" to="/" onClick={close}>
          <span className="brand-mark"><i className="bi bi-mortarboard-fill" /></span>
          <span>{brandName}<small>{brandSubtitle}</small></span>
        </Link>
        <button className="navbar-toggler" type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span className="navbar-toggler-icon" />
        </button>
        <div className={`collapse navbar-collapse ${open ? "show" : ""}`}>
          <div className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            {[["/", "Home"], ["/about", "About"], ["/how-it-works", "How It Works"], ["/contact", "Contact"]].map(([to, label]) => (
              <NavLink className="nav-link" key={to} to={to} onClick={close}>{label}</NavLink>
            ))}
            <Link className="btn btn-outline-primary ms-lg-2" to="/login" onClick={close}>Login</Link>
            <Link className="btn btn-primary" to="/register" onClick={close}>Join the Network</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
