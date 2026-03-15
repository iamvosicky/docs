"use client";

import { TemplateCatalog } from "@/components/template-catalog";
import { HomeQuickButtons } from "@/components/home-quick-buttons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import {
  ChevronDown, FileText, ArrowRight, CheckCircle2,
  FolderOpen, Plus, Upload, Zap, Shield, Download,
  BookOpen, Trash2, Calendar
} from "lucide-react";
import { useState, useEffect } from "react";
import { getAllTemplates, getCustomTemplates, deleteCustomTemplate, type CustomTemplate } from "@/lib/template-schemas";
import { useCases } from "@/components/use-case-shortcuts";
import { toast } from "sonner";

// ─── Landing page for unauthenticated users ───
function LandingPage() {
  const allTemplates = getAllTemplates();

  return (
    <div className="min-h-screen landing-dark bg-[#0a0a0f] text-white">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,oklch(0.45_0.18_265/0.15),transparent_70%)] pointer-events-none" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,oklch(0.5_0.2_290/0.08),transparent_70%)] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-32 pb-8 sm:pb-12 relative">
          {/* Nav hint */}
          <div className="flex justify-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm text-white/60">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
              Právní dokumenty nové generace
            </div>
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-6xl lg:text-[5.5rem] font-bold tracking-tight mb-6 sm:mb-8 leading-[1.05]">
              Připravte si právní
              <br />
              dokumenty{" "}
              <span className="italic font-serif bg-gradient-to-r from-violet-300 to-violet-500 bg-clip-text text-transparent">
                snadno
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/50 max-w-lg mx-auto leading-relaxed mb-10 sm:mb-12">
              Vyplňte údaje jednou — systém připraví vše ostatní.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-full px-8 h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                <Link href="/login">
                  Začít zdarma
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="rounded-full px-8 h-12 text-base text-white/60 hover:text-white hover:bg-white/5">
                <a href="#use-cases">
                  Jak to funguje
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* ── Dashboard mockup ── */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-4">
          <div className="max-w-4xl mx-auto relative">
            <div className="absolute -inset-8 bg-[radial-gradient(ellipse_at_center,oklch(0.45_0.18_265/0.12),transparent_60%)] pointer-events-none" />
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5 sm:p-8">
              {/* Top bar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-violet-400" />
                  </div>
                  <span className="text-sm font-medium text-white/80">Založení s.r.o.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-violet-400" />
                  <span className="text-xs text-white/40">Připraveno</span>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Dokumentů", value: "10", sub: "v sadě" },
                  { label: "Polí", value: "24", sub: "sdílených" },
                  { label: "Čas", value: "<5", sub: "minut" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-white/8 bg-white/[0.02] p-3 sm:p-4">
                    <p className="text-[10px] sm:text-xs text-white/30 uppercase tracking-wider mb-1">{s.label}</p>
                    <p className="text-xl sm:text-2xl font-bold text-white/90">{s.value}</p>
                    <p className="text-[10px] text-white/20">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Document list */}
              <div className="space-y-2">
                {[
                  { name: "Stanovy společnosti", status: true },
                  { name: "Rozhodnutí o umístění sídla", status: true },
                  { name: "Plná moc — založení", status: true },
                  { name: "Čestné prohlášení jednatele", status: false },
                ].map((doc) => (
                  <div key={doc.name} className="flex items-center justify-between rounded-lg border border-white/6 bg-white/[0.02] px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <FileText className="h-3.5 w-3.5 text-white/20" />
                      <span className="text-sm text-white/60">{doc.name}</span>
                    </div>
                    {doc.status ? (
                      <CheckCircle2 className="h-4 w-4 text-violet-400" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-white/10" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features row ── */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Zap,
                title: "Rychlé generování",
                desc: "Kompletní sada dokumentů za pár minut.",
              },
              {
                icon: Shield,
                title: "České právo",
                desc: "Šablony v souladu s aktuální legislativou.",
              },
              {
                icon: Download,
                title: "DOCX, PDF, ZIP",
                desc: "Stáhněte jednotlivě nebo vše najednou.",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 group hover:border-white/15 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
                  <f.icon className="h-5 w-5 text-violet-400" />
                </div>
                <h3 className="font-semibold text-white/90 mb-1">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use cases ── */}
      <section id="use-cases" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
              Vyberete situaci,{" "}
              <span className="italic font-serif bg-gradient-to-r from-violet-300 to-violet-500 bg-clip-text text-transparent">
                my připravíme dokumenty
              </span>
            </h2>
            <p className="text-white/40 text-base sm:text-lg max-w-lg mx-auto">
              {useCases.length} připravených sad pro nejčastější právní situace.
            </p>
          </div>

          <div className="landing-cards">
            <HomeQuickButtons />
          </div>

          <div className="text-center mt-14">
            <Button asChild size="lg" className="rounded-full px-8 h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
              <Link href="/login">
                Přihlásit se a začít
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center">
                <FileText className="h-3 w-3 text-white" />
              </div>
              <span className="font-medium text-white/70">DocGen</span>
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
