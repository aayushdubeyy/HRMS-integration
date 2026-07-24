import type { SftpConfigForm } from '../types/sftpConfig';
import { EncryptDecryptValuePanel } from './EncryptDecryptValuePanel';
import { SecretFieldInput } from './SecretFieldInput';
import { CollapsibleSection } from './CollapsibleSection';

type SftpAdaptorConfigFormProps = {
  config: SftpConfigForm;
  onChange: (config: SftpConfigForm) => void;
};

export function SftpAdaptorConfigForm({ config, onChange }: SftpAdaptorConfigFormProps) {
  function updateField<K extends keyof SftpConfigForm>(field: K, value: SftpConfigForm[K]) {
    onChange({ ...config, [field]: value });
  }

  return (
    <div className="form-stack">
      <EncryptDecryptValuePanel />

      <CollapsibleSection
        title="SFTP Connection"
        description="Required FileAdaptor connection settings. Use Encrypt / Decrypt Value for secrets."
      >
        <div className="settings-grid">
          <label>
            Host
            <input
              type="text"
              value={config.host}
              placeholder="sftp.example.com"
              onChange={(event) => updateField('host', event.target.value)}
            />
          </label>
          <label>
            Port
            <input
              type="text"
              value={config.port}
              placeholder="22"
              onChange={(event) => updateField('port', event.target.value)}
            />
          </label>
          <label>
            Username
            <input
              type="text"
              value={config.username}
              placeholder="sftp_user"
              onChange={(event) => updateField('username', event.target.value)}
            />
          </label>
          <label>
            Remote Folder Path
            <input
              type="text"
              value={config.remoteFolderPath}
              placeholder="/uploads/employees"
              onChange={(event) => updateField('remoteFolderPath', event.target.value)}
            />
          </label>
        </div>

        <fieldset className="auth-mode-fieldset">
          <legend>Authentication</legend>
          <label className="checkbox-field">
            <input
              type="radio"
              name="sftp_auth_mode"
              checked={config.auth_mode === 'password'}
              onChange={() => updateField('auth_mode', 'password')}
            />
            Password
          </label>
          <label className="checkbox-field">
            <input
              type="radio"
              name="sftp_auth_mode"
              checked={config.auth_mode === 'ssh_key'}
              onChange={() => updateField('auth_mode', 'ssh_key')}
            />
            SSH Key
          </label>
        </fieldset>

        {config.auth_mode === 'password' ? (
          <SecretFieldInput
            label="Password"
            value={config.password}
            is_already_encrypted={config.password_is_already_encrypted}
            placeholder="Encrypt via Encrypt / Decrypt Value"
            onChange={(password, password_is_already_encrypted) =>
              onChange({ ...config, password, password_is_already_encrypted })
            }
          />
        ) : (
          <div className="settings-grid">
            <label>
              SSH Key Path
              <input
                type="text"
                value={config.ssh_key_path}
                placeholder="/keys/sftp.pem"
                onChange={(event) => updateField('ssh_key_path', event.target.value)}
              />
            </label>
            <SecretFieldInput
              label="SSH Passphrase (Optional)"
              value={config.ssh_passphrase}
              is_already_encrypted={config.ssh_passphrase_is_already_encrypted}
              placeholder="Encrypt via Encrypt / Decrypt Value"
              onChange={(ssh_passphrase, ssh_passphrase_is_already_encrypted) =>
                onChange({
                  ...config,
                  ssh_passphrase,
                  ssh_passphrase_is_already_encrypted,
                })
              }
            />
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection title="File Format Options">
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={config.contains_large_files}
            onChange={(event) => updateField('contains_large_files', event.target.checked)}
          />
          Contains large files
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={config.is_xlsx_file}
            onChange={(event) => updateField('is_xlsx_file', event.target.checked)}
          />
          XLSX file
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={config.contains_pipe_separated_data}
            onChange={(event) =>
              updateField('contains_pipe_separated_data', event.target.checked)
            }
          />
          Pipe-separated data
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={config.contains_employee_number}
            onChange={(event) => updateField('contains_employee_number', event.target.checked)}
          />
          Contains employee number
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={config.is_base64_encrypted}
            onChange={(event) => updateField('is_base64_encrypted', event.target.checked)}
          />
          Base64 encrypted
        </label>
      </CollapsibleSection>

      <CollapsibleSection
        title="PGP Decryption"
        description="Optional. Encrypt private key and passphrase with Encrypt / Decrypt Value."
      >
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={config.is_pgp_encrypted}
            onChange={(event) => updateField('is_pgp_encrypted', event.target.checked)}
          />
          PGP encrypted
        </label>
        <SecretFieldInput
          label="Private Key"
          value={config.private_key}
          is_already_encrypted={config.private_key_is_already_encrypted}
          onChange={(private_key, private_key_is_already_encrypted) =>
            onChange({ ...config, private_key, private_key_is_already_encrypted })
          }
        />
        <SecretFieldInput
          label="Passphrase"
          value={config.passphrase}
          is_already_encrypted={config.passphrase_is_already_encrypted}
          onChange={(passphrase, passphrase_is_already_encrypted) =>
            onChange({ ...config, passphrase, passphrase_is_already_encrypted })
          }
        />
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={config.is_binary_message}
            onChange={(event) => updateField('is_binary_message', event.target.checked)}
          />
          Binary message
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={config.is_pipe_separated}
            onChange={(event) => updateField('is_pipe_separated', event.target.checked)}
          />
          Pipe separated (PGP)
        </label>
      </CollapsibleSection>

      <CollapsibleSection title="Error Upload & Alerts">
        <label>
          Error Upload Path
          <input
            type="text"
            value={config.path}
            placeholder="/errors"
            onChange={(event) => updateField('path', event.target.value)}
          />
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={config.record_failures}
            onChange={(event) => updateField('record_failures', event.target.checked)}
          />
          Record failures
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={config.send_error_file}
            onChange={(event) => updateField('send_error_file', event.target.checked)}
          />
          Send error file
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={config.priority_alert}
            onChange={(event) => updateField('priority_alert', event.target.checked)}
          />
          Priority alert
        </label>
      </CollapsibleSection>
    </div>
  );
}
