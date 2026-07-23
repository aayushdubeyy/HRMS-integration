import { CopyButton } from './CopyButton';

type JsonPreviewProps = {
  title: string;
  description: string;
  value: object;
  copy_button_label?: string;
};

export function JsonPreview({
  title,
  description,
  value,
  copy_button_label = 'Copy JSON',
}: JsonPreviewProps) {
  const json_text = JSON.stringify(value, null, 2);

  async function copyJson() {
    await navigator.clipboard.writeText(json_text);
  }

  return (
    <section className="panel json-preview">
      <div className="panel-header json-preview-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <CopyButton label={copy_button_label} onCopy={copyJson} />
      </div>
      <pre>{json_text}</pre>
    </section>
  );
}
