"use client";

import { TemplateCatalog } from "@/components/template-catalog";
import { HomeQuickButtons } from "@/components/home-quick-buttons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import {
  Shield, Zap, Globe, ChevronDown, FileText, ArrowRight,
  CheckCircle2, Clock, Sparkles, FolderOpen, Plus, Upload,
  BookOpen, Trash2, Calendar, Users, Scale, Lock,
  BarChart3, Layers, Download, Eye
} from "lucide-react";
import { useState, useEffect } from "react";
import { getAllTemplates, getCustomTemplates, deleteCustomTemplate, type CustomTemplate } from "@/lib/template-schemas";
import { useCases } from "@/components/use-case-shortcuts";
import { toast } from "sonner";

// ─── Landing page for unauthenticated users ───
function LandingPage() {
  const allTemplates = getAllTemplates();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="hero-gradient relative overflow-hidden">
        {/* Floating decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/5 blur-3xl"
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          />
          <div
            className="absolute top-1/2 -left-32 w-64 h-64 rounded-full bg-[oklch(0.6_0.2_310)]/5 blur-3xl"
            style={{ transform: `translateY(${scrollY * -0.08}px)` }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-28 pb-16 sm:pb-28 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 sm:mb-8 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium border border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Sparkles className="h-3.5 w-3.5" />
              Generujte pravni dokumenty za minuty
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-5 sm:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              Pravni dokumenty
              <br />
              <span className="bg-gradient-to-r from-primary via-[oklch(0.55_0.2_290)] to-[oklch(0.6_0.2_310)] bg-clip-text text-transparent">
                bez komplikaci
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10 sm:mb-12 px-2 sm:px-0 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              Kompletni sady pravnich dokumentu v souladu s ceskym pravem.
              Vyplnte udaje jednou — system je doplni vsude.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Button asChild size="lg" className="rounded-xl px-10 h-13 text-base w-full sm:w-auto cta-pulse shadow-lg shadow-primary/20">
                <Link href="/login">
                  Zacit zdarma
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl px-8 h-13 text-base w-full sm:w-auto">
                <a href="#how-it-works">
                  Jak to funguje
                  <ChevronDown className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </div>
          </div>

          {/* ── Document mockup ── */}
          <div className="mt-14 sm:mt-20 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500">
            <div className="relative">
              {/* Shadow glow */}
              <div className="absolute -inset-4 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent rounded-3xl blur-2xl" />

              {/* Main card */}
              <div className="relative glass-card rounded-2xl p-6 sm:p-8 border border-border/50">
                {/* Window controls */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-3 w-3 rounded-full bg-red-400/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
                  <div className="h-3 w-3 rounded-full bg-green-400/60" />
                  <div className="ml-4 h-6 flex-1 max-w-xs rounded-lg bg-muted/60 flex items-center px-3">
                    <span className="text-[10px] text-muted-foreground/60 font-mono">docgen.app/generate</span>
                  </div>
                </div>

                {/* Mock content */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left: form fields */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Zalozeni firmy</span>
                    </div>
                    {["Nazev spolecnosti", "ICO", "Sidlo", "Jednatel"].map((label) => (
                      <div key={label} className="space-y-1">
                        <div className="text-[10px] text-muted-foreground/70 font-medium">{label}</div>
                        <div className="h-8 rounded-lg bg-muted/50 border border-border/30" />
                      </div>
                    ))}
                  </div>

                  {/* Right: generated docs */}
                  <div className="space-y-2">
                    <div className="text-[10px] text-muted-foreground/70 font-medium uppercase tracking-wider mb-3">
                      Generovane dokumenty
                    </div>
                    {[
                      "Stanovy spolecnosti",
                      "Rozhodnuti o umisteni",
                      "Plna moc — zalozeni",
                      "Cestne prohlaseni",
                    ].map((doc, i) => (
                      <div key={doc} className="flex items-center gap-2 rounded-lg bg-muted/30 border border-border/20 px-3 py-2">
                        <div className={`h-6 w-6 rounded-md flex items-center justify-center text-white text-[9px] font-bold ${
                          i === 0 ? 'bg-primary' : i === 1 ? 'bg-[oklch(0.55_0.2_290)]' : i === 2 ? 'bg-[oklch(0.6_0.2_310)]' : 'bg-[oklch(0.6_0.15_170)]'
                        }`}>
                          {i === 0 ? 'ST' : i === 1 ? 'RO' : i === 2 ? 'PM' : 'CP'}
                        </div>
                        <span className="text-xs flex-1">{doc}</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      </div>
                    ))}
                    <div className="pt-2">
                      <div className="h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center gap-2">
                        <Download className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-medium text-primary">Stahnout vse (ZIP)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="border-y bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {[
              { value: `${allTemplates.length}`, label: "Sablon dokumentu", icon: FileText },
              { value: `${useCases.length}`, label: "Pripravenych sad", icon: Layers },
              { value: "100%", label: "Ceske pravo", icon: Scale },
              { value: "<5 min", label: "Doba generovani", icon: Clock },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex h-10 w-10 rounded-xl bg-primary/10 items-center justify-center mx-auto mb-2">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── How it works ── */}
      <section id="how-it-works" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 sm:mb-18">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-primary/8 text-primary text-xs font-medium border border-primary/15">
              Jak to funguje
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
              Tri kroky ke kompletnim dokumentum
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Zadne slozite formulare. Vyberete, vyplnite, stahnete.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: "1",
                icon: FolderOpen,
                title: "Vyberete, co potrebujete",
                desc: "Zvolte zivotni situaci — zalozeni firmy, zamestnani, obchodni smlouvy — a system pripravi celou sadu dokumentu.",
                color: "bg-primary",
              },
              {
                step: "2",
                icon: FileText,
                title: "Vyplnite udaje jednou",
                desc: "Sdilena pole se automaticky vyplni napric vsemi dokumenty. Chytre validace hlidaji formaty ICO, dat i castek.",
                color: "bg-[oklch(0.55_0.2_290)]",
              },
              {
                step: "3",
                icon: Download,
                title: "Stahnete hotove dokumenty",
                desc: "Stahnete dokumenty ve formatu DOCX nebo PDF. Jednotlive, nebo vse najednou jako ZIP.",
                color: "bg-[oklch(0.6_0.15_170)]",
              },
            ].map((item) => (
              <div key={item.step} className="relative rounded-2xl border bg-card p-6 sm:p-8 text-center group hover-lift">
                <div className="inline-flex h-14 w-14 rounded-2xl bg-primary/10 items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <item.icon className="h-7 w-7" />
                </div>
                <div className={`absolute -top-3.5 -left-2 sm:-left-3 h-8 w-8 rounded-full ${item.color} text-white text-sm font-bold flex items-center justify-center shadow-lg`}>
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="bg-muted/20 border-y">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
                Proc DocGen?
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
                Navrzeno pro ceske pravni prostredi od zacatku.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {[
                {
                  icon: Scale,
                  title: "Ceske pravo",
                  desc: "Vsechny sablony jsou v souladu s aktualni ceskou legislativou.",
                },
                {
                  icon: Zap,
                  title: "Rychle generovani",
                  desc: "Kompletni sada dokumentu behem par minut, ne hodin.",
                },
                {
                  icon: Layers,
                  title: "Sdilena pole",
                  desc: "Vyplnte udaje jednou a propisi se do vsech dokumentu sady.",
                },
                {
                  icon: Shield,
                  title: "Bezpecne a sifrovane",
                  desc: "Vase data jsou chranena sifrovani a nikdy je nesdilime.",
                },
                {
                  icon: Download,
                  title: "DOCX i PDF",
                  desc: "Stahnete dokumenty v preferovanem formatu, vcetne ZIP archivu.",
                },
                {
                  icon: Users,
                  title: "Tymova spoluprace",
                  desc: "Pozvete kolegy a sdílejte sablony napric firmou.",
                },
              ].map((feature) => (
                <div key={feature.title} className="rounded-2xl border bg-card p-5 sm:p-6 hover-lift group">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-base mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Use cases preview ── */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-primary/8 text-primary text-xs font-medium border border-primary/15">
              Pripravene sady
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
              Vyberete situaci, my pripravime dokumenty
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              {useCases.length} pripravenych sad pro nejcastejsi pravni situace.
            </p>
          </div>

          <HomeQuickButtons />

          <div className="text-center mt-12">
            <Button asChild size="lg" className="rounded-xl px-10 h-13 text-base shadow-lg shadow-primary/20">
              <Link href="/login">
                Prihlasit se a zacit
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Testimonial / trust section ── */}
      <section className="bg-muted/20 border-y">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Duvera v kazdem dokumentu
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote: "Zalozeni s.r.o. nam zabralo 5 minut misto 2 dnu. Vsechny dokumenty byly pripraveny na prvni pokus.",
                  author: "Martin K.",
                  role: "Zakladatel startupu",
                },
                {
                  quote: "Konecne nastroj, ktery rozumi ceskemu pravu. Sablony jsou aktualni a presne.",
                  author: "Jana V.",
                  role: "Pravni asistentka",
                },
                {
                  quote: "Pouzivame DocGen pro vsechny firemni smlouvy. Usetri nam hodiny prace kazdy tyden.",
                  author: "Petr S.",
                  role: "Jednatel spolecnosti",
                },
              ].map((testimonial) => (
                <div key={testimonial.author} className="rounded-2xl border bg-card p-6 flex flex-col">
                  <p className="text-sm leading-relaxed text-muted-foreground flex-1 mb-4">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.6_0.2_310)] items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Pripraveni zacit?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-lg mx-auto">
            Registrace je zdarma. Zadna kreditni karta, zadne zavazky.
            Zacnete generovat dokumenty hned.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-xl px-10 h-13 text-base w-full sm:w-auto cta-pulse shadow-lg shadow-primary/20">
              <Link href="/login">
                Vytvorit ucet zdarma
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              Zdarma na zacatek
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              Bez kreditni karty
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              Ceske pravo
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary to-[oklch(0.6_0.2_310)] flex items-center justify-center">
                <FileText className="h-3 w-3 text-white" />
              </div>
              <span className="font-medium text-foreground">DocGen</span>
            </div>
            <p>&copy; 2026 DocGen. Vsechna prava vyhrazena.</p>
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
  const greeting = hour < 12 ? "Dobre rano" : hour < 18 ? "Dobry den" : "Dobry vecer";

  const allTemplates = getAllTemplates();

  useEffect(() => {
    setCustomTemplates(getCustomTemplates());
  }, []);

  const handleDeleteCustom = (id: string, name: string) => {
    deleteCustomTemplate(id);
    setCustomTemplates(getCustomTemplates());
    toast.success(`Sablona "${name}" smazana`);
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
                  {user?.name || "uzivateli"}
                </h1>
              </div>

              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{allTemplates.length}</p>
                    <p className="text-xs">sablon</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <FolderOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{useCases.length}</p>
                    <p className="text-xs">sad dokumentu</p>
                  </div>
                </div>
                {customTemplates.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <Upload className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{customTemplates.length}</p>
                      <p className="text-xs">vlastnich</p>
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
              <h2 className="text-lg sm:text-xl font-bold">Rychle akce</h2>
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
                    <h3 className="font-semibold text-sm sm:text-base leading-tight">Novy dokument</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Vyberte sadu nebo sablonu</p>
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
                    <h3 className="font-semibold text-sm sm:text-base leading-tight">Nahrat dokument</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Vytvorit sablonu z DOCX</p>
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
                    <h3 className="font-semibold text-sm sm:text-base leading-tight">Katalog sablon</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{allTemplates.length} pripravenych sablon</p>
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
                <h2 className="text-lg sm:text-xl font-bold">Sady dokumentu</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Vyberte zivotni situaci a vygenerujte kompletni sadu</p>
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
                    <h2 className="text-lg sm:text-xl font-bold">Vlastni sablony</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">Sablony vytvorene z nahranych dokumentu</p>
                  </div>
                </div>
                <Link
                  href="/upload"
                  className="text-xs sm:text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Pridat</span>
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
                      title="Smazat sablonu"
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
                          Pouzit sablonu
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
                    Jednotlive sablony
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Nebo si vyberte konkretni dokument
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
