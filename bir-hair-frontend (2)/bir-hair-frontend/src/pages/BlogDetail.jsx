import { useParams, Link, Navigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import PhotoBlock from '../components/PhotoBlock';
import { BlockSkeleton, LineSkeleton } from '../components/Skeletons';
import { ErrorState } from '../components/StateBlocks';
import { useBlog, useBlogs } from '../hooks/useStoreData';
import NewsletterForm from '../components/NewsletterForm';

export default function BlogDetail() {
  const { id } = useParams();
  const { blog: post, loading, error, refetch } = useBlog(id);
  const { blogs } = useBlogs();

  if (loading) {
    return (
      <div className="section">
        <div className="container">
          <BlockSkeleton height={340} />
          <div style={{ marginTop: 24 }}><LineSkeleton width="70%" height={22} /></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <div className="container"><ErrorState message="This article could not be loaded." onRetry={refetch} /></div>
      </div>
    );
  }

  if (!post) return <Navigate to="/404" replace />;

  const related = blogs.filter((b) => b.id !== id).slice(0, 3);

  return (
    <>
      <PageHeader crumbs={[{ label: 'Journal', to: '/journal' }, { label: post.title }]} title={post.title} lede={`${post.cat} · ${post.date}`} />
      <div className="section">
        <div className="container">
          <PhotoBlock tone="gold" ratio="21/9" rounded={22} label={post.cat} className="policy-content" src={post.img} alt={post.title} />
          <div className="policy-content" style={{ marginTop: 30 }}>
            {post.content ? (
              post.content.split('\n\n').map((para, i) => <p key={i}>{para}</p>)
            ) : (
              <>
                <p>{post.excerpt}</p>
                <p>At our Kirti Nagar facility, every claim we make about our hair is something our own QC team checks by hand before a bundle ever reaches a customer.</p>
              </>
            )}
          </div>

          {related.length > 0 && (
            <>
              <div className="section-head" style={{ marginTop: 60 }}><span className="eyebrow">Keep Reading</span><h2 className="section-title">Related Articles</h2></div>
              <div className="blog-row" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                {related.map((b) => (
                  <Link to={`/journal/${b.id}`} className="blog-card card" key={b.id}>
                    <PhotoBlock tone="beige" ratio="16/10" rounded={0} label={b.cat} src={b.img} alt={b.title} />
                    <div className="blog-card-body"><span className="eyebrow">{b.date}</span><h4>{b.title}</h4></div>
                  </Link>
                ))}
              </div>
            </>
          )}

          <div className="newsletter-section" style={{ borderRadius: 24, marginTop: 60 }}>
            <div className="newsletter-inner" style={{ margin: '0 auto' }}>
              <span className="eyebrow" style={{ color: 'var(--champagne)' }}>Stay In The Loop</span>
              <h2 className="section-title" style={{ color: 'var(--cream)' }}>Get New Articles First</h2>
              <NewsletterForm className="newsletter-form" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
