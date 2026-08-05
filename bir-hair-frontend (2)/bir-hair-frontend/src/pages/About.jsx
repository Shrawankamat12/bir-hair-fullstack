import PageHeader from '../components/PageHeader';
import PhotoBlock from '../components/PhotoBlock';
import Reveal from '../components/Reveal';
import storyPhoto from '../assets/photos/factory-history.jpg';

const timeline = [
  { year: '2014', title: 'Founded in Kirti Nagar', desc: 'B.I.R Hair India Factory began as a small sorting unit serving local salons across Delhi.' },
  { year: '2017', title: 'First Export Shipment', desc: 'Our first international container shipped to a distributor in the United States.' },
  { year: '2019', title: '100+ Team Members', desc: 'In-house wefting and QC teams expanded to keep every stage of production under one roof.' },
  { year: '2022', title: 'Expanded to 40+ Countries', desc: 'Wholesale partnerships grew across Africa, Europe and the Middle East.' },
  { year: '2026', title: '200+ Artisans, 50+ Countries', desc: 'Today we manufacture, export and supply raw, remy and virgin hair worldwide.' },
];

export default function About() {
  return (
    <>
      <PageHeader crumbs={[{ label: 'About' }]} title="About B.I.R Hair India Factory" lede="Manufacturer, exporter and supplier of 100% human hair — built in Delhi, trusted worldwide." />

      <Reveal as="section" className="section">
        <div className="container story-grid">
          <PhotoBlock tone="brown" ratio="4/5" rounded={24} label="Est. 2014" sub="Kirti Nagar, Delhi" src={storyPhoto} alt="B.I.R Hair India Factory story" />
          <div className="story-copy">
            <span className="eyebrow">Our Story</span>
            <h2 className="section-title" style={{ marginBottom: 16 }}>A factory built on trust, not middlemen</h2>
            <p>Blessing Indian Remy Hair Exports Pvt. Ltd. was founded in 2014 out of a simple frustration: too much of the "Indian hair" sold worldwide passed through layers of resellers before it ever reached a real customer.</p>
            <p>We set out to manufacture, sort and export hair directly from our own factory floor in Kirti Nagar, Delhi — keeping every stage of production, from sourcing to packing, under one roof and one standard of quality.</p>
            <p>Today, a team of 200+ artisans hand-sorts, double-draws and wefts every bundle that leaves our facility, shipping to distributors, salons and stylists in more than 50 countries.</p>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section why-section">
        <div className="container stat-strip">
          <div><strong>2014</strong><span>Year Founded</span></div>
          <div><strong>200+</strong><span>Artisans</span></div>
          <div><strong>50+</strong><span>Export Countries</span></div>
          <div><strong>12 Yrs</strong><span>In Business</span></div>
        </div>
      </Reveal>

      <Reveal as="section" className="section">
        <div className="container">
          <div className="section-head center"><span className="eyebrow">Our Journey</span><h2 className="section-title">Timeline</h2></div>
          <div className="timeline">
            {timeline.map((t) => (
              <div className="timeline-item" key={t.year}>
                <span className="timeline-year">{t.year}</span>
                <div className="timeline-body"><h4>{t.title}</h4><p>{t.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section">
        <div className="container">
          <div className="founder-note">
            <PhotoBlock tone="gold" ratio="1/1" rounded={999} label="" />
            <div>
              <blockquote>"We never wanted to be the biggest supplier — just the one distributors trust to open every carton and find exactly what they ordered."</blockquote>
              <cite>— Founder, B.I.R Hair India Factory</cite>
            </div>
          </div>
        </div>
      </Reveal>
    </>
  );
}
