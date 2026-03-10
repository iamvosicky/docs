'use client';

import { Activity, FileText, Upload, UserPlus, Clock } from 'lucide-react';

const mockActivity = [
  { id: 1, action: 'Vygenerován dokument', detail: 'Kupní smlouva - ABC s.r.o.', time: 'před 2 hodinami', icon: FileText, color: 'text-primary' },
  { id: 2, action: 'Nahrána šablona', detail: 'Smlouva o dílo (vlastní)', time: 'před 5 hodinami', icon: Upload, color: 'text-violet-600 dark:text-violet-400' },
  { id: 3, action: 'Pozvání uživatele', detail: 'marie@example.com', time: 'včera', icon: UserPlus, color: 'text-amber-600 dark:text-amber-400' },
];

export default function ActivityPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Aktivita</h1>
        <p className="text-xs text-muted-foreground mt-1">Protokoly a historie akcí</p>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden divide-y">
        {mockActivity.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
              <div className={`h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0`}>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.action}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                <Clock className="h-3 w-3" />
                {item.time}
              </div>
            </div>
          );
        })}

        {mockActivity.length === 0 && (
          <div className="p-10 text-center">
            <Activity className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium">Zatím žádná aktivita</p>
          </div>
        )}
      </div>
    </div>
  );
}
