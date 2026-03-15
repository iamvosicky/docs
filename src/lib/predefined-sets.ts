/**
 * Predefined document set templates.
 * These are starter packs that users can one-click create.
 */
export interface PredefinedSet {
  id: string;
  name: string;
  description: string;
  /** Built-in template IDs from template-schemas.ts */
  templateIds: string[];
}

export const predefinedSets: PredefinedSet[] = [
  {
    id: "zalozeni-as",
    name: "Založení a.s.",
    description: "Dokumenty pro založení akciové společnosti",
    templateIds: [
      "stanovy",
      "prohlaseni-spravce-vkladu",
      "souhlas-umisteni-sidla",
      "affidavit-statutar",
      "poa-zalozeni-statutar",
    ],
  },
  {
    id: "zalozeni-sro",
    name: "Založení s.r.o.",
    description: "Dokumenty pro založení společnosti s ručením omezeným",
    templateIds: [
      "stanovy",
      "prohlaseni-spravce-vkladu",
      "souhlas-umisteni-sidla",
      "affidavit-sr",
      "poa-zalozeni-statutar",
    ],
  },
  {
    id: "prevod-podilu",
    name: "Převod obchodního podílu",
    description: "Smlouva o převodu a související dokumenty",
    templateIds: [
      "kupni-smlouva",
      "poa-shareholder",
      "poa-statutar",
    ],
  },
  {
    id: "zamestnanecka-dok",
    name: "Zaměstnanecká dokumentace",
    description: "Pracovní smlouva a dohody",
    templateIds: [
      "smlouva-o-dilo",
      "dohoda-o-provedeni-prace",
    ],
  },
  {
    id: "corporate-governance",
    name: "Corporate governance",
    description: "Plné moci a prohlášení statutárních orgánů",
    templateIds: [
      "poa-rt",
      "poa-statutar",
      "affidavit-statutar",
      "rozhodnuti-umisteni-sidla",
    ],
  },
];
