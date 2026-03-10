const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

// Create templates directory if it doesn't exist
const templatesDir = path.join(__dirname, '../public/templates');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Function to create a simple DOCX template
function createTemplate(templateName, title, placeholders) {
  // Create a simple XML content for a DOCX file
  const content = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<?mso-application progid="Word.Document"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:rPr>
          <w:b/>
          <w:sz w:val="36"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="36"/>
        </w:rPr>
        <w:t>${title}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:jc w:val="right"/>
      </w:pPr>
      <w:r>
        <w:t>V Praze dne {DATUM_PODPISU}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:rPr>
          <w:b/>
          <w:sz w:val="28"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="28"/>
        </w:rPr>
        <w:t>I. Smluvní strany</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr>
          <w:b/>
        </w:rPr>
        <w:t>Kupující:</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>{KUP_JMENO}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Sídlo: {KUP_ADRESA}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>IČO: {KUP_ICO}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>DIČ: {KUP_DIC}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Zastoupený: {KUP_ZASTUPCE}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr>
          <w:b/>
        </w:rPr>
        <w:t>Prodávající:</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>{PROD_JMENO}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Sídlo: {PROD_ADRESA}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>IČO: {PROD_ICO}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>DIČ: {PROD_DIC}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Zastoupený: {PROD_ZASTUPCE}</w:t>
      </w:r>
    </w:p>
    ${placeholders.map(placeholder => `
    <w:p>
      <w:r>
        <w:t>${placeholder.label}: {${placeholder.key}}</w:t>
      </w:r>
    </w:p>`).join('')}
    <w:p>
      <w:pPr>
        <w:rPr>
          <w:b/>
          <w:sz w:val="28"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="28"/>
        </w:rPr>
        <w:t>Závěrečná ustanovení</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Tato smlouva nabývá platnosti a účinnosti dnem podpisu oběma smluvními stranami.</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Smlouva je vyhotovena ve dvou stejnopisech, z nichž každá smluvní strana obdrží po jednom vyhotovení.</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Smluvní strany prohlašují, že si smlouvu přečetly, s jejím obsahem souhlasí a na důkaz toho připojují své podpisy.</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:spacing w:before="720"/>
      </w:pPr>
    </w:p>
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:r>
        <w:t>________________________</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:r>
        <w:t>Kupující</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:spacing w:before="720"/>
      </w:pPr>
    </w:p>
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:r>
        <w:t>________________________</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:r>
        <w:t>Prodávající</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

  // Write the content to a file
  const filePath = path.join(templatesDir, `${templateName}.xml`);
  fs.writeFileSync(filePath, content);
  
  console.log(`Created template: ${filePath}`);
}

// Create templates for different contract types
createTemplate('smlouva_o_dilo_template', 'SMLOUVA O DÍLO', [
  { key: 'PREDMET_DILA', label: 'Předmět díla' },
  { key: 'SPECIFIKACE_DILA', label: 'Specifikace díla' },
  { key: 'CENA', label: 'Cena díla' },
  { key: 'SPLATNOST', label: 'Splatnost faktury (dny)' },
  { key: 'TERMIN_DOKONCENI', label: 'Termín dokončení' },
  { key: 'ZARUCNI_DOBA', label: 'Záruční doba (měsíce)' }
]);

createTemplate('kupni_smlouva_template', 'KUPNÍ SMLOUVA', [
  { key: 'PREDMET_PRODEJE', label: 'Předmět prodeje' },
  { key: 'SPECIFIKACE_PREDMETU', label: 'Specifikace předmětu' },
  { key: 'KUPNI_CENA', label: 'Kupní cena' },
  { key: 'SPLATNOST', label: 'Splatnost faktury (dny)' },
  { key: 'TERMIN_DODANI', label: 'Termín dodání' },
  { key: 'ZARUCNI_DOBA', label: 'Záruční doba (měsíce)' }
]);

createTemplate('dohoda_o_provedeni_prace_template', 'DOHODA O PROVEDENÍ PRÁCE', [
  { key: 'DRUH_PRACE', label: 'Druh práce' },
  { key: 'ROZSAH_PRACE', label: 'Rozsah práce (hodiny)' },
  { key: 'ODMENA', label: 'Odměna (Kč/hod)' },
  { key: 'TERMIN_ZAHAJENI', label: 'Termín zahájení' },
  { key: 'TERMIN_UKONCENI', label: 'Termín ukončení' }
]);

console.log('All templates created successfully!');
