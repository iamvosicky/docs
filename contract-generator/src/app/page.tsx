import { TemplateCatalog } from "@/components/template-catalog";

export default function Home() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Contract Templates</h1>
      <p className="text-muted-foreground mb-8">
        Select a template to generate a customized legal document
      </p>
      <TemplateCatalog />
    </div>
  );
}
