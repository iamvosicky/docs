/**
 * Persists generated document history in localStorage.
 */

const STORAGE_KEY = 'docgen-document-history';

export interface GeneratedDocument {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  createdAt: string; // ISO string
  status: 'completed' | 'processing' | 'failed';
  formData: Record<string, string>;
}

export function getDocumentHistory(): GeneratedDocument[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GeneratedDocument[];
  } catch {
    return [];
  }
}

export function addDocuments(docs: GeneratedDocument[]): void {
  const existing = getDocumentHistory();
  const updated = [...docs, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function updateDocumentStatus(
  id: string,
  status: GeneratedDocument['status'],
): void {
  const docs = getDocumentHistory();
  const idx = docs.findIndex((d) => d.id === id);
  if (idx !== -1) {
    docs[idx].status = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  }
}

export function removeDocument(id: string): void {
  const docs = getDocumentHistory().filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export function clearDocumentHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
