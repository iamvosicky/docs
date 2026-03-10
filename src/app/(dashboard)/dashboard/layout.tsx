import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-8 lg:grid-cols-[260px_1fr] lg:gap-10">
        <aside className="fixed top-16 z-30 hidden h-[calc(100vh-4rem)] w-full shrink-0 md:sticky md:block border-r md:pr-6 lg:pr-8">
          <div className="py-6">
            <DashboardNav />
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
