'use client';

import { FileText, Upload, UserPlus, Clock } from 'lucide-react';

const mockActivity = [
  { id: 1, action: 'Vygenerován dokument', detail: 'Kupní smlouva - ABC s.r.o.', time: 'před 2 hodinami', icon: FileText, gradient: 'from-blue-500/10 to-cyan-500/10', iconColor: 'text-blue-500/70' },
  { id: 2, action: 'Nahrána šablona', detail: 'Smlouva o dílo (vlastní)', time: 'před 5 hodinami', icon: Upload, gradient: 'from-violet-500/10 to-purple-500/10', iconColor: 'text-violet-500/70' },
  { id: 3, action: 'Pozvání uživatele', detail: 'marie@example.com', time: 'včera', icon: UserPlus, gradient: 'from-amber-500/10 to-orange-500/10', iconColor: 'text-amber-500/70' },
];

export default function ActivityPage() {
  return (
    <div className="max-w-4xl mx-auto pb-16">
      <div className="pt-4 pb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Aktivita</h1>
        <p className="text-[13px] text-muted-foreground/60 mt-1">Historie akcí</p>
      </div>

      <div className="rounded-2xl bg-card divide-y divide-border/50">
        {mockActivity.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-center gap-4 px-5 py-4 hover:bg-accent/30 transition-colors first:rounded-t-2xl last:rounded-b-2xl">
              <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0`}>
                <Icon className={`h-4 w-4 ${item.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium">{item.action}</p>
                <p className="text-[12px] text-muted-foreground/50">{item.detail}</p>
              </div>
              <span className="text-[12px] text-muted-foreground/40 flex items-center gap-1 shrink-0">
                <Clock className="h-3 w-3" />
                {item.time}
              </span>
            </div>
          );
        })}
      </div>

      {mockActivity.length === 0 && (
        <div className="rounded-2xl bg-card p-12 text-center">
          <h3 className="text-[15px] font-semibold mb-1.5">Žádná aktivita</h3>
          <p className="text-[13px] text-muted-foreground/60">Zde se zobrazí protokoly akcí.</p>
        </div>
      )}
    </div>
  );
}
