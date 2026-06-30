const ENCRYPTION_STORAGE_KEY = 'hrms_encryption_settings';

export function isLikelyEncryptedValue(value: string): boolean {
  const trimmed_value = value.trim();
  if (trimmed_value.length < 16) return false;
  return /^[0-9a-f]+$/i.test(trimmed_value);
}

function parseEncryptionResponse(response_text: string): string {
  const match = response_text.match(/Encrypted content\s*:\s*(.+)$/i);
  if (!match?.[1]) {
    throw new Error(`Unexpected encryption API response: ${response_text}`);
  }

  return match[1].trim();
}

export async function encryptSecretValue(
  plaintext: string,
  api_base_url: string,
): Promise<string> {
  const trimmed_value = plaintext.trim();
  if (!trimmed_value) return trimmed_value;
  if (isLikelyEncryptedValue(trimmed_value)) return trimmed_value;

  const base_url = api_base_url.replace(/\/$/, '');
  const endpoint = `${base_url}/v1/acl/encrypt_decrypt_value?encrypt=true`;
  const request_body = JSON.stringify({ content: trimmed_value });

  const post_response = await fetch(endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: request_body,
  });

  if (post_response.ok) {
    return parseEncryptionResponse(await post_response.text());
  }

  const get_response = await fetch(endpoint, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: request_body,
  });

  if (!get_response.ok) {
    throw new Error(
      `Encryption API failed with status=${get_response.status} for endpoint=${endpoint}`,
    );
  }

  return parseEncryptionResponse(await get_response.text());
}

export function loadEncryptionSettings(): {
  api_base_url: string;
  encrypt_secrets_on_copy: boolean;
} {
  const raw_settings = localStorage.getItem(ENCRYPTION_STORAGE_KEY);
  if (!raw_settings) {
    return { api_base_url: '', encrypt_secrets_on_copy: true };
  }

  try {
    const parsed_settings = JSON.parse(raw_settings);
    return {
      api_base_url: String(parsed_settings.api_base_url ?? ''),
      encrypt_secrets_on_copy: parsed_settings.encrypt_secrets_on_copy !== false,
    };
  } catch {
    return { api_base_url: '', encrypt_secrets_on_copy: true };
  }
}

export function saveEncryptionSettings(settings: {
  api_base_url: string;
  encrypt_secrets_on_copy: boolean;
}): void {
  localStorage.setItem(ENCRYPTION_STORAGE_KEY, JSON.stringify(settings));
}
