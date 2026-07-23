export const ADMIN_API_BASE_URL = 'https://admin-api-ap.infeedo.com';
export const ENCRYPT_DECRYPT_PROXY_PATH = '/api/encrypt-decrypt';

export type EncryptDecryptMode = 'encrypt' | 'decrypt';

export type EncryptDecryptRequest = {
  content: string;
  access_token: string;
  mode: EncryptDecryptMode;
};

export function isLikelyEncryptedValue(value: string): boolean {
  const trimmed_value = value.trim();
  if (trimmed_value.length < 16) return false;
  return /^[0-9a-f]+$/i.test(trimmed_value);
}

export function buildEncryptDecryptEndpoint(mode: EncryptDecryptMode): string {
  const encrypt_query = mode === 'encrypt' ? 'true' : 'false';
  return `${ADMIN_API_BASE_URL}/v1/acl/encrypt_decrypt_value?encrypt=${encrypt_query}`;
}

export function buildEncryptDecryptHeaders(access_token: string): Record<string, string> {
  const trimmed_token = access_token.trim();
  if (!trimmed_token) {
    throw new Error('Failed to build encrypt/decrypt headers: access_token is required');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${trimmed_token}`,
  };
}

export function parseEncryptDecryptResponse(
  response_text: string,
  mode: EncryptDecryptMode,
): string {
  const response_label = mode === 'encrypt' ? 'Encrypted content' : 'Decrypted content';
  const match = response_text.match(new RegExp(`${response_label}\\s*:\\s*(.+)$`, 'i'));
  if (!match?.[1]) {
    throw new Error(`Failed to parse ${mode} response: ${response_text}`);
  }

  return match[1].trim();
}

export async function encryptDecryptValue(
  request: EncryptDecryptRequest,
): Promise<string> {
  const trimmed_content = request.content.trim();
  if (!trimmed_content) {
    throw new Error(`Failed to ${request.mode} value: content is required`);
  }

  const response = await fetch(ENCRYPT_DECRYPT_PROXY_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: trimmed_content,
      access_token: request.access_token,
      mode: request.mode,
    }),
  });

  const response_text = await response.text();
  if (!response.ok) {
    throw new Error(
      `Failed to ${request.mode} value via proxy path=${ENCRYPT_DECRYPT_PROXY_PATH}: ${response_text}`,
    );
  }

  return response_text.trim();
}
