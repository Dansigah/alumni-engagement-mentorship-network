import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="public-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h5><i className="bi bi-mortarboard-fill me-2" />Past Pupils</h5>
          <p>Building meaningful connections between students and alumni.</p>
        </div>
        <div><h6>Explore</h6><Link to="/about">About</Link><Link to="/how-it-works">How it works</Link></div>
        <div><h6>Community</h6><Link to="/login">Member login</Link><Link to="/contact">Contact</Link></div>
      </div>
      <div className="container footer-bottom">� 2026 Past Pupils Alumni Engagement Network</div>
    </footer>
  );
}
