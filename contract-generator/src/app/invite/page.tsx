"use client";

import { InviteUserForm } from "@/components/forms/invite-user-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// Sonner is added at the layout level
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

// Loading component for Suspense fallback
function InvitePageLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
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
function InvitePageContent() {
  const [activeTab, setActiveTab] = useState<string>('single');
  const [copied, setCopied] = useState(false);
  const inviteLink = "https://contract-generator.example.com/register?invite=ABC123";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
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
          <h1 className="text-4xl font-bold mb-3">Pozvat uživatele</h1>
          <p className="text-lg text-muted-foreground">
            Pozvěte nové uživatele do aplikace pro generování právních dokumentů
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Pozvat jednotlivce</TabsTrigger>
            <TabsTrigger value="link">Vytvořit odkaz</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pozvat uživatele emailem</CardTitle>
                <CardDescription>
                  Vyplňte formulář níže pro odeslání pozvánky konkrétnímu uživateli
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InviteUserForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="link" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Vytvořit odkaz pro pozvání</CardTitle>
                <CardDescription>
                  Vygenerujte odkaz, který můžete sdílet s více uživateli
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="invite-link">Odkaz pro pozvání</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="invite-link"
                      value={inviteLink}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="rounded-md bg-muted p-4">
                  <div className="text-sm font-medium">Informace o odkazu</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Tento odkaz je platný po dobu 7 dní</li>
                      <li>Odkaz může být použit pro registraci až 10 uživatelů</li>
                      <li>Všichni uživatelé registrovaní přes tento odkaz budou mít roli "Uživatel"</li>
                    </ul>
                  </div>
                </div>

                <Button className="w-full">Vygenerovat nový odkaz</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Správa uživatelů</CardTitle>
            <CardDescription>
              Přehled a správa všech uživatelů v aplikaci
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <a href="/users">Přejít na správu uživatelů</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Export the component wrapped in Suspense
export default function InvitePage() {
  // We don't actually use searchParams here, but we need to wrap it in Suspense
  // because Next.js detected that we're using useSearchParams() somewhere
  const searchParams = useSearchParams();
  
  return (
    <Suspense fallback={<InvitePageLoading />}>
      <InvitePageContent />
    </Suspense>
  );
}
