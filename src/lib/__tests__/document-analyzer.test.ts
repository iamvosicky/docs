import { describe, it, expect } from "vitest";
import { analyzeDocument, reprocessTemplate } from "../document-analyzer";

describe("document-analyzer", () => {
  describe("address detection with trigger phrases", () => {
    it("detects address after 'bytem' with č.p. format", () => {
      const input =
        "Jan Novák, narozen 1. 1. 1990, bytem č.p. 102, 263 01 Obory";
      const result = analyzeDocument(input);

      expect(result.templateText).toContain("bytem {{");
      expect(result.templateText).not.toContain("263 01 Obory");
      expect(result.templateText).not.toContain("č.p. 102");

      const addressField = result.fields.find((f) => f.name.includes("address"));
      expect(addressField).toBeDefined();
      expect(addressField!.example).toContain("102");
      expect(addressField!.example).toContain("Obory");
    });

    it("detects address after 'se sídlem' with č.p. format", () => {
      const input =
        "ABC s.r.o., IČO 12345678, se sídlem č.p. 95, 261 01 Drásov";
      const result = analyzeDocument(input);

      expect(result.templateText).toContain("se sídlem {{");
      expect(result.templateText).not.toContain("261 01 Drásov");
      expect(result.templateText).not.toContain("č.p. 95");

      const addressField = result.fields.find((f) => f.name.includes("address"));
      expect(addressField).toBeDefined();
    });

    it("detects address after 's bydlištěm'", () => {
      const input =
        "Jan Novák, s bydlištěm Praha 4, Nuselská 15, 140 00 Praha";
      const result = analyzeDocument(input);

      expect(result.templateText).toContain("s bydlištěm {{");
      expect(result.templateText).not.toContain("Nuselská 15");
    });

    it("detects address after 'se sídlem na adrese'", () => {
      const input =
        "Firma XYZ a.s., se sídlem na adrese Masarykova 10, 602 00 Brno";
      const result = analyzeDocument(input);

      expect(result.templateText).toContain("se sídlem na adrese {{");
      expect(result.templateText).not.toContain("Masarykova 10");
      expect(result.templateText).not.toContain("602 00 Brno");
    });

    it("detects address after 's místem podnikání'", () => {
      const input =
        "Podnikatel Jan Dvořák, s místem podnikání Václavské náměstí 1, 110 00 Praha 1";
      const result = analyzeDocument(input);

      expect(result.templateText).toContain("s místem podnikání {{");
      expect(result.templateText).not.toContain("Václavské náměstí 1");
    });

    it("detects address after 'se sídlem v'", () => {
      const input =
        "Společnost Test s.r.o., se sídlem v Praze 5, Smíchovská 22, 150 00 Praha";
      const result = analyzeDocument(input);

      expect(result.templateText).toContain("se sídlem v {{");
      expect(result.templateText).not.toContain("Smíchovská 22");
    });
  });

  describe("role-aware address placeholders", () => {
    it("assigns buyer role when preceded by 'kupující'", () => {
      const input =
        "Kupující: Jan Novák, bytem č.p. 102, 263 01 Obory";
      const result = analyzeDocument(input);

      const addressField = result.fields.find((f) => f.name.includes("address"));
      expect(addressField).toBeDefined();
      expect(addressField!.name).toContain("buyer");
    });

    it("assigns seller role when preceded by 'prodávající'", () => {
      const input =
        "Prodávající: Firma ABC s.r.o., se sídlem č.p. 95, 261 01 Drásov";
      const result = analyzeDocument(input);

      const addressField = result.fields.find((f) => f.name.includes("address"));
      expect(addressField).toBeDefined();
      expect(addressField!.name).toContain("seller");
    });

    it("assigns company role when IČO is nearby but no explicit party role", () => {
      const input =
        "ABC s.r.o., IČO 12345678, se sídlem č.p. 95, 261 01 Drásov";
      const result = analyzeDocument(input);

      const addressField = result.fields.find((f) => f.name.includes("address"));
      expect(addressField).toBeDefined();
      expect(addressField!.name).toContain("company");
    });
  });

  describe("repeated address deduplication", () => {
    it("reuses the same placeholder for the same address appearing twice", () => {
      const input = [
        "Kupující: Jan Novák, bytem č.p. 102, 263 01 Obory",
        "Kupující Jan Novák, bytem č.p. 102, 263 01 Obory",
      ].join("\n");
      const result = analyzeDocument(input);

      // The address value should only produce one field
      const addressFields = result.fields.filter((f) => f.name.includes("address"));
      expect(addressFields.length).toBe(1);

      // Both occurrences should be replaced
      expect(result.templateText).not.toContain("263 01 Obory");
    });
  });

  describe("reprocessTemplate", () => {
    it("replaces remaining literal addresses in a template that already has some placeholders", () => {
      const templateInput = [
        "{{buyer_name}}",
        "narozen {{buyer_birth_date}}",
        "bytem č.p. 102, 263 01 Obory",
        "",
        "{{company_name}}",
        "IČ {{company_ico}}",
        "se sídlem č.p. 95, 261 01 Drásov",
      ].join("\n");

      const result = reprocessTemplate(templateInput);

      // Existing placeholders must be preserved
      expect(result.templateText).toContain("{{buyer_name}}");
      expect(result.templateText).toContain("{{buyer_birth_date}}");
      expect(result.templateText).toContain("{{company_name}}");
      expect(result.templateText).toContain("{{company_ico}}");

      // Literal addresses must be replaced
      expect(result.templateText).not.toContain("263 01 Obory");
      expect(result.templateText).not.toContain("261 01 Drásov");
      expect(result.templateText).toContain("bytem {{");
      expect(result.templateText).toContain("se sídlem {{");
    });

    it("returns no new fields if template is already fully templated", () => {
      const templateInput = [
        "{{buyer_name}}",
        "narozen {{buyer_birth_date}}",
        "bytem {{buyer_address}}",
      ].join("\n");

      const result = reprocessTemplate(templateInput);

      expect(result.fields.length).toBe(0);
      expect(result.templateText).toBe(templateInput);
    });

    it("detects remaining IČO literals in partially templated document", () => {
      const templateInput = [
        "{{company_name}}, IČO 12345678, se sídlem {{company_address}}",
      ].join("\n");

      const result = reprocessTemplate(templateInput);

      expect(result.templateText).not.toContain("12345678");
      expect(result.fields.some((f) => f.type === "ico")).toBe(true);
    });
  });

  describe("contract type detection", () => {
    it("detects purchase contract type", () => {
      const input = "KUPNÍ SMLOUVA\nKupující: Jan Novák, bytem č.p. 1, 100 00 Praha";
      const result = analyzeDocument(input);
      expect(result.contractType).toBe("purchase");
    });

    it("detects lease contract type", () => {
      const input = "NÁJEMNÍ SMLOUVA\nNájemce: Jan Novák, bytem č.p. 1, 100 00 Praha";
      const result = analyzeDocument(input);
      expect(result.contractType).toBe("lease");
    });

    it("detects employment contract type", () => {
      const input = "PRACOVNÍ SMLOUVA\nZaměstnanec: Jan Novák, bytem č.p. 1, 100 00 Praha";
      const result = analyzeDocument(input);
      expect(result.contractType).toBe("employment");
    });

    it("returns 'other' for unknown contract types", () => {
      const input = "PROTOKOL\nÚčastník: Jan Novák, bytem č.p. 1, 100 00 Praha";
      const result = analyzeDocument(input);
      expect(result.contractType).toBe("other");
    });
  });

  describe("contract party detection", () => {
    it("detects buyer and seller as separate parties in a purchase contract", () => {
      const input = [
        "KUPNÍ SMLOUVA",
        "",
        "Kupující: Jan Novák, narozen 1. 1. 1990, bytem č.p. 102, 263 01 Obory",
        '(dále jen \u201Ekupující\u201C)',
        "",
        "Prodávající: ABC s.r.o., IČO 12345678, se sídlem č.p. 95, 261 01 Drásov",
        "zastoupená jednatelem Petrem Svobodou",
        '(dále jen \u201Eprodávající\u201C)',
      ].join("\n");

      const result = analyzeDocument(input);

      // Should have buyer, seller, and representative as separate parties
      const roles = result.parties.map((p) => p.role);
      expect(roles).toContain("buyer");
      expect(roles).toContain("seller");
      expect(new Set(roles).size).toBe(roles.length); // no duplicates

      // Buyer should have name, birth date, address grouped
      const buyer = result.parties.find((p) => p.role === "buyer")!;
      expect(buyer.label).toBe("Kupující");
      expect(buyer.attributes.address).toBeDefined();
      expect(buyer.fieldNames.length).toBeGreaterThanOrEqual(2);

      // Seller should have company info grouped
      const seller = result.parties.find((p) => p.role === "seller")!;
      expect(seller.label).toBe("Prodávající");
      expect(seller.attributes.address).toBeDefined();

      // Representative should be a separate group, not merged into seller
      const rep = result.parties.find((p) => p.role === "representative");
      if (rep) {
        expect(rep.label).toBe("Zástupce");
      }
    });

    it("never creates duplicate buyer roles", () => {
      const input = [
        "KUPNÍ SMLOUVA",
        "",
        "Kupující: Jan Novák, bytem č.p. 102, 263 01 Obory",
        "Kupující Jan Novák, bytem č.p. 102, 263 01 Obory",
      ].join("\n");

      const result = analyzeDocument(input);

      const buyerParties = result.parties.filter((p) => p.role === "buyer");
      expect(buyerParties.length).toBe(1);
    });

    it("groups all attributes under the correct party", () => {
      const input = [
        "Kupující: Jan Novák, narozen 15.3.1985, bytem Národní 10, 110 00 Praha 1",
      ].join("\n");

      const result = analyzeDocument(input);

      const buyer = result.parties.find((p) => p.role === "buyer");
      expect(buyer).toBeDefined();
      expect(buyer!.attributes.name || buyer!.fieldNames.some(f => f.includes("name"))).toBeTruthy();
      expect(buyer!.attributes.address || buyer!.fieldNames.some(f => f.includes("address"))).toBeTruthy();
    });

    it("merges company role into seller for purchase contracts", () => {
      const input = [
        "KUPNÍ SMLOUVA",
        "",
        "ABC s.r.o., IČO 12345678, se sídlem č.p. 95, 261 01 Drásov",
      ].join("\n");

      const result = analyzeDocument(input);

      // "company" should be merged into "seller" for purchase contracts
      const companyParties = result.parties.filter((p) => p.role === "company");
      expect(companyParties.length).toBe(0);

      const sellerParties = result.parties.filter((p) => p.role === "seller");
      expect(sellerParties.length).toBe(1);
    });
  });

  describe("full document analysis", () => {
    it("handles a complete Czech legal document with buyer and seller", () => {
      const input = [
        "KUPNÍ SMLOUVA",
        "",
        "Kupující: Jan Novák, narozen 1. 1. 1990, bytem č.p. 102, 263 01 Obory",
        '(dále jen \u201Ekupující\u201C)',
        "",
        "Prodávající: ABC s.r.o., IČO 12345678, se sídlem č.p. 95, 261 01 Drásov",
        "zastoupená jednatelem Petrem Svobodou",
        '(dále jen \u201Eprodávající\u201C)',
      ].join("\n");

      const result = analyzeDocument(input);

      // Addresses must not remain literal
      expect(result.templateText).not.toContain("263 01 Obory");
      expect(result.templateText).not.toContain("261 01 Drásov");

      // Name should be detected
      expect(result.templateText).not.toContain("Jan Novák");

      // IČO should be detected
      expect(result.templateText).not.toContain("12345678");

      // Birth date should be detected
      expect(result.templateText).not.toContain("1. 1. 1990");

      // Should have address fields
      const addressFields = result.fields.filter((f) => f.name.includes("address"));
      expect(addressFields.length).toBeGreaterThanOrEqual(2);

      // Contract type should be purchase
      expect(result.contractType).toBe("purchase");

      // Should have structured parties (buyer, seller, + optional representative)
      expect(result.parties.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("person name validation", () => {
    it("rejects Czech city names as person names", () => {
      const input = "zastoupen jednatelem v Kutné Hoře, bytem č.p. 102, 263 01 Obory";
      const result = analyzeDocument(input);

      // "Kutné Hoře" must NOT be detected as a person name
      const nameFields = result.fields.filter((f) => f.name.includes("name"));
      for (const field of nameFields) {
        expect(field.example).not.toContain("Kutné");
        expect(field.example).not.toContain("Hoře");
      }
    });

    it("rejects location-like values preceded by address context words", () => {
      const input = "jednatel, bytem Praha 6, Slavíčkova 372/2, 160 00 Praha";
      const result = analyzeDocument(input);

      const nameFields = result.fields.filter((f) => f.name.includes("name"));
      for (const field of nameFields) {
        expect(field.example).not.toContain("Praha");
      }
    });

    it("rejects declension variants of already-detected names", () => {
      const input = [
        "Kupující: Štěpán Černohorský, bytem č.p. 102, 263 01 Obory",
        "zastoupen Štěpánem Černohorským",
      ].join("\n");
      const result = analyzeDocument(input);

      // Should only detect one name field for the buyer, not a second declension variant
      const nameFields = result.fields.filter((f) => f.name.includes("name") && f.type === "text");
      const nameValues = nameFields.map((f) => f.example);
      // Should not have both "Štěpán Černohorský" AND "Štěpánem Černohorským"
      expect(nameFields.length).toBeLessThanOrEqual(1);
    });

    it("accepts valid person names", () => {
      const input = "Kupující: Gabriela Černá, bytem č.p. 1, 100 00 Praha";
      const result = analyzeDocument(input);

      const nameField = result.fields.find((f) => f.name.includes("name") && f.type === "text");
      expect(nameField).toBeDefined();
      expect(nameField!.example).toBe("Gabriela Černá");
    });
  });

  describe("representative grouping", () => {
    it("keeps representative as a separate group from buyer", () => {
      const input = [
        "KUPNÍ SMLOUVA",
        "",
        "Kupující: Jan Novák, bytem č.p. 102, 263 01 Obory",
        "",
        "Prodávající: ABC s.r.o., IČO 12345678, se sídlem č.p. 95, 261 01 Drásov",
        "zastoupená jednatelem Petrem Svobodou",
      ].join("\n");
      const result = analyzeDocument(input);

      // Representative should be a separate group in the UI
      const repFields = result.fields.filter((f) => f.entity === "representative" || f.group === "Zástupce");
      const buyerFields = result.fields.filter((f) => f.entity === "buyer" || f.group === "Kupující");

      // Representative fields should NOT be in the buyer group
      for (const rf of repFields) {
        expect(rf.group).not.toBe("Kupující");
      }
    });

    it("keeps shareholder as a separate group", () => {
      const input = [
        "KUPNÍ SMLOUVA",
        "Kupující: Jan Novák, bytem č.p. 1, 100 00 Praha",
        "Akcionář společnosti s vkladem 10.000 Kč",
      ].join("\n");
      const result = analyzeDocument(input);

      const shareholderFields = result.fields.filter((f) => f.entity === "shareholder");
      for (const sf of shareholderFields) {
        expect(sf.group).not.toBe("Kupující");
      }
    });
  });
});
