'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { ArrowLeft, Plus, Shield, User, Mail, MoreHorizontal, Trash2 } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

type Role = 'admin' | 'member';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  isCurrentUser?: boolean;
}

export default function TeamPage() {
  const { user } = useUser();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  // Mock team data — in production this would come from API
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: user?.fullName || 'Aktuální uživatel',
      email: user?.primaryEmailAddress?.emailAddress || 'user@example.com',
      role: 'admin',
      isCurrentUser: true,
    },
  ]);

  const handleInvite = () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      toast.error('Zadejte platný email');
      return;
    }
    setMembers(prev => [...prev, {
      id: crypto.randomUUID(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: 'member',
    }]);
    toast.success(`Pozvánka odeslána na ${inviteEmail}`);
    setInviteEmail('');
    setInviteOpen(false);
  };

  const handleChangeRole = (id: string, role: Role) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m));
    toast.success('Role změněna');
  };

  const handleRemove = (id: string, name: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    toast.success(`${name} odstraněn`);
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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight">Tým</h1>
            <p className="text-[13px] text-muted-foreground mt-1">Správa členů a přístupových práv</p>
          </div>
          <Button onClick={() => setInviteOpen(true)} className="rounded-xl h-9 px-3.5 gap-1.5 text-[13px]">
            <Plus className="h-3.5 w-3.5" />
            Pozvat
          </Button>
        </div>
      </div>

      {/* Roles explanation */}
      <div className="rounded-xl bg-muted/30 border border-border/30 p-4 mb-4 flex gap-6 text-[12px]">
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span><strong className="text-foreground">Admin</strong> — plný přístup, správa týmu a fakturace</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          <span><strong className="text-foreground">Člen</strong> — práce s dokumenty a sadami</span>
        </div>
      </div>

      {/* Members list */}
      <div className="rounded-xl bg-card border border-border/50 divide-y divide-border/40">
        {members.map(member => (
          <div key={member.id} className="flex items-center gap-4 px-5 py-4">
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
              <span className="text-[12px] font-medium text-muted-foreground">
                {member.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-medium text-foreground truncate">{member.name}</p>
                {member.isCurrentUser && (
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Vy</span>
                )}
              </div>
              <p className="text-[12px] text-muted-foreground truncate">{member.email}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                member.role === 'admin'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {member.role === 'admin' ? 'Admin' : 'Člen'}
              </span>
              {!member.isCurrentUser && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-accent transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 rounded-xl">
                    <DropdownMenuItem
                      className="rounded-lg text-[13px] gap-2 cursor-pointer"
                      onClick={() => handleChangeRole(member.id, member.role === 'admin' ? 'member' : 'admin')}
                    >
                      <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                      {member.role === 'admin' ? 'Změnit na Člena' : 'Změnit na Admina'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="rounded-lg text-[13px] gap-2 cursor-pointer text-destructive focus:text-destructive"
                      onClick={() => handleRemove(member.id, member.name)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Odebrat
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Pozvat člena</DialogTitle>
          </DialogHeader>
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
              <Input
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="kolega@firma.cz"
                type="email"
                className="h-10 rounded-xl pl-10"
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') handleInvite(); }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Nový člen obdrží pozvánku emailem a bude přidán jako Člen. Roli můžete změnit později.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setInviteOpen(false)}>Zrušit</Button>
            <Button className="rounded-xl" onClick={handleInvite}>Odeslat pozvánku</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
