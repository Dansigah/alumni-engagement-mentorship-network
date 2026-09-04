import { Link } from "react-router-dom";
import PublicNavbar from "../../components/common/PublicNavbar";
import Footer from "../../components/common/Footer";
export default function Home() {
  return (
    <>
      <PublicNavbar />
      <section className="hero">
        <div className="container">
          <div className="row align-items-center min-vh-75">
            <div className="col-lg-7">
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
            <div className="col-lg-5 mt-5 mt-lg-0">
              <div className="hero-visual">
                <i className="bi bi-people-fill" />
                <h3>One connected community</h3>
                <p>
                  Students, alumni, mentors and administrators working together.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Everything you need to grow</h2>
            <p className="text-muted">
              Meaningful support at every step of your journey.
            </p>
          </div>
          <div className="row g-4">
            {[
              [
                "bi-person-heart",
                "Find a Mentor",
                "Connect with alumni who can guide your academic and career journey.",
              ],
              [
                "bi-briefcase",
                "Career Referrals",
                "Request professional referrals through trusted alumni connections.",
              ],
              [
                "bi-calendar-event",
                "Community Events",
                "Discover workshops, reunions and networking opportunities.",
              ],
            ].map((x) => (
              <div className="col-md-4" key={x[1]}>
                <div className="card border-0 shadow-sm h-100 p-4 text-center feature-card">
                  <i className={`bi ${x[0]}`} />
                  <h4>{x[1]}</h4>
                  <p className="text-muted">{x[2]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
