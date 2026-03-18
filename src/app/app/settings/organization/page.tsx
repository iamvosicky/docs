'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { IcoLookup, type IcoLookupResult } from '@/components/ico-lookup';

export default function OrganizationPage() {
  const [orgName, setOrgName] = useState('');
  const [ico, setIco] = useState('');
  const [dic, setDic] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');

  const handleAresResult = (result: IcoLookupResult) => {
    const c = result.company;
    setOrgName(result.overrides.name || c.name);
    setIco(c.ico);
    setDic(result.overrides.dic || c.dic || '');
    setAddress(result.overrides.address || c.address);
    setCity(c.addressParts.city || '');
    setZip(c.addressParts.postalCode?.replace(/\s/g, '') || '');
  };

  const handleSave = () => {
    toast.success('Údaje organizace uloženy');
  };

  return (
    <div className="max-w-2xl mx-auto pb-16">
      <div className="pt-4 pb-8">
        <Link
          href="/app/settings"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-3 w-3" />
          Nastavení
        </Link>
        <h1 className="text-[22px] font-bold tracking-tight">Organizace</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Údaje o firmě a fakturační informace</p>
      </div>

      {/* ARES Lookup */}
      <div className="rounded-xl bg-card border border-border/50 p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="text-[14px] font-medium">Načíst údaje z ARES</span>
        </div>
        <IcoLookup
          onResult={handleAresResult}
          onClear={() => {
            setOrgName('');
            setIco('');
            setDic('');
            setAddress('');
            setCity('');
            setZip('');
          }}
          compact
        />
      </div>

      {/* Manual fields */}
      <div className="rounded-xl bg-card border border-border/50 p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Název firmy</Label>
            <Input value={orgName} onChange={e => setOrgName(e.target.value)} className="h-10 rounded-xl mt-1.5" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">IČO</Label>
            <Input value={ico} onChange={e => setIco(e.target.value)} className="h-10 rounded-xl mt-1.5" maxLength={8} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">DIČ</Label>
            <Input value={dic} onChange={e => setDic(e.target.value)} className="h-10 rounded-xl mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Adresa</Label>
            <Input value={address} onChange={e => setAddress(e.target.value)} className="h-10 rounded-xl mt-1.5" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Město</Label>
            <Input value={city} onChange={e => setCity(e.target.value)} className="h-10 rounded-xl mt-1.5" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">PSČ</Label>
            <Input value={zip} onChange={e => setZip(e.target.value)} className="h-10 rounded-xl mt-1.5" maxLength={5} />
          </div>
        </div>

        <div className="pt-3 border-t border-border/40 flex justify-end">
          <Button onClick={handleSave} className="rounded-xl h-9 px-4 gap-1.5 text-[13px]">
            <Save className="h-3.5 w-3.5" />
            Uložit
          </Button>
        </div>
      </div>
    </div>
  );
}
