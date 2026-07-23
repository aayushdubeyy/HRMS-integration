import axios from 'axios';
import {
  buildEncryptDecryptEndpoint,
  buildEncryptDecryptHeaders,
  parseEncryptDecryptResponse,
  type EncryptDecryptRequest,
} from '../src/utils/encryptionService';

export async function requestAdminEncryptDecrypt(
  request: EncryptDecryptRequest,
): Promise<string> {
  const trimmed_content = request.content.trim();
  if (!trimmed_content) {
    throw new Error(`Failed to ${request.mode} value: content is required`);
  }

  const endpoint = buildEncryptDecryptEndpoint(request.mode);
  const headers = buildEncryptDecryptHeaders(request.access_token);
  const response_text = await fetchAdminEncryptDecryptResponse(
    endpoint,
    headers,
    trimmed_content,
  );
  return parseEncryptDecryptResponse(response_text, request.mode);
}

async function fetchAdminEncryptDecryptResponse(
  endpoint: string,
  headers: Record<string, string>,
  content: string,
): Promise<string> {
  try {
    const response = await axios.request({
      url: endpoint,
      method: 'GET',
      headers,
      data: { content },
      transformResponse: [(data) => data],
      validateStatus: () => true,
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(
        `Encrypt/decrypt API failed with status=${response.status} ` +
          `for endpoint=${endpoint}: ${String(response.data)}`,
      );
    }

    return String(response.data);
  } catch (error) {
    throw wrapAdminEncryptDecryptError(error, endpoint);
  }
}

function wrapAdminEncryptDecryptError(error: unknown, endpoint: string): Error {
  if (error instanceof Error && error.message.startsWith('Encrypt/decrypt API failed')) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);
  return new Error(`Failed to call encrypt/decrypt API for endpoint=${endpoint}: ${message}`);
}
