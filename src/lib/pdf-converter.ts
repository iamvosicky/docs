/**
 * Provider-based DOCX → PDF conversion service.
 *
 * DOCX is the single source of truth.  Every PDF is produced by converting
 * the already-generated DOCX — no separate PDF templates exist.
 *
 * Providers are selected at startup via the PDF_PROVIDER env var.
 */

// ─── Public interface ────────────────────────────────────────────────────────

export interface PdfConversionProvider {
  readonly name: string;
  /** Convert a DOCX buffer to a PDF buffer. Throws on failure. */
  convertDocxToPdf(docx: ArrayBuffer): Promise<ArrayBuffer>;
}

export class PdfConversionError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly statusCode?: number,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'PdfConversionError';
  }
}

// ─── CloudConvert ────────────────────────────────────────────────────────────

export class CloudConvertProvider implements PdfConversionProvider {
  readonly name = 'cloudconvert';
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly timeoutMs: number;

  constructor(opts: { apiKey: string; sandbox?: boolean; timeoutMs?: number }) {
    if (!opts.apiKey) throw new Error('CloudConvert API key is required');
    this.apiKey = opts.apiKey;
    this.apiUrl = opts.sandbox
      ? 'https://api.sandbox.cloudconvert.com'
      : 'https://api.cloudconvert.com';
    this.timeoutMs = opts.timeoutMs ?? 120_000;
  }

  async convertDocxToPdf(docx: ArrayBuffer): Promise<ArrayBuffer> {
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    // 1 ── Create job: upload → convert → export in one call ──────────────
    const jobBody = {
      tasks: {
        'upload-docx': { operation: 'import/upload' },
        'convert-to-pdf': {
          operation: 'convert',
          input: ['upload-docx'],
          input_format: 'docx',
          output_format: 'pdf',
          engine: 'office',          // Microsoft Office engine for max fidelity
        },
        'export-pdf': {
          operation: 'export/url',
          input: ['convert-to-pdf'],
          inline: false,
        },
      },
      tag: 'docgen-docx-to-pdf',
    };

    const jobRes = await this.fetch(`${this.apiUrl}/v2/jobs`, {
      method: 'POST',
      headers,
      body: JSON.stringify(jobBody),
    });

    if (!jobRes.ok) {
      const text = await jobRes.text().catch(() => '');
      throw new PdfConversionError(
        `CloudConvert: failed to create job (${jobRes.status}): ${text}`,
        this.name,
        jobRes.status,
      );
    }

    const job = (await jobRes.json()) as CloudConvertJobResponse;

    // 2 ── Upload the DOCX to the upload task ─────────────────────────────
    const uploadTask = job.data.tasks.find(
      (t: CloudConvertTask) => t.name === 'upload-docx',
    );
    if (!uploadTask?.result?.form?.url) {
      throw new PdfConversionError(
        'CloudConvert: upload task missing form URL',
        this.name,
      );
    }

    const form = uploadTask.result.form;
    const formData = new FormData();
    for (const [key, value] of Object.entries(form.parameters ?? {})) {
      formData.append(key, value as string);
    }
    formData.append('file', new Blob([docx], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }), 'document.docx');

    const uploadRes = await this.fetch(form.url, {
      method: 'POST',
      body: formData,
    });
    if (!uploadRes.ok) {
      throw new PdfConversionError(
        `CloudConvert: upload failed (${uploadRes.status})`,
        this.name,
        uploadRes.status,
      );
    }

    // 3 ── Poll until the job finishes ────────────────────────────────────
    const deadline = Date.now() + this.timeoutMs;
    let completedJob: CloudConvertJobResponse | null = null;

    while (Date.now() < deadline) {
      await sleep(1500);

      const pollRes = await this.fetch(`${this.apiUrl}/v2/jobs/${job.data.id}`, {
        headers,
      });
      if (!pollRes.ok) {
        throw new PdfConversionError(
          `CloudConvert: poll failed (${pollRes.status})`,
          this.name,
          pollRes.status,
        );
      }

      const pollData = (await pollRes.json()) as CloudConvertJobResponse;
      const status = pollData.data.status;

      if (status === 'finished') {
        completedJob = pollData;
        break;
      }
      if (status === 'error') {
        const errTask = pollData.data.tasks.find(
          (t: CloudConvertTask) => t.status === 'error',
        );
        throw new PdfConversionError(
          `CloudConvert: conversion failed – ${errTask?.message ?? 'unknown error'}`,
          this.name,
        );
      }
      // status is 'waiting' or 'processing' → keep polling
    }

    if (!completedJob) {
      throw new PdfConversionError(
        `CloudConvert: conversion timed out after ${this.timeoutMs}ms`,
        this.name,
      );
    }

