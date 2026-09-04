import PublicNavbar from "../../components/common/PublicNavbar";
import Footer from "../../components/common/Footer";
export default function HowItWorks() {
  return (
    <>
      <PublicNavbar />
      <main className="public-page">
        <div className="container">
          <div className="page-hero">
            <h1>How It Works</h1>
            <p>Start building valuable connections in three simple steps.</p>
          </div>
          <div className="row g-4">
            {[
              ["1", "Create your account", "Register as a student or alumnus."],
              [
                "2",
                "Find the right connection",
                "Browse real alumni and send a mentorship or referral request.",
              ],
              [
                "3",
                "Grow together",
                "Manage requests, sessions, events and notifications in one dashboard.",
              ],
            ].map((x) => (
              <div className="col-md-4" key={x[0]}>
                <div className="card border-0 shadow-sm h-100 p-4">
                  <span className="step-number">{x[0]}</span>
                  <h4>{x[1]}</h4>
                  <p className="text-muted">{x[2]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
