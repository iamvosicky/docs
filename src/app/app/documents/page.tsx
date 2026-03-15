'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FolderOpen, Sparkles, FileText, Download, Clock } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  templateName: string;
  createdAt: string;
  status: 'completed' | 'processing' | 'failed';
}

export default function DocumentsPage() {
  const [documents] = useState<Document[]>([]);

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <div className="pt-4 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dokumenty</h1>
            <p className="text-[13px] text-muted-foreground/60 mt-1">Vygenerované dokumenty</p>
          </div>
          <Button asChild size="sm" className="rounded-xl h-9 px-4 gap-1.5 text-[13px] font-medium shadow-sm">
            <Link href="/app/generate">
              <Sparkles className="h-3.5 w-3.5" />
              Generovat
            </Link>
          </Button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-2xl bg-card p-12 text-center">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="h-7 w-7 text-blue-500/40" />
          </div>
          <h3 className="text-[15px] font-semibold mb-1.5">Zatím žádné dokumenty</h3>
          <p className="text-[13px] text-muted-foreground/60 mb-5 max-w-sm mx-auto leading-relaxed">
            Vygenerujte první dokument ze šablony.
          </p>
          <Button asChild size="sm" className="rounded-xl h-9 px-4 gap-1.5 text-[13px] font-medium">
            <Link href="/app/generate">
              <Sparkles className="h-3.5 w-3.5" />
              Generovat dokument
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left px-5 py-3.5 text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">Název</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">Šablona</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">Vytvořeno</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">Stav</th>
                <th className="text-right px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-blue-500/60" />
                      </div>
                      <span className="text-[14px] font-medium">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-muted-foreground/60">{doc.templateName}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[13px] text-muted-foreground/60">
                      {new Date(doc.createdAt).toLocaleDateString('cs-CZ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium ${
                      doc.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      doc.status === 'processing' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                      'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                      {doc.status === 'completed' ? 'Hotovo' : doc.status === 'processing' ? 'Zpracování' : 'Chyba'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {doc.status === 'completed' && (
                      <Button variant="ghost" size="sm" className="h-7 rounded-xl text-[12px] gap-1">
                        <Download className="h-3 w-3" />
                        Stáhnout
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
