import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import type { Template } from './template-schemas';
import { getCustomTemplateDocx, getCustomTemplateText } from './template-schemas';

// ─── Field mappings ──────────────────────────────────────────────────────────
// Map from schema field names to actual DOCX template placeholder names

const fieldMappings: Record<string, Record<string, string>> = {
  'smlouva-o-dilo': {
    KUP_JMENO: 'OBJ_JMENO',
    KUP_ADRESA: 'OBJ_ADRESA',
    KUP_ICO: 'OBJ_ICO',
    PROD_JMENO: 'ZHOT_JMENO',
    PROD_ADRESA: 'ZHOT_ADRESA',
    PROD_ICO: 'ZHOT_ICO',
    PREDMET_DILA: 'PREDMET_DILA',
    CENA: 'CENA',
    DATUM_PREDANI: 'TERMIN',
  },
  'kupni-smlouva': {
    KUP_JMENO: 'KUP_JMENO',
    KUP_ADRESA: 'KUP_ADRESA',
    KUP_ICO: 'KUP_ICO',
    PROD_JMENO: 'PROD_JMENO',
    PROD_ADRESA: 'PROD_ADRESA',
    PROD_ICO: 'PROD_ICO',
    PREDMET_PRODEJE: 'PREDMET_PRODEJE',
    CENA: 'CENA',
    DATUM_PREDANI: 'DATUM_PREVODU',
  },
  'dohoda-o-provedeni-prace': {
    ZAM_JMENO: 'ZAM_JMENO',
    ZAM_ADRESA: 'ZAM_ADRESA',
    ZAM_ICO: 'ZAM_ICO',
    PRAC_JMENO: 'PRAC_JMENO',
    PRAC_ADRESA: 'PRAC_ADRESA',
    PRAC_RC: 'PRAC_RC',
    POPIS_PRACE: 'PRACOVNI_CINNOST',
    ODMENA: 'ODMENA',
    DATUM_OD: 'DOBA_OD',
    DATUM_DO: 'DOBA_DO',
  },
};

// Template ID -> DOCX filename mapping
const docxTemplateFiles: Record<string, string> = {
  'smlouva-o-dilo': 'smlouva_o_dilo_template.docx',
  'dohoda-o-provedeni-prace': 'dohoda_o_provedeni_prace_template.docx',
  'kupni-smlouva': 'kupni_smlouva_template.docx',
};

function mapFormDataToDocx(templateId: string, formData: Record<string, string>): Record<string, string> {
  const mapping = fieldMappings[templateId];
  if (!mapping) return formData;

  const mapped: Record<string, string> = {};
  mapped['MISTO'] = formData['PLACE'] || formData['MISTO'] || 'Praha';
  mapped['DATUM'] = formData['DATE'] || formData['DATUM'] || new Date().toLocaleDateString('cs-CZ');

  for (const [schemaKey, docxKey] of Object.entries(mapping)) {
    mapped[docxKey] = formData[schemaKey] || '';
  }

  for (const [key, value] of Object.entries(formData)) {
    if (!mapping[key] && !mapped[key]) {
      mapped[key] = value;
    }
  }

  return mapped;
}

// ─── DOCX generation (source of truth) ──────────────────────────────────────

