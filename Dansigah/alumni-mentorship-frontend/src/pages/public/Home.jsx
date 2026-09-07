import { Link } from "react-router-dom";
import PublicNavbar from "../../components/common/PublicNavbar";
import Footer from "../../components/common/Footer";
import "./Home.css";
export default function Home() {
  return (
    <div className="home-landing">
      <PublicNavbar brandName="Past Pupils" brandSubtitle="Alumni & Mentorship Network" />
      <section className="hero">
        <div className="container">
          <div className="row align-items-center min-vh-75">
            <div className="col-lg-6">
              <span className="hero-kicker">Connect • Learn • Grow</span>
              <h1 className="display-4 fw-bold mt-3">
                Where students and alumni build the future together.
              </h1>
              <p className="lead text-muted my-4">
                Find trusted mentors, explore career opportunities, join events,
                and stay connected with your school community.
              </p>
              <div className="d-flex gap-3">
                <Link className="btn btn-primary btn-lg" to="/register">
                  Join the Network
                </Link>
                <Link
                  className="btn btn-outline-primary btn-lg"
                  to="/how-it-works"
                >
                  How It Works
                </Link>
              </div>
            </div>
            <div className="col-lg-6 mt-5 mt-lg-0">
              <img
                src="/donbasco.png"
                alt="Don Bosco Infotech"
                className="home-hero-image"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="home-features">
        <div className="container">
          <div className="row g-0">
            {[
              ["bi-people", "Connect", "Join a growing network of students and alumni."],
              ["bi-book", "Learn", "Gain insights and guidance from experienced mentors."],
              ["bi-bar-chart", "Grow", "Explore opportunities for your future."],
              ["bi-calendar-event", "Stay Engaged", "Participate in events and activities."],
            ].map(([icon, title, description]) => (
              <div className="col-sm-6 col-lg-3 home-feature" key={title}>
                <i className={`bi ${icon}`} aria-hidden="true" />
                <h4>{title}</h4>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer showCommunity={false} />
    </div>
  );
}
