import PageHeader from '../components/PageHeader';
import PhotoBlock from '../components/PhotoBlock';
import Reveal from '../components/Reveal';
import { processSteps, certifications, exportCountries } from '../data/content';
import factorySorting from '../assets/photos/factory-sorting.jpg';
import factoryWefting from '../assets/photos/factory-wefting.jpg';
import factoryQc from '../assets/photos/factory-qc.jpg';
import factoryPacking from '../assets/photos/factory-packing.jpg';
import factoryStorage from '../assets/photos/factory-storage.jpg';
import factoryExport from '../assets/photos/factory-export.jpg';
import wigShelf from '../assets/photos/wig-shelf.jpg';
import './Content.css';

const factoryGallery = [
  { label: 'Sourcing Intake', img: factoryStorage },
  { label: 'Hand-Sorting Floor', img: factorySorting },
  { label: 'Double-Drawing', img: wigShelf },
  { label: 'Wefting Studio', img: factoryWefting },
  { label: 'QC Inspection Bay', img: factoryQc },
  { label: 'Export Packing Line', img: factoryPacking, alt2: factoryExport },
];

export default function Factory() {
  return (
    <>
      <PageHeader crumbs={[{ label: 'Factory' }]} title="Factory &amp; Manufacturing" lede="A transparent look at how raw hair becomes a finished, export-ready bundle." />

      <Reveal as="section" className="section">
        <div className="container">
          <div className="section-head"><span className="eyebrow">From Source to Shipment</span><h2 className="section-title">Our Manufacturing Process</h2></div>
          <div className="process-row">
            {processSteps.map((s, i) => (
              <div className="process-step" key={s.step}>
                <span className="process-num">{String(i + 1).padStart(2, '0')}</span>
                <h4>{s.step}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section factory-gallery-section">
        <div className="container">
          <div className="section-head"><span className="eyebrow">Kirti Nagar, Delhi</span><h2 className="section-title">Factory Tour Gallery</h2></div>
          <div className="gallery-grid">
            {factoryGallery.map((g, i) => (
              <PhotoBlock key={g.label} tone={['espresso','brown','gold','beige','cream','brown'][i]} ratio="4/3" rounded={16} label={g.label} src={g.img} alt={g.label} />
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section">
        <div className="container">
          <div className="section-head center"><span className="eyebrow">Trust &amp; Compliance</span><h2 className="section-title">Quality &amp; Certifications</h2></div>
          <div className="cert-row">
            {certifications.map((c) => <div className="cert-pill glass" key={c}>{c}</div>)}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section why-section">
        <div className="container">
          <div className="section-head center"><span className="eyebrow">Worldwide Shipping</span><h2 className="section-title">Export Countries</h2></div>
          <div className="export-countries">
            {exportCountries.map((c) => <span className="export-chip" key={c}>{c}</span>)}
            <span className="export-chip more">+ 38 more</span>
          </div>
        </div>
      </Reveal>
    </>
  );
}
