import { REQUEST_TEMPLATE_PLACEHOLDERS } from '../constants/hrmsAuth';

type RequestTemplatePlaceholdersProps = {
  description?: string;
};

export function RequestTemplatePlaceholders({
  description = 'Use these exact values in header or request_body fields. Placeholders must be the entire string value.',
}: RequestTemplatePlaceholdersProps) {
  return (
    <div className="placeholder-hints">
      <p className="field-hint">{description}</p>
      <div className="chip-grid">
        {REQUEST_TEMPLATE_PLACEHOLDERS.map((placeholder) => (
          <button
            key={placeholder}
            type="button"
            className="chip"
            title="Copy placeholder"
            onClick={() => navigator.clipboard.writeText(placeholder)}
          >
            {placeholder}
          </button>
        ))}
        <span className="chip chip-muted">{'{{config.some.path}}'}</span>
      </div>
    </div>
  );
}
