import { useState } from 'react';
import {
  encryptDecryptValue,
  type EncryptDecryptMode,
} from '../utils/encryptionService';
import { CollapsibleSection } from './CollapsibleSection';
import { CopyButton } from './CopyButton';

export function EncryptDecryptValuePanel() {
  const [access_token, setAccessToken] = useState('');
  const [content, setContent] = useState('');
  const [result, setResult] = useState('');
  const [error_message, setErrorMessage] = useState('');
  const [is_loading, setIsLoading] = useState(false);

  async function submitEncryptDecrypt(mode: EncryptDecryptMode) {
    setIsLoading(true);
    setErrorMessage('');
    setResult('');

    try {
      const next_result = await encryptDecryptValue({
        content,
        access_token,
        mode,
      });
      setResult(next_result);
    } catch (error) {
      setErrorMessage(readEncryptDecryptError(error, mode));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <CollapsibleSection
      title="Encrypt / Decrypt Value"
      description="Encrypt or decrypt any value via admin ACL. Paste your access token; it is not saved."
      className="encryption-panel"
    >
      <div className="settings-grid">
        <label className="full-width-field">
          Access Token
          <input
            type="password"
            value={access_token}
            placeholder="Paste Bearer access token"
            autoComplete="off"
            onChange={(event) => setAccessToken(event.target.value)}
          />
        </label>

        <label className="full-width-field">
          Content
          <textarea
            className="json-textarea encrypt-decrypt-input"
            value={content}
            placeholder="Value to encrypt or decrypt"
            onChange={(event) => setContent(event.target.value)}
          />
        </label>
      </div>

      <div className="encrypt-decrypt-actions">
        <button
          type="button"
          className="button-secondary"
          disabled={is_loading}
          onClick={() => submitEncryptDecrypt('encrypt')}
        >
          {is_loading ? 'Working…' : 'Encrypt'}
        </button>
        <button
          type="button"
          className="button-secondary"
          disabled={is_loading}
          onClick={() => submitEncryptDecrypt('decrypt')}
        >
          {is_loading ? 'Working…' : 'Decrypt'}
        </button>
      </div>

      {error_message && <p className="validation-error panel-error">{error_message}</p>}

      {result && (
        <div className="encrypt-decrypt-result">
          <div className="encrypt-decrypt-result-header">
            <span>Result</span>
            <CopyButton
              label="Copy Result"
              onCopy={() => navigator.clipboard.writeText(result)}
            />
          </div>
          <textarea className="json-textarea encrypt-decrypt-input" value={result} readOnly />
        </div>
      )}
    </CollapsibleSection>
  );
}

function readEncryptDecryptError(error: unknown, mode: EncryptDecryptMode): string {
  if (error instanceof Error) {
    return error.message;
  }

  return `Failed to ${mode} value`;
}
