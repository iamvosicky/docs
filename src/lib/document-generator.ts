import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import type { Template } from './template-schemas';
import { getCustomTemplateDocx, getCustomTemplateText } from './template-schemas';

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

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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

// ─── PDF via HTML + browser print ────────────────────────────────────────────

function buildPdfHtml(template: Template, formData: Record<string, string>): string {
  const groups = groupFields(template, formData);
  const today = new Date().toLocaleDateString('cs-CZ');
  const date = formData['DATE'] || formData['DATUM'] || today;

  let sections = '';
  let sectionNum = 1;
  for (const [groupName, fields] of groups) {
    let rows = '';
    for (const field of fields) {
      const val = field.value
        ? escapeHtml(field.value)
        : '<span style="color:#bbb">_______________</span>';
      rows += `
        <tr>
          <td style="padding:5px 12px 5px 0;font-weight:600;white-space:nowrap;vertical-align:top;color:#374151;width:40%">${escapeHtml(field.title)}</td>
          <td style="padding:5px 0;color:#111827">${val}</td>
        </tr>`;
    }
    sections += `
      <div style="margin-bottom:24px">
        <h2 style="font-size:14px;font-weight:700;color:#1e3a5f;margin:0 0 10px 0;padding-bottom:6px;border-bottom:2px solid #e5e7eb">
          ${toRoman(sectionNum)}. ${escapeHtml(groupName)}
        </h2>
        <table style="width:100%;border-collapse:collapse;font-size:12px">${rows}</table>
      </div>`;
    sectionNum++;
  }

  return `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="UTF-8">
<style>
  @page {
    size: A4;
    margin: 20mm 22mm 25mm 22mm;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #111827;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
  <div style="text-align:center;margin-bottom:8px">
    <h1 style="font-size:20px;font-weight:800;letter-spacing:1px;color:#0f172a;margin-bottom:4px">
      ${escapeHtml(template.name.toUpperCase())}
    </h1>
    <p style="font-size:11px;color:#6b7280;font-style:italic">${escapeHtml(template.description)}</p>
  </div>

  <div style="text-align:right;font-size:11px;color:#6b7280;margin-bottom:16px">
    V Praze dne ${escapeHtml(date)}
  </div>

  <hr style="border:none;border-top:1px solid #d1d5db;margin-bottom:24px">

  ${sections}

  <div style="margin-top:48px;display:flex;justify-content:space-between">
    <div style="width:42%;text-align:center">
      <div style="border-top:1px solid #374151;padding-top:8px;font-size:11px;color:#6b7280">Podpis</div>
    </div>
    <div style="width:42%;text-align:center">
      <div style="border-top:1px solid #374151;padding-top:8px;font-size:11px;color:#6b7280">Podpis</div>
    </div>
  </div>

  <div style="position:fixed;bottom:8mm;left:0;right:0;text-align:center;font-size:8px;color:#d1d5db">
    Vygenerováno: ${escapeHtml(today)} | DocGen
  </div>
</body>
</html>`;
}

/** Build PDF HTML for custom templates — renders the original document text with values filled in */
function buildCustomPdfHtml(template: Template, formData: Record<string, string>): string | null {
  const templateText = getCustomTemplateText(template.id);
  if (!templateText) return null;

  // Replace all {{PLACEHOLDER}} with actual values
  let filledText = templateText;
  for (const [key, value] of Object.entries(formData)) {
    filledText = filledText.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '_______________');
  }
  // Replace any remaining unfilled placeholders
  filledText = filledText.replace(/\{\{[A-Z_0-9]+\}\}/g, '_______________');

  // Convert line breaks to HTML paragraphs, preserving the original structure
  const paragraphs = filledText.split('\n').map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '<br>';
    return `<p style="margin:0 0 6px 0">${escapeHtml(trimmed)}</p>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="UTF-8">
<style>
  @page {
    size: A4;
    margin: 20mm 22mm 25mm 22mm;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #111827;
    font-size: 12px;
    line-height: 1.6;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  p { margin: 0 0 6px 0; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
  ${paragraphs}
  <div style="position:fixed;bottom:8mm;left:0;right:0;text-align:center;font-size:8px;color:#d1d5db">
    Vygenerováno: ${new Date().toLocaleDateString('cs-CZ')} | DocGen
  </div>
</body>
</html>`;
}

export function generatePDF(template: Template, formData: Record<string, string>): Promise<void> {
  return new Promise((resolve, reject) => {
    // For custom templates, use their original text layout
    const html = buildCustomPdfHtml(template, formData) || buildPdfHtml(template, formData);

    // Create hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      reject(new Error('Could not access iframe'));
      return;
    }

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    // Wait for content to render, then trigger print
    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.print();
          // Cleanup after print dialog closes
          setTimeout(() => {
            document.body.removeChild(iframe);
            resolve();
          }, 1000);
        } catch (e) {
          document.body.removeChild(iframe);
          reject(e);
        }
      }, 300);
    };

    // Fallback if onload doesn't fire
    setTimeout(() => {
      try {
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          resolve();
        }, 1000);
      } catch (e) {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        reject(e);
      }
    }, 1500);
  });
}

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

export async function downloadDocument(
  template: Template,
  formData: Record<string, string>,
  format: 'pdf' | 'docx'
): Promise<void> {
  if (format === 'pdf') {
    await generatePDF(template, formData);
  } else {
    const safeName = template.id.replace(/[^a-z0-9-]/g, '_');
    const blob = await generateDOCX(template, formData);
    downloadBlob(blob, `${safeName}.docx`);
  }
}

export async function downloadAllAsZip(
  templates: Template[],
  formData: Record<string, string>
): Promise<void> {
  const zip = new PizZip();

  for (const template of templates) {
    const safeName = template.id.replace(/[^a-z0-9-]/g, '_');

    // Generate DOCX
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
