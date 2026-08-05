import ProductCard from './ProductCard';
import Reveal from './Reveal';

export default function RecentlyViewed({ items, title = 'Recently Viewed', eyebrow = 'Pick Up Where You Left Off' }) {
  if (!items || items.length === 0) return null;
  return (
    <Reveal as="section" className="section section--tight-top">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="section-title">{title}</h2>
        </div>
        <div className="product-scroll">
          {items.slice(0, 8).map((p) => <ProductCard product={p} key={p.id} />)}
        </div>
      </div>
    </Reveal>
  );
}
