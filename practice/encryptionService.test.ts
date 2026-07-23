import { describe, expect, it } from 'vitest';
import {
  ADMIN_API_BASE_URL,
  buildEncryptDecryptEndpoint,
  buildEncryptDecryptHeaders,
  parseEncryptDecryptResponse,
} from '../src/utils/encryptionService';

describe('buildEncryptDecryptEndpoint', () => {
  it('builds encrypt endpoint from hardcoded admin api base url', () => {
    expect(ADMIN_API_BASE_URL).toBe('https://admin-api-ap.infeedo.com');
    expect(buildEncryptDecryptEndpoint('encrypt')).toBe(
      'https://admin-api-ap.infeedo.com/v1/acl/encrypt_decrypt_value?encrypt=true',
    );
  });

  it('builds decrypt endpoint from hardcoded admin api base url', () => {
    expect(buildEncryptDecryptEndpoint('decrypt')).toBe(
      'https://admin-api-ap.infeedo.com/v1/acl/encrypt_decrypt_value?encrypt=false',
    );
  });
});

describe('buildEncryptDecryptHeaders', () => {
  it('builds authorization bearer headers from access token', () => {
    const headers = buildEncryptDecryptHeaders('user-access-token');

    expect(headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer user-access-token',
    });
  });

  it('throws when access token is missing', () => {
    expect(() => buildEncryptDecryptHeaders('')).toThrow(
      'Failed to build encrypt/decrypt headers: access_token is required',
    );
  });
});

describe('parseEncryptDecryptResponse', () => {
  it('parses encrypted content from postman-style response', () => {
    const response_text =
      'Encrypted content : fbb808eba73ad57575e4c6e9a04c8a6a40d6c0106d26b8553aff8d0a7ea8fbc10ca0c7e98b33caf8f5b696af137ea0e51f';

    expect(parseEncryptDecryptResponse(response_text, 'encrypt')).toBe(
      'fbb808eba73ad57575e4c6e9a04c8a6a40d6c0106d26b8553aff8d0a7ea8fbc10ca0c7e98b33caf8f5b696af137ea0e51f',
    );
  });

  it('parses decrypted content from postman-style response', () => {
    const response_text = 'Decrypted content : V2VsY29tZSB0byBzZXJ2ZXI=';

    expect(parseEncryptDecryptResponse(response_text, 'decrypt')).toBe(
      'V2VsY29tZSB0byBzZXJ2ZXI=',
    );
  });

  it('throws when expected label is missing from response', () => {
    expect(() =>
      parseEncryptDecryptResponse('Unexpected body', 'encrypt'),
    ).toThrow('Failed to parse encrypt response: Unexpected body');
  });
});
