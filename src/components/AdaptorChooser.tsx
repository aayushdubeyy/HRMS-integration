import type { AdaptorType } from '../types/sftpConfig';

type AdaptorChooserProps = {
  onSelect: (adaptor_type: AdaptorType) => void;
};

export function AdaptorChooser({ onSelect }: AdaptorChooserProps) {
  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Infeedo HRMS</p>
          <h1>HRMS Adaptor Builder</h1>
          <p className="subtitle">Choose which adaptor you want to configure.</p>
        </div>
      </header>

      <div className="adaptor-chooser-grid">
        <button
          type="button"
          className="adaptor-chooser-card"
          onClick={() => onSelect('general')}
        >
          <h2>General Adaptor</h2>
          <p>API-based sync with path mapping, auth, pagination, and token APIs.</p>
        </button>

        <button type="button" className="adaptor-chooser-card" onClick={() => onSelect('sftp')}>
          <h2>SFTP Adaptor</h2>
          <p>File-based sync from SFTP with amber field to file column header mapping.</p>
        </button>
      </div>
    </main>
  );
}
