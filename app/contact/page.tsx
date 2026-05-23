import { PageShell } from "../components/SiteChrome";
import { brand } from "../data/site";

export default function ContactPage() {
  return (
    <PageShell>
      <section className="page-hero">
        <div className="page-hero-inner reveal">
          <div className="stack">
            <span className="eyebrow">Contact</span>
            <h1>Book an inspection or contact estate management.</h1>
          </div>
          <p>
            Tell us what you are looking for and our team will respond with availability, inspection times, and next steps.
          </p>
        </div>
      </section>

      <section className="section contact-layout">
        <form className="form-card reveal">
          <h2>Send an enquiry</h2>
          <div className="form-grid two">
            <label>First name<input placeholder="Avery" /></label>
            <label>Last name<input placeholder="Morgan" /></label>
          </div>
          <label>Email<input type="email" placeholder="avery@example.com" /></label>
          <label>Phone<input placeholder="+1 (555) 000-0000" /></label>
          <label>Message<textarea rows={5} placeholder="I would like to book an inspection for..." /></label>
          <button className="btn btn-primary" type="button">Submit Enquiry</button>
        </form>

        <aside className="detail-side">
          <div className="contact-card reveal">
            <h3>Office location</h3>
            <p>{brand.address}</p>
            <a href={`tel:${brand.phone}`}>{brand.phone}</a>
            <a href={`mailto:${brand.email}`}>{brand.email}</a>
            <a className="btn btn-secondary" href={`https://wa.me/${brand.whatsapp.replace(/\D/g, "")}`}>WhatsApp Management</a>
          </div>
          <div className="contact-card reveal">
            <h3>Working hours</h3>
            <p>Monday to Friday: 8:30 AM - 6:00 PM</p>
            <p>Saturday inspections: 10:00 AM - 3:00 PM</p>
          </div>
          <div className="map-placeholder reveal">Google Maps embed placeholder</div>
        </aside>
      </section>
    </PageShell>
  );
}
