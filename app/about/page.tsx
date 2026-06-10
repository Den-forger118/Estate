import { SignatureNumber } from "../components/SignatureNumber";
import founderPhoto from "../assets/dr-ernest-ofori-sarpong.jpg";
import { estateImages } from "../data/images";
import { PageShell, SectionIntro } from "../components/SiteChrome";

const values = [
  {
    title: "Calm confidence",
    text: "We make every viewing, handover, and service request feel organized and respectful.",
    image: estateImages.keysHandover,
    alt: "Keys handover during a property viewing",
  },
  {
    title: "Long-term stewardship",
    text: "We manage homes, shared infrastructure, and landscapes with a preservation mindset.",
    image: estateImages.gardenWalkway,
    alt: "Landscaped estate walkways and green space",
  },
  {
    title: "Transparent service",
    text: "Owners and residents receive clear communication, honest timelines, and practical support.",
    image: estateImages.briefing,
    alt: "Estate team briefing with a resident",
  },
] as const;

export default function AboutPage() {
  return (
    <PageShell>
      <section className="page-hero signature-anchor">
        <SignatureNumber number="01" />
        <div className="page-hero-inner">
          <div className="stack">
            <span className="eyebrow">About Special Gardens</span>
            <h1>An estate vision shaped by Ernest Ofori Sarpong.</h1>
          </div>
          <p>
            Special Gardens is a gated residential community in Accra built around disciplined management,
            landscaped green space, and the quiet confidence families expect from premium estate living.
          </p>
        </div>
      </section>

      <section className="section split-section about-founder-section">
        <div className="about-founder-portrait">
          <img
            src={founderPhoto.src}
            alt="Dr. Ernest Ofori Sarpong, founder of Special Gardens"
            width={founderPhoto.width}
            height={founderPhoto.height}
            loading="eager"
            decoding="async"
            className="about-founder-portrait-image"
          />
        </div>
        <div className="stack">
          <span className="eyebrow">Founder</span>
          <h2>Ernest Ofori Sarpong</h2>
          <p>
            Ernest Ofori Sarpong established Special Gardens with a clear conviction: a residential estate
            should feel secure, well-kept, and genuinely welcoming — not merely enclosed behind a gate.
            His work has focused on creating communities where architecture, landscaping, and daily
            operations work together.
          </p>
          <p>
            From the earliest planning stages, Ernest has emphasised long-term stewardship — roads that
            stay maintained, common areas that stay presentable, and management processes that owners and
            residents can rely on year after year.
          </p>
          <p className="about-founder-role meta">Founder &amp; Principal · Special Gardens</p>
        </div>
      </section>

      <section className="section split-section about-estate-section">
        <div className="stack">
          <span className="eyebrow">The estate</span>
          <h2>Special Gardens — a managed community built to last.</h2>
          <p>
            Special Gardens brings together detached villas, townhomes, and apartment residences within a
            carefully planned precinct. Gated access, landscaped roads, family parks, and a resident lounge
            are supported by on-site maintenance and security coordination — so daily life stays simple.
          </p>
          <p>
            Whether you are purchasing a home, leasing a residence, or seeking management support for your
            property, the estate operates as one integrated community: one team, one standard, and one
            commitment to quiet refinement.
          </p>
        </div>
        <div className="image-panel">
          <img src={estateImages.gardenWalkway} alt="Landscaped walkways at Special Gardens estate" />
        </div>
      </section>

      <section className="section">
        <SectionIntro
          eyebrow="Mission and vision"
          title="Better homes, better-managed communities"
          text="Our mission is to protect property value while creating calm, welcoming estate environments that residents are proud to call home."
        />
        <div className="value-grid">
          {values.map((value) => (
            <article className="value-card value-image-card card-interactive" key={value.title}>
              <div className="value-card-media">
                <img src={value.image} alt={value.alt} loading="lazy" decoding="async" />
              </div>
              <div className="value-card-body">
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="stat-grid">
          <div className="stat-card card-interactive">
            <strong className="font-data-lg">14+</strong>
            <span>years shaping Special Gardens</span>
          </div>
          <div className="stat-card card-interactive">
            <strong className="font-data-lg">1,250</strong>
            <span>resident requests resolved yearly</span>
          </div>
          <div className="stat-card card-interactive">
            <strong className="font-data-lg">24/7</strong>
            <span>security coordination support</span>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
