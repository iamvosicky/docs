"use client";

import { TemplateCatalog } from "@/components/template-catalog";
import { HomeQuickButtons } from "@/components/home-quick-buttons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import {
  ChevronDown, FileText, ArrowRight,
  FolderOpen, Plus, Upload,
  BookOpen, Trash2, Calendar
} from "lucide-react";
import { useState, useEffect } from "react";
import { getAllTemplates, getCustomTemplates, deleteCustomTemplate, type CustomTemplate } from "@/lib/template-schemas";
import { useCases } from "@/components/use-case-shortcuts";
import { toast } from "sonner";

// ─── Landing page for unauthenticated users ───
function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="hero-gradient relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-36 pb-10 sm:pb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-5 sm:mb-6">
              Právní dokumenty
              <br />
              <span className="bg-gradient-to-r from-primary to-[oklch(0.6_0.2_310)] bg-clip-text text-transparent">
                bez komplikací
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10">
              Vyplňte údaje jednou. Systém připraví vše ostatní.
            </p>

            <Button asChild size="lg" className="rounded-xl px-10 h-13 text-base">
              <Link href="/login">
                Začít zdarma
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Use cases ── */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-center mb-4">
            Vyberete situaci, my připravíme dokumenty
          </h2>
          <p className="text-muted-foreground text-center text-base sm:text-lg max-w-xl mx-auto mb-14 sm:mb-20">
            Kompletní sady v souladu s českým právem.
          </p>

          <HomeQuickButtons />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-24 sm:pb-36">
        <div className="text-center">
          <Button asChild size="lg" className="rounded-xl px-10 h-13 text-base">
            <Link href="/login">
              Přihlásit se a začít
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary to-[oklch(0.6_0.2_310)] flex items-center justify-center">
                <FileText className="h-3 w-3 text-white" />
              </div>
              <span className="font-medium text-foreground">DocGen</span>
            </div>
            <p>&copy; 2026 DocGen</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Dashboard for authenticated users ───
function Dashboard() {
  const { user } = useAuth();
  const [showTemplates, setShowTemplates] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Dobré ráno" : hour < 18 ? "Dobrý den" : "Dobrý večer";

  const allTemplates = getAllTemplates();

  useEffect(() => {
    setCustomTemplates(getCustomTemplates());
  }, []);

  const handleDeleteCustom = (id: string, name: string) => {
    deleteCustomTemplate(id);
    setCustomTemplates(getCustomTemplates());
    toast.success(`Šablona "${name}" smazána`);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b bg-gradient-to-b from-primary/[0.03] to-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{greeting},</p>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {user?.name || "uživateli"}
                </h1>
              </div>

              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{allTemplates.length}</p>
                    <p className="text-xs">šablon</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <FolderOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{useCases.length}</p>
                    <p className="text-xs">sad dokumentů</p>
                  </div>
                </div>
                {customTemplates.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <Upload className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{customTemplates.length}</p>
                      <p className="text-xs">vlastních</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">

          {/* Quick actions */}
          <section>
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary to-primary/30" />
              <h2 className="text-lg sm:text-xl font-bold">Rychlé akce</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Link
                href="#use-cases"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('use-cases')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group rounded-2xl border bg-card p-4 sm:p-5 hover-lift gradient-border block transition-colors active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base leading-tight">Nový dokument</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Vyberte sadu nebo šablonu</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/upload"
                className="group rounded-2xl border bg-card p-4 sm:p-5 hover-lift gradient-border block transition-colors active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base leading-tight">Nahrát dokument</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Vytvořit šablonu z DOCX</p>
                  </div>
                </div>
              </Link>

              <button
                onClick={() => {
                  document.getElementById('all-templates')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group rounded-2xl border bg-card p-4 sm:p-5 hover-lift gradient-border block transition-colors active:scale-[0.98] text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base leading-tight">Katalog šablon</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{allTemplates.length} připravených šablon</p>
                  </div>
                </div>
              </button>
            </div>
          </section>

          {/* Use cases */}
          <section id="use-cases">
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary to-primary/30" />
              <div>
                <h2 className="text-lg sm:text-xl font-bold">Sady dokumentů</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Vyberte životní situaci a vygenerujte kompletní sadu</p>
              </div>
            </div>

            <HomeQuickButtons />
          </section>

          {/* Custom templates */}
          {customTemplates.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-500 to-violet-500/30" />
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold">Vlastní šablony</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">Šablony vytvořené z nahraných dokumentů</p>
                  </div>
                </div>
                <Link
                  href="/upload"
                  className="text-xs sm:text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Přidat</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {customTemplates.map((ct) => (
                  <div
                    key={ct.id}
                    className="group relative flex flex-col rounded-2xl border bg-card p-4 sm:p-5 hover-lift gradient-border"
                  >
                    <button
                      onClick={() => handleDeleteCustom(ct.id, ct.name)}
                      className="absolute top-3 right-3 h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                      title="Smazat šablonu"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Upload className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="min-w-0 pr-6">
                        <h3 className="font-semibold text-base leading-tight mb-1">{ct.name}</h3>
                        {ct.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                            {ct.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-muted-foreground">
                      <span className="tag-pill inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium">
                        <FileText className="h-3 w-3" />
                        {ct.fields.length} poli
                      </span>
                      <span className="tag-pill inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium">
                        <FolderOpen className="h-3 w-3" />
                        {ct.groups.length} skupin
                      </span>
                      {ct.createdAt && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60">
                          <Calendar className="h-3 w-3" />
                          {new Date(ct.createdAt).toLocaleDateString('cs-CZ')}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto">
                      <Button asChild className="w-full rounded-xl group/btn" size="sm">
                        <Link href={`/generate?template=custom:${ct.id}`}>
                          Použít šablonu
                          <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover/btn:translate-x-0.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Individual templates */}
          <section id="all-templates">
            <button
              onClick={() => {
                const el = document.getElementById('templates-content');
                if (el) el.classList.toggle('hidden');
              }}
              className="w-full flex items-center justify-between group cursor-pointer mb-5 sm:mb-6"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-gradient-to-b from-muted-foreground/30 to-muted-foreground/10" />
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground/80 group-hover:text-foreground transition-colors">
                    Jednotlivé šablony
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Nebo si vyberte konkrétní dokument
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ChevronDown className="h-5 w-5 transition-transform duration-300" />
              </div>
            </button>

            <div id="templates-content" className="hidden animate-in fade-in slide-in-from-top-2 duration-300">
              <TemplateCatalog />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

// ─── Main page component ───
export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/app');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4 text-center">
          <div className="h-10 w-10 rounded-xl bg-muted mx-auto" />
          <div className="h-4 w-32 bg-muted rounded-lg mx-auto" />
        </div>
      </div>
    );
  }

  return <LandingPage />;
}
