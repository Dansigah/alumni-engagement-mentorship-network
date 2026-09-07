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
            <div className="d-flex align-items-start gap-3 mb-3">
              <i className="bi bi-geo-alt text-primary" aria-hidden="true" />
              <div>
                <div className="fw-semibold">Address</div>
                <a className="text-break" href="https://www.google.com/maps/search/?api=1&query=Karadippokku%2C%20St.%20Teresa%20College%20Lane%2C%20Kilinochchi" target="_blank" rel="noreferrer">
                  Karadippokku, St. Teresa College Lane, Kilinochchi
                </a>
              </div>
            </div>
            <div className="d-flex align-items-start gap-3 mb-3">
              <i className="bi bi-telephone text-primary" aria-hidden="true" />
              <div>
                <div className="fw-semibold">Phone</div>
                <a href="tel:+94777227115">077 722 7115</a>
              </div>
            </div>
            <div className="d-flex align-items-start gap-3">
              <i className="bi bi-clock text-primary" aria-hidden="true" />
              <div>
                <div className="fw-semibold">Opening Hours</div>
                <div>8:00 AM – 5:00 PM</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
