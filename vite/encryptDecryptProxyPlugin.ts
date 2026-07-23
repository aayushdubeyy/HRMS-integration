import type { IncomingMessage, ServerResponse } from 'http';
import type { Connect, Plugin } from 'vite';
import {
  ENCRYPT_DECRYPT_PROXY_PATH,
  type EncryptDecryptMode,
} from '../src/utils/encryptionService';
import { requestAdminEncryptDecrypt } from './requestAdminEncryptDecrypt';

export function encryptDecryptProxyPlugin(): Plugin {
  return {
    name: 'encrypt-decrypt-proxy',
    configureServer(server) {
      server.middlewares.use(createEncryptDecryptMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(createEncryptDecryptMiddleware());
    },
  };
}

function createEncryptDecryptMiddleware(): Connect.NextHandleFunction {
  return (request, response, next) => {
    if (!request.url?.startsWith(ENCRYPT_DECRYPT_PROXY_PATH)) {
      next();
      return;
    }

    if (request.method !== 'POST') {
      response.statusCode = 405;
      response.end('Method not allowed');
      return;
    }

    void handleEncryptDecryptProxyRequest(request, response);
  };
}

async function handleEncryptDecryptProxyRequest(
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  try {
    const request_body = await readJsonBody(request);
    const mode = readEncryptDecryptMode(request_body.mode);
    const result_value = await requestAdminEncryptDecrypt({
      content: String(request_body.content ?? ''),
      access_token: String(request_body.access_token ?? ''),
      mode,
    });

    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.end(result_value);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to proxy encrypt/decrypt request';
    response.statusCode = 500;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.end(message);
  }
}

function readEncryptDecryptMode(mode: unknown): EncryptDecryptMode {
  if (mode === 'encrypt' || mode === 'decrypt') {
    return mode;
  }

  throw new Error(`Failed to proxy encrypt/decrypt request: invalid mode=${String(mode)}`);
}

function readJsonBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    request.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    request.on('end', () => {
      try {
        const raw_body = Buffer.concat(chunks).toString('utf8');
        resolve(JSON.parse(raw_body) as Record<string, unknown>);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        reject(new Error(`Failed to parse encrypt/decrypt proxy body: ${message}`));
      }
    });

    request.on('error', (error) => {
      reject(new Error(`Failed to read encrypt/decrypt proxy body: ${error.message}`));
    });
  });
}