    // 4 ── Download the exported PDF ──────────────────────────────────────
    const exportTask = completedJob.data.tasks.find(
      (t: CloudConvertTask) => t.name === 'export-pdf',
    );
    const pdfUrl = exportTask?.result?.files?.[0]?.url;
    if (!pdfUrl) {
      throw new PdfConversionError(
        'CloudConvert: export task missing file URL',
        this.name,
      );
    }

    const pdfRes = await this.fetch(pdfUrl);
    if (!pdfRes.ok) {
      throw new PdfConversionError(
        `CloudConvert: PDF download failed (${pdfRes.status})`,
        this.name,
        pdfRes.status,
      );
    }

    return pdfRes.arrayBuffer();
  }

  /** Wrapper so tests can mock fetch. */
  private fetch(input: string | URL, init?: RequestInit): Promise<Response> {
    return fetch(input, init);
  }
}

// ─── Gotenberg (self-hosted) ─────────────────────────────────────────────────

export class GotenbergProvider implements PdfConversionProvider {
  readonly name = 'gotenberg';
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(opts: { url: string; timeoutMs?: number }) {
    if (!opts.url) throw new Error('Gotenberg URL is required');
    this.baseUrl = opts.url.replace(/\/+$/, '');
    this.timeoutMs = opts.timeoutMs ?? 60_000;
  }

  async convertDocxToPdf(docx: ArrayBuffer): Promise<ArrayBuffer> {
    const formData = new FormData();
    formData.append('files', new Blob([docx], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }), 'document.docx');

    // Gotenberg's LibreOffice route for office documents
    const endpoint = `${this.baseUrl}/forms/libreoffice/convert`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new PdfConversionError(
          `Gotenberg: conversion failed (${res.status}): ${text}`,
          this.name,
          res.status,
        );
      }

      return res.arrayBuffer();
    } catch (err) {
      if (err instanceof PdfConversionError) throw err;
      throw new PdfConversionError(
        `Gotenberg: request failed – ${(err as Error).message}`,
        this.name,
        undefined,
        err,
      );
    } finally {
      clearTimeout(timer);
    }
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export type PdfProviderType = 'cloudconvert' | 'gotenberg' | 'none';

export interface PdfConverterConfig {
  provider: PdfProviderType;
  cloudconvert?: { apiKey: string; sandbox?: boolean; timeoutMs?: number };
  gotenberg?: { url: string; timeoutMs?: number };
}

/**
 * Read configuration from environment variables.
 *
 *   PDF_PROVIDER          = cloudconvert | gotenberg | none
 *   CLOUDCONVERT_API_KEY  = …
 *   CLOUDCONVERT_SANDBOX  = true | false
 *   GOTENBERG_URL         = http://localhost:3000
 */
export function configFromEnv(): PdfConverterConfig {
  const provider = (process.env.PDF_PROVIDER ?? 'none') as PdfProviderType;

  return {
    provider,
    cloudconvert: {
      apiKey: process.env.CLOUDCONVERT_API_KEY ?? '',
      sandbox: process.env.CLOUDCONVERT_SANDBOX === 'true',
      timeoutMs: process.env.CLOUDCONVERT_TIMEOUT_MS
        ? Number(process.env.CLOUDCONVERT_TIMEOUT_MS)
        : undefined,
    },
    gotenberg: {
      url: process.env.GOTENBERG_URL ?? 'http://localhost:3000',
      timeoutMs: process.env.GOTENBERG_TIMEOUT_MS
        ? Number(process.env.GOTENBERG_TIMEOUT_MS)
        : undefined,
    },
  };
}

/**
 * Create a provider instance from config.  Returns `null` when
 * `provider === 'none'` — callers should fall back to client-side export.
 */
export function createProvider(
  config: PdfConverterConfig,
): PdfConversionProvider | null {
  switch (config.provider) {
    case 'cloudconvert':
      return new CloudConvertProvider(config.cloudconvert!);
    case 'gotenberg':
      return new GotenbergProvider(config.gotenberg!);
    case 'none':
    default:
      return null;
  }
}

// ─── Convenience: one-call conversion ────────────────────────────────────────

let _cachedProvider: PdfConversionProvider | null | undefined;

/**
 * Convert DOCX → PDF using the env-configured provider.
 * Returns `null` when no provider is configured (PDF_PROVIDER=none).
 */
export async function convertDocxToPdf(
  docx: ArrayBuffer,
): Promise<ArrayBuffer | null> {
  if (_cachedProvider === undefined) {
    _cachedProvider = createProvider(configFromEnv());
  }
  if (!_cachedProvider) return null;
  return _cachedProvider.convertDocxToPdf(docx);
}

// ─── Helpers / types ─────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

interface CloudConvertTask {
  name: string;
  status: string;
  message?: string;
  result?: {
    form?: { url: string; parameters?: Record<string, string> };
    files?: { url: string; filename: string }[];
  };
}

interface CloudConvertJobResponse {
  data: {
    id: string;
    status: string;
    tasks: CloudConvertTask[];
  };
}
