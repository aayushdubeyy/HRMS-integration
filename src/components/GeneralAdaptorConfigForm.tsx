import type { GeneralAdaptorConfig } from '../types/hrmsConfig';
import { createDefaultApiSource } from '../utils/generalAdaptorConfigForm';
import { ApiSourceEditor } from './ApiSourceEditor';
import { EncryptionSettingsPanel } from './EncryptionSettingsPanel';

type GeneralAdaptorConfigFormProps = {
  config: GeneralAdaptorConfig;
  api_base_url: string;
  encrypt_secrets_on_copy: boolean;
  onChange: (config: GeneralAdaptorConfig) => void;
  onEncryptionSettingsChange: (settings: {
    api_base_url: string;
    encrypt_secrets_on_copy: boolean;
  }) => void;
};

export function GeneralAdaptorConfigForm({
  config,
  api_base_url,
  encrypt_secrets_on_copy,
  onChange,
  onEncryptionSettingsChange,
}: GeneralAdaptorConfigFormProps) {
  function updateSource(source_index: number, next_source: GeneralAdaptorConfig['api_sources'][0]) {
    onChange({
      ...config,
      api_sources: config.api_sources.map((source, index) =>
        index === source_index ? next_source : source,
      ),
    });
  }

  function removeSource(source_index: number) {
    const next_sources = config.api_sources.filter((_, index) => index !== source_index);
    onChange({
      ...config,
      api_sources: next_sources.length > 0 ? next_sources : [createDefaultApiSource()],
    });
  }

  function addSource() {
    onChange({
      ...config,
      api_sources: [...config.api_sources, createDefaultApiSource()],
    });
  }

  return (
    <div className="form-stack">
      <EncryptionSettingsPanel
        api_base_url={api_base_url}
        encrypt_secrets_on_copy={encrypt_secrets_on_copy}
        onChange={onEncryptionSettingsChange}
      />

      {config.api_sources.map((source, source_index) => (
        <ApiSourceEditor
          key={source.source_id}
          source={source}
          source_index={source_index}
          onChange={(next_source) => updateSource(source_index, next_source)}
          onRemove={() => removeSource(source_index)}
        />
      ))}

      <button type="button" className="button-secondary panel-action" onClick={addSource}>
        Add API Source
      </button>
    </div>
  );
}
