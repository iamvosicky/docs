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

  describe("full document analysis", () => {
    it("handles a complete Czech legal document with buyer and company", () => {
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
    });
  });
});
