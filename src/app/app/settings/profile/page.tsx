'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useUser();
  const [name, setName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || '');

  const handleSave = () => {
    toast.success('Profil uložen');
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
        <h1 className="text-[22px] font-bold tracking-tight">Profil</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Osobní údaje a přihlašovací informace</p>
      </div>

      <div className="rounded-xl bg-card border border-border/50 p-6 space-y-5">
        <div>
          <Label className="text-xs text-muted-foreground">Jméno</Label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            className="h-10 rounded-xl mt-1.5"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Email</Label>
          <Input
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
            className="h-10 rounded-xl mt-1.5"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Heslo</Label>
          <Input
            type="password"
            placeholder="••••••••"
            className="h-10 rounded-xl mt-1.5"
            disabled
          />
          <p className="text-[11px] text-muted-foreground mt-1">Změna hesla bude dostupná brzy.</p>
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
