import { useState, type ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
}

export default function FormulaAccordion({ title, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="accordion">
      <button className="accordion-trigger" onClick={() => setOpen(!open)}>
        <span>▸ {title}</span>
        <span className={`accordion-arrow ${open ? 'open' : ''}`}>▶</span>
      </button>
      {open && (
        <div className="accordion-body">
          {children}
        </div>
      )}
    </div>
  );
}
