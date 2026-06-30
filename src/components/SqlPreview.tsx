import { CopyButton } from './CopyButton';

type SqlPreviewProps = {
  title: string;
  description: string;
  sql_text: string;
  error_message?: string;
};

export function SqlPreview({
  title,
  description,
  sql_text,
  error_message,
}: SqlPreviewProps) {
  async function copySql() {
    if (!sql_text || error_message) return;
    await navigator.clipboard.writeText(sql_text);
  }

  return (
    <section className="panel json-preview">
      <div className="panel-header json-preview-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <CopyButton
          label="Copy SQL"
          disabled={!sql_text || Boolean(error_message)}
          onCopy={copySql}
        />
      </div>

      {error_message && <p className="validation-error panel-error">{error_message}</p>}

      <pre>{sql_text || '-- Fill the form to generate SQL'}</pre>
    </section>
  );
}
