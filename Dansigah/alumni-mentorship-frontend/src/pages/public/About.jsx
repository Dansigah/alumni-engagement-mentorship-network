import PublicNavbar from "../../components/common/PublicNavbar";
import Footer from "../../components/common/Footer";
export default function About() {
  return (
    <>
      <PublicNavbar />
      <main className="public-page">
        <div className="container">
          <div className="page-hero">
            <h1>About Our Network</h1>
            <p>
              We make alumni experience accessible to the next generation of
              students.
            </p>
          </div>
          <div className="row g-4">
            <div className="col-lg-7">
              <div className="card border-0 shadow-sm p-4">
                <h3>Our purpose</h3>
                <p className="text-muted">
                  Past Pupils Engagement creates a secure space for mentoring,
                  career guidance, referrals and lifelong school connections.
                </p>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="card border-0 shadow-sm p-4 bg-primary text-white">
                <h3>Built for community</h3>
                <p>
                  Simple tools help students ask for support and alumni give
                  back meaningfully.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
