import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { LineSkeleton } from '../components/Skeletons';
import { ErrorState } from '../components/StateBlocks';
import { useFaqs } from '../hooks/useStoreData';
import './Content.css';

const cats = ['All', 'Shipping', 'Returns', 'Hair Care', 'Bulk / Export'];

export default function FAQ() {
  const [cat, setCat] = useState('All');
  const [openId, setOpenId] = useState(0);
  const { faqs, loading, error, refetch } = useFaqs();

  const grouped = cats.slice(1).map((c) => ({
    cat: c,
    items: faqs.filter((f) => f.cat === c),
  })).filter((g) => cat === 'All' || g.cat === cat);

  return (
    <>
      <PageHeader crumbs={[{ label: 'FAQ' }]} title="Frequently Asked Questions" lede="Shipping, returns, hair care and bulk/export — answered." />
      <div className="section">
        <div className="container faq-layout">
          <div className="faq-cat-list">
            {cats.map((c) => (
              <button key={c} className={cat === c ? 'active' : ''} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          <div>
            {loading ? (
              <LineSkeleton width="100%" height={200} />
            ) : error ? (
              <ErrorState message="Could not load FAQs right now." onRetry={refetch} />
            ) : (
              grouped.map((g) => g.items.length > 0 && (
                <div className="faq-group" key={g.cat}>
                  <h3>{g.cat}</h3>
                  {g.items.map((f, i) => {
                    const uid = `${g.cat}-${i}`;
                    const open = openId === uid;
                    return (
                      <div className={`faq-item ${open ? 'open' : ''}`} key={uid}>
                        <button onClick={() => setOpenId(open ? null : uid)}>
                          {f.q}
                          <span style={{ color: 'var(--gold)', flex: 'none' }}>{open ? '−' : '+'}</span>
                        </button>
                        <div className="faq-item-answer"><p>{f.a}</p></div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
