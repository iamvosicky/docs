"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Loader2, ChevronDown, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface AresCompanyData {
  ico: string;
  name: string;
  address: string;
  dic?: string;
  executives: AresExecutive[];
}

export interface AresExecutive {
  name: string;
  position: string;
  birthDate?: string;
  address?: string;
}

interface AresLookupProps {
  ico: string;
  /** Called when company basic data is fetched — fills name, address, dic */
  onCompanyData: (data: Omit<AresCompanyData, "executives">) => void;
  /** Called when user selects an executive as signatory */
  onSignatorySelect: (executive: AresExecutive) => void;
}

async function fetchAresData(ico: string): Promise<AresCompanyData> {
  const cleanIco = ico.replace(/\s/g, "").padStart(8, "0");

  const res = await fetch(
    `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${cleanIco}`,
    { headers: { Accept: "application/json" } }
  );

  if (!res.ok) {
    if (res.status === 404) throw new Error("Subjekt s tímto IČO nebyl nalezen.");
    throw new Error("Chyba při komunikaci s ARES. Zkuste to prosím znovu.");
  }

  const data = await res.json();

  // Build address string from structured address
  const sidlo = data.sidlo || {};
  const addressParts = [
    sidlo.nazevUlice && sidlo.cisloDomovni
      ? `${sidlo.nazevUlice} ${sidlo.cisloDomovni}${sidlo.cisloOrientacni ? `/${sidlo.cisloOrientacni}` : ""}`
      : null,
    sidlo.nazevObce,
    sidlo.psc ? `${sidlo.psc}`.replace(/(\d{3})(\d{2})/, "$1 $2") : null,
  ].filter(Boolean);

  const address = sidlo.textovaAdresa || addressParts.join(", ");

  // Extract executives from statutory organ
  const executives: AresExecutive[] = [];
  const organ = data.statutarniOrgan;
  if (organ) {
    const members = organ.clenove || organ.statutarniOrganClenove || [];
    members.forEach((member: any) => {
      const jmeno = [member.jmeno, member.prijmeni].filter(Boolean).join(" ");
      const funkce = member.clenstvi?.funkce?.nazev || member.funkce || "Jednatel";
      if (jmeno) {
        executives.push({
          name: jmeno,
          position: funkce,
          birthDate: member.datumNarozeni,
          address: member.adresaPobytu?.textovaAdresa || member.bydliste?.textovaAdresa,
        });
      }
    });
  }

  return {
    ico: data.ico || cleanIco,
    name: data.obchodniJmeno || "",
    address,
    dic: data.dic,
    executives,
  };
}

export function AresLookup({ ico, onCompanyData, onSignatorySelect }: AresLookupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [executives, setExecutives] = useState<AresExecutive[]>([]);
  const [fetched, setFetched] = useState(false);

  const handleLookup = async () => {
    const cleanIco = ico.replace(/\s/g, "");
    if (!cleanIco || cleanIco.length < 6) {
      toast.error("Zadejte platné IČO (min. 6 číslic).");
      return;
    }

    setIsLoading(true);
    setFetched(false);
    try {
      const data = await fetchAresData(cleanIco);
      onCompanyData({ ico: data.ico, name: data.name, address: data.address, dic: data.dic });
      setExecutives(data.executives);
      setFetched(true);
      if (data.executives.length === 0) {
        toast.success("Údaje společnosti doplněny. Statutární orgán nenalezen.");
      } else {
        toast.success(`Doplněno z ARES. Nalezeno ${data.executives.length} člen${data.executives.length === 1 ? "" : "ů"} statutárního orgánu.`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Chyba při vyhledávání v ARES.");
    } finally {
      setIsLoading(false);
    }
  };

  const icoMissing = !ico || ico.replace(/\s/g, "").length < 6;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex flex-col gap-0.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLookup}
          disabled={isLoading || icoMissing}
          className="gap-1.5 text-xs"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Search className="h-3.5 w-3.5" />
          )}
          Vyhledat v ARES
        </Button>
        {icoMissing && (
          <span className="text-[11px] text-muted-foreground leading-tight">
            Nejprve vyplňte IČO výše
          </span>
        )}
      </div>

      {fetched && executives.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="secondary" size="sm" className="gap-1.5 text-xs">
              <User className="h-3.5 w-3.5" />
              Doplnit podepisujícího
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Statutární orgán — vyberte podepisujícího
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {executives.map((exec, i) => (
              <DropdownMenuItem
                key={i}
                onClick={() => {
                  onSignatorySelect(exec);
                  toast.success(`Podepisující doplněn: ${exec.name}`);
                }}
                className="flex flex-col items-start gap-0.5 py-2"
              >
                <span className="font-medium">{exec.name}</span>
                <span className="text-xs text-muted-foreground">{exec.position}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {fetched && executives.length === 0 && (
        <Badge variant="secondary" className="text-xs">
          Statutární orgán nenalezen
        </Badge>
      )}
    </div>
  );
}
