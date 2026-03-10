'use client';

import { useParams } from 'next/navigation';
import { getTemplate } from '@/lib/template-schemas';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, ArrowLeft, ArrowRight } from 'lucide-react';

export default function TemplatePage() {
  const params = useParams();
  const id = params?.id as string;
  const template = getTemplate(id);

  if (!template) {
    return (
      <div className="text-center py-16">
        <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Šablona nenalezena</h2>
        <p className="text-sm text-muted-foreground mb-6">Šablona s ID &ldquo;{id}&rdquo; neexistuje.</p>
        <Button asChild className="rounded-xl">
          <Link href="/app/templates">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Zpět na šablony
          </Link>
        </Button>
      </div>
    );
  }

  const fields = Object.entries(template.schema.properties);
  const required = new Set(template.schema.required);

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/app/templates" className="hover:text-foreground transition-colors">Šablony</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{template.name}</span>
      </div>

      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">{template.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b bg-muted/30">
          <span className="text-sm font-medium">Pole šablony ({fields.length})</span>
        </div>
        <div className="divide-y">
          {fields.map(([key, prop]) => (
            <div key={key} className="flex items-center gap-3 px-5 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{prop.title}</p>
                <code className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{`{{${key}}}`}</code>
              </div>
              {required.has(key) && (
                <span className="text-[10px] text-destructive font-medium">Povinné</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" asChild className="rounded-xl">
          <Link href="/app/templates">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Zpět
          </Link>
        </Button>
        <Button asChild className="rounded-xl">
          <Link href={`/app/generate?template=${template.id}`}>
            Použít šablonu
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
