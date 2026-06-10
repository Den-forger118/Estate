import { MapEmbed } from "../components/MapEmbed";
import { ContactForm } from "../components/forms/ContactForm";
import { PageShell } from "../components/SiteChrome";
import { brand } from "../data/site";

export default function ContactPage() {
  return (
    <PageShell>
      <section className="page-hero">
        <div className="page-hero-inner">
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
        <ContactForm />

        <aside className="detail-side">
          <div className="contact-card">
            <h3>Office location</h3>
            <p>{brand.address}</p>
            <a href={`tel:${brand.phone}`} className="font-data-md">{brand.phone}</a>
            <a href={`mailto:${brand.email}`}>{brand.email}</a>
            <a className="btn btn-secondary" href={`https://wa.me/${brand.whatsapp.replace(/\D/g, "")}`}>WhatsApp Management</a>
          </div>
          <div className="contact-card">
            <h3>Working hours</h3>
            <p>Monday to Friday: 8:30 AM - 6:00 PM</p>
            <p>Saturday inspections: 10:00 AM - 3:00 PM</p>
          </div>
          <MapEmbed
            lat={brand.officeCoordinates.lat}
            lng={brand.officeCoordinates.lng}
            label={brand.address}
            variant="sidebar"
            zoom={16}
          />
        </aside>
      </section>
    </PageShell>
  );
}
