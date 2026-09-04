import PublicNavbar from "../../components/common/PublicNavbar";
import Footer from "../../components/common/Footer";
export default function Contact() {
  return (
    <>
      <PublicNavbar />
      <main className="public-page">
        <div className="container">
          <div className="page-hero">
            <h1>Contact</h1>
            <p>
              Questions about the alumni network? We would be happy to help.
            </p>
          </div>
          <div className="card border-0 shadow-sm p-4 mx-auto contact-card">
            <p>
              <i className="bi bi-envelope text-primary me-3" />
              alumni@school.example
            </p>
            <p>
              <i className="bi bi-telephone text-primary me-3" />
              School alumni office
            </p>
            <p className="mb-0">
              <i className="bi bi-geo-alt text-primary me-3" />
              Alumni Relations Department
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