export async function generateDOCX(
  template: Template,
  formData: Record<string, string>
): Promise<Blob> {
  // Check for custom template with stored DOCX (preserves original formatting)
  const customDocxBase64 = getCustomTemplateDocx(template.id);
  if (customDocxBase64) {
    try {
      const binaryString = atob(customDocxBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const zip = new PizZip(bytes.buffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '{{', end: '}}' },
      });
      doc.setData(formData);
      doc.render();
      return doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
    } catch (error) {
      console.error('Custom DOCX template error, falling back:', error);
      return generateDocxFromScratch(template, formData);
    }
  }

  const docxFile = docxTemplateFiles[template.id];

  if (docxFile) {
    try {
      const response = await fetch(`/templates/${docxFile}`);
      if (!response.ok) throw new Error(`Failed to fetch template: ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '{{', end: '}}' },
      });

      const mappedData = mapFormDataToDocx(template.id, formData);
      doc.setData(mappedData);
      doc.render();

      const blob = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      return blob;
    } catch (error) {
      console.error('DOCX template error, falling back to generated:', error);
      return generateDocxFromScratch(template, formData);
    }
  } else {
    return generateDocxFromScratch(template, formData);
  }
}

// ─── DOCX from scratch (fallback when no template file exists) ───────────────

function generateDocxFromScratch(template: Template, formData: Record<string, string>): Blob {
  const contentXml = buildDocumentXml(template, formData);
  const zip = new PizZip();

  zip.file('[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '</Types>'
  );

  zip.file('_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '</Relationships>'
  );

  zip.file('word/_rels/document.xml.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '</Relationships>'
  );

  zip.file('word/document.xml', contentXml);

  return zip.generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

// ─── XML helpers ─────────────────────────────────────────────────────────────

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const groupLabels: Record<string, string> = {
  KUP: 'Kupující', PROD: 'Prodávající', ZAM: 'Zaměstnavatel', PRAC: 'Pracovník',
  COMPANY: 'Společnost', REPRESENTATIVE: 'Zástupce', ATTORNEY: 'Zmocněnec',
  PERSON: 'Osoba', SHAREHOLDER: 'Akcionář', OWNER: 'Vlastník', ADMINISTRATOR: 'Správce vkladu',
};

function groupFields(template: Template, formData: Record<string, string>) {
  const groups = new Map<string, { key: string; title: string; value: string }[]>();
  for (const [key, prop] of Object.entries(template.schema.properties)) {
    const prefix = key.split('_')[0];
    const group = groupLabels[prefix] || 'Obecné údaje';
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push({ key, title: prop.title, value: formData[key] || '' });
  }
  return groups;
}

function toRoman(num: number): string {
  const vals = [10, 9, 5, 4, 1];
  const syms = ['X', 'IX', 'V', 'IV', 'I'];
  let result = '';
  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) { result += syms[i]; num -= vals[i]; }
  }
  return result;
}

function buildDocumentXml(template: Template, formData: Record<string, string>): string {
  const w = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const groups = groupFields(template, formData);
  const today = new Date().toLocaleDateString('cs-CZ');

  let body = '';
  body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="400"/></w:pPr>` +
    `<w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr>` +
    `<w:t>${escapeXml(template.name.toUpperCase())}</w:t></w:r></w:p>`;

  body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="400"/></w:pPr>` +
    `<w:r><w:rPr><w:i/><w:color w:val="666666"/></w:rPr>` +
    `<w:t>${escapeXml(template.description)}</w:t></w:r></w:p>`;

  body += `<w:p><w:pPr><w:jc w:val="right"/><w:spacing w:after="400"/></w:pPr>` +
    `<w:r><w:t>Datum: ${escapeXml(formData['DATE'] || formData['DATUM'] || today)}</w:t></w:r></w:p>`;

  body += `<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="CCCCCC"/></w:pBdr><w:spacing w:after="300"/></w:pPr></w:p>`;

  let sectionNum = 1;
  for (const [groupName, fields] of groups) {
    body += `<w:p><w:pPr><w:spacing w:before="300" w:after="200"/></w:pPr>` +
      `<w:r><w:rPr><w:b/><w:sz w:val="26"/></w:rPr>` +
      `<w:t>${escapeXml(`${toRoman(sectionNum)}. ${groupName}`)}</w:t></w:r></w:p>`;

    for (const field of fields) {
      body += `<w:p><w:pPr><w:spacing w:after="80"/><w:ind w:left="360"/></w:pPr>` +
        `<w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr>` +
        `<w:t>${escapeXml(field.title)}: </w:t></w:r>` +
        `<w:r><w:rPr><w:sz w:val="20"/></w:rPr>` +
        `<w:t>${escapeXml(field.value || '_______________')}</w:t></w:r></w:p>`;
    }
    sectionNum++;
  }

  body += `<w:p><w:pPr><w:spacing w:before="600"/></w:pPr></w:p>`;
  body += `<w:p><w:pPr><w:spacing w:after="600"/></w:pPr>` +
    `<w:r><w:rPr><w:sz w:val="20"/><w:color w:val="666666"/></w:rPr>` +
    `<w:t>Podpis: ________________________________</w:t></w:r></w:p>`;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:document xmlns:w="${w}">` +
    `<w:body>${body}</w:body></w:document>`;
}

// ─── Download helpers ────────────────────────────────────────────────────────

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download a single document as DOCX.
 */
export async function downloadDocument(
  template: Template,
  formData: Record<string, string>,
): Promise<void> {
  const safeName = template.id.replace(/[^a-z0-9-]/g, '_');
  const blob = await generateDOCX(template, formData);
  downloadBlob(blob, `${safeName}.docx`);
}

/**
 * Download all documents as a ZIP archive (DOCX only).
 */
export async function downloadAllAsZip(
  templates: Template[],
  formData: Record<string, string>
): Promise<void> {
  const zip = new PizZip();

  for (const template of templates) {
    const safeName = template.id.replace(/[^a-z0-9-]/g, '_');
    const docxBlob = await generateDOCX(template, formData);
    const docxBuffer = await docxBlob.arrayBuffer();
    zip.file(`${safeName}.docx`, docxBuffer);
  }

  const blob = zip.generate({
    type: 'blob',
    mimeType: 'application/zip',
  });
  downloadBlob(blob, 'dokumenty.zip');
}
