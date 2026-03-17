"use client";

import { Button } from "@/components/ui/button";
import { FileText, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCases } from "./use-case-shortcuts";
import { useAuth } from "@/components/auth/auth-provider";
import { getTemplate } from "@/lib/template-schemas";

export function HomeQuickButtons() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {useCases.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
          {useCases.map((useCase) => {
            // Get first 3 template names for preview
            const previewTemplates = useCase.templateIds
              .slice(0, 3)
              .map(id => getTemplate(id))
              .filter(Boolean);
            const remainingCount = useCase.templateIds.length - previewTemplates.length;

            const href = isAuthenticated
              ? `/app/generate?usecase=${useCase.id}&templates=${useCase.templateIds.join(",")}`
              : `/login?returnUrl=/app/generate?usecase=${useCase.id}%26templates=${useCase.templateIds.join(",")}`;

            return (
              <Link
                key={useCase.id}
                href={href}
                className="group relative rounded-2xl border bg-card p-4 sm:p-6 block transition-all duration-200 hover:border-primary/20 hover:shadow-sm active:scale-[0.98]"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground shrink-0 transition-colors group-hover:text-primary">
                    {useCase.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-lg leading-tight mb-1">{useCase.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {useCase.description}
                    </p>
                  </div>
                </div>

                {/* Document list preview */}
                <div className="space-y-1.5 mb-5">
                  {previewTemplates.map((template, idx) => (
                    <div key={`${useCase.id}-${template!.id}-${idx}`} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3 text-primary/40 shrink-0" />
                      <span className="truncate">{template!.name}</span>
                    </div>
                  ))}
                  {remainingCount > 0 && (
                    <p className="text-xs text-muted-foreground ml-5">
                      a dalších {remainingCount} {remainingCount >= 2 && remainingCount <= 4 ? 'dokumenty' : 'dokumentů'}...
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="tag-pill inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium">
                    <FileText className="h-3 w-3" />
                    {useCase.templateIds.length}{" "}
                    {useCase.templateIds.length === 1
                      ? "dokument"
                      : useCase.templateIds.length >= 2 && useCase.templateIds.length <= 4
                      ? "dokumenty"
                      : "dokumentů"}
                  </span>

                  {isAuthenticated ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Začít
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Lock className="h-3 w-3" />
                      Přihlášení
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Žádné rychlé volby nejsou k dispozici.</p>
        </div>
      )}
    </div>
  );
}
