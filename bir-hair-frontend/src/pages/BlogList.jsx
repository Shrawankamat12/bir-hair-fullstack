import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import PhotoBlock from '../components/PhotoBlock';
import Reveal from '../components/Reveal';
import { ProductGridSkeleton } from '../components/Skeletons';
import { ErrorState, EmptyState } from '../components/StateBlocks';
import { useBlogs } from '../hooks/useStoreData';
import './Content.css';

const cats = ['All', 'Hair Care', 'Education', 'Wholesale', 'Company'];

export default function BlogList() {
  const [cat, setCat] = useState('All');
  const { blogs, loading, error, refetch } = useBlogs(cat === 'All' ? undefined : cat);

  return (
    <>
      <PageHeader crumbs={[{ label: 'Journal' }]} title="The Journal" lede="Hair care guides, wholesale advice and stories from our Delhi factory floor." />
      <div className="section">
        <div className="container">
          <div className="facc-chip-row" style={{ marginBottom: 32 }}>
            {cats.map((c) => (
              <button key={c} className={`facc-chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>

          {loading ? (
            <ProductGridSkeleton count={6} />
          ) : error ? (
            <ErrorState message="Could not load the journal right now." onRetry={refetch} />
          ) : blogs.length === 0 ? (
            <EmptyState title="No posts in this category yet." />
          ) : (
            <div className="blog-row" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
              {blogs.map((b) => (
                <Reveal key={b.id} as={Link} className="blog-card card" to={`/journal/${b.id}`}>
                  <PhotoBlock tone="beige" ratio="16/10" rounded={0} label={b.cat} src={b.img} alt={b.title} />
                  <div className="blog-card-body">
                    <span className="eyebrow">{b.date}</span>
                    <h4>{b.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(74,44,42,0.6)', marginTop: 8 }}>{b.excerpt}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
