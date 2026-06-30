import { useState, type ReactNode } from 'react';

type CollapsibleSectionProps = {
  title: string;
  description?: string;
  default_open?: boolean;
  header_actions?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function CollapsibleSection({
  title,
  description,
  default_open = true,
  header_actions,
  className = '',
  children,
}: CollapsibleSectionProps) {
  const [is_open, set_is_open] = useState(default_open);

  function toggleOpen() {
    set_is_open((previous) => !previous);
  }

  const panel_class_name = ['panel', 'collapsible-section', className]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={panel_class_name}>
      <div
        className={
          header_actions
            ? 'collapsible-header collapsible-header-with-actions'
            : 'collapsible-header'
        }
      >
        <button
          type="button"
          className="collapsible-toggle"
          onClick={toggleOpen}
          aria-expanded={is_open}
        >
          <span
            className={`collapsible-chevron ${is_open ? 'collapsible-chevron-open' : ''}`}
            aria-hidden="true"
          >
            ▸
          </span>
          <div className="collapsible-heading">
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
        </button>
        {header_actions && (
          <div className="collapsible-header-actions">{header_actions}</div>
        )}
      </div>
      {is_open && <div className="collapsible-body">{children}</div>}
    </section>
  );
}
