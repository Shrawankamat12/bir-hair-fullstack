import { useRef, useState, useEffect } from 'react';
import './FilterAccordion.css';

export default function FilterAccordion({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef(null);
  const [height, setHeight] = useState(defaultOpen ? 'auto' : 0);

  useEffect(() => {
    if (!ref.current) return;
    if (open) {
      setHeight(ref.current.scrollHeight);
      const t = setTimeout(() => setHeight('auto'), 260);
      return () => clearTimeout(t);
    } else {
      setHeight(ref.current.scrollHeight);
      requestAnimationFrame(() => setHeight(0));
    }
  }, [open]);

  return (
    <div className="facc">
      <button className="facc-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span>{title}</span>
        <svg className={`facc-chevron ${open ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="facc-body" style={{ height: height === 'auto' ? 'auto' : `${height}px` }}>
        <div ref={ref} className="facc-body-inner">{children}</div>
      </div>
    </div>
  );
}
