'use client';

import { useState, useEffect } from 'react';
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
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Dokumenty</h1>
          <p className="text-xs text-muted-foreground mt-1">Přehled vygenerovaných dokumentů</p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href="/app/generate">
            <Sparkles className="h-4 w-4 mr-1.5" />
            Generovat dokument
          </Link>
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center">
          <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <h3 className="text-base font-medium mb-1">Zatím nemáte žádné dokumenty</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
            Vygenerujte svůj první dokument ze šablony a najdete ho zde.
          </p>
          <Button asChild className="rounded-xl">
            <Link href="/app/generate">
              <Sparkles className="h-4 w-4 mr-1.5" />
              Vygenerovat první dokument
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Název</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Šablona</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Vytvořeno</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Stav</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{doc.templateName}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(doc.createdAt).toLocaleDateString('cs-CZ')}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium ${
                        doc.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        doc.status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {doc.status === 'completed' ? 'Hotovo' : doc.status === 'processing' ? 'Zpracování' : 'Chyba'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {doc.status === 'completed' && (
                        <Button variant="ghost" size="sm" className="h-7 rounded-lg text-xs">
                          <Download className="h-3.5 w-3.5 mr-1" />
                          Stáhnout
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
