"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, ArrowRight, Loader2 } from "lucide-react";

// Loading component for Suspense fallback
function MultiDocumentLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="h-6 w-32 bg-muted rounded animate-pulse mb-4"></div>
          <div className="h-10 w-64 bg-muted rounded animate-pulse mb-3"></div>
          <div className="h-6 w-96 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="h-96 bg-muted rounded animate-pulse"></div>
      </div>
    </div>
  );
}

// Main component content
function MultiDocumentContent() {
  const router = useRouter();

  const handleCreateNew = () => {
    router.push("/multi-document/form");
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <a href="/" className="text-primary hover:underline flex items-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Zpět na hlavní stránku
          </a>
          <h1 className="text-4xl font-bold mb-3">Generátor více dokumentů</h1>
          <p className="text-lg text-muted-foreground">
            Vytvořte sadu souvisejících právních dokumentů na základě jednoho formuláře
          </p>
        </div>

        <Tabs defaultValue="recent" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recent">Nedávné dokumenty</TabsTrigger>
            <TabsTrigger value="templates">Šablony</TabsTrigger>
            <TabsTrigger value="favorites">Oblíbené</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* New Document Card */}
              <Card className="border-dashed hover:border-primary hover:bg-muted/50 transition-colors cursor-pointer" onClick={handleCreateNew}>
                <CardContent className="flex flex-col items-center justify-center h-full py-10">
                  <div className="rounded-full bg-primary/10 p-3 mb-4">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Vytvořit novou sadu</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Začněte s novou sadou dokumentů
                  </p>
                </CardContent>
              </Card>

              {/* Example Document Sets */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Smlouva o dílo + přílohy</CardTitle>
                  <CardDescription>Vytvořeno 12.5.2023</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Smlouva o dílo.pdf</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Příloha 1 - Specifikace.pdf</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Příloha 2 - Harmonogram.pdf</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/multi-document/detail/1">
                      Zobrazit detail
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">GDPR dokumentace</CardTitle>
                  <CardDescription>Vytvořeno 3.4.2023</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Zásady zpracování osobních údajů.pdf</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Souhlas se zpracováním.pdf</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Informační memorandum.pdf</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/multi-document/detail/2">
                      Zobrazit detail
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Pracovněprávní dokumentace</CardTitle>
                  <CardDescription>5 dokumentů</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Kompletní sada dokumentů pro zaměstnavatele včetně pracovní smlouvy, mzdového výměru a dalších.
                  </p>
                  <Button className="w-full" asChild>
                    <a href="/multi-document/form?template=employment">
                      Použít šablonu
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Korporátní dokumentace</CardTitle>
                  <CardDescription>3 dokumenty</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Základní dokumenty pro založení společnosti s ručením omezeným.
                  </p>
                  <Button className="w-full" asChild>
                    <a href="/multi-document/form?template=corporate">
                      Použít šablonu
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">GDPR balíček</CardTitle>
                  <CardDescription>4 dokumenty</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Kompletní sada dokumentů pro zajištění souladu s GDPR.
                  </p>
                  <Button className="w-full" asChild>
                    <a href="/multi-document/form?template=gdpr">
                      Použít šablonu
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Nájemní smlouva + předávací protokol</CardTitle>
                  <CardDescription>Přidáno do oblíbených 15.3.2023</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Nájemní smlouva.pdf</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Předávací protokol.pdf</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/multi-document/detail/3">
                      Zobrazit detail
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Export the component wrapped in Suspense
export default function MultiDocumentPage() {
  // We don't actually use searchParams here, but we need to wrap it in Suspense
  // because Next.js detected that we're using useSearchParams() somewhere
  const searchParams = useSearchParams();
  
  return (
    <Suspense fallback={<MultiDocumentLoading />}>
      <MultiDocumentContent />
    </Suspense>
  );
}
