import {
  loadEncryptionSettings,
  saveEncryptionSettings,
} from '../utils/encryptionService';
import { CollapsibleSection } from './CollapsibleSection';

type EncryptionSettingsPanelProps = {
  api_base_url: string;
  encrypt_secrets_on_copy: boolean;
  onChange: (settings: { api_base_url: string; encrypt_secrets_on_copy: boolean }) => void;
};

export function EncryptionSettingsPanel({
  api_base_url,
  encrypt_secrets_on_copy,
  onChange,
}: EncryptionSettingsPanelProps) {
  function persistSettings(next_settings: {
    api_base_url: string;
    encrypt_secrets_on_copy: boolean;
  }) {
    onChange(next_settings);
    saveEncryptionSettings(next_settings);
  }

  return (
    <CollapsibleSection
      title="Secret Encryption"
      description="HRMS secrets must be stored encrypted using chatbot-api encryptDBSecretKey. Encryption happens server-side via /v1/acl/encrypt_decrypt_value and requires admin ACL access."
      className="encryption-panel"
    >
      <div className="settings-grid">
        <label className="full-width-field">
          Chatbot API Base URL
          <input
            type="text"
            value={api_base_url}
            placeholder="https://chatbot-api.example.com"
            onChange={(event) =>
              persistSettings({
                api_base_url: event.target.value,
                encrypt_secrets_on_copy,
              })
            }
          />
        </label>

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={encrypt_secrets_on_copy}
            onChange={(event) =>
              persistSettings({
                api_base_url,
                encrypt_secrets_on_copy: event.target.checked,
              })
            }
          />
          Encrypt secrets when copying config JSON
        </label>
      </div>

      <p className="encryption-note">
        Preview shows plaintext for editing. Copy uses encryption when enabled and API URL is set.
        You can also paste already-encrypted hex values directly into secret fields.
      </p>

      <button
        type="button"
        className="button-secondary button-compact"
        onClick={() => persistSettings(loadEncryptionSettings())}
      >
        Reload Saved Encryption Settings
      </button>
    </CollapsibleSection>
  );
}
