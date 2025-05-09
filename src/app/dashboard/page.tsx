'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';

export default function DashboardPage() {
  return (
    <ProtectedRoute adminOnly>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="text-lg mb-4">
          Welcome to the admin dashboard. This page is only accessible to authenticated admin users.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard 
            title="Templates" 
            description="Manage document templates" 
            count={12} 
            link="/dashboard/templates" 
          />
          <DashboardCard 
            title="Users" 
            description="Manage user accounts" 
            count={48} 
            link="/dashboard/users" 
          />
          <DashboardCard 
            title="Documents" 
            description="View generated documents" 
            count={156} 
            link="/dashboard/documents" 
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  count: number;
  link: string;
}

function DashboardCard({ title, description, count, link }: DashboardCardProps) {
  return (
    <a 
      href={link}
      className="block p-6 bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="text-3xl font-bold">{count}</div>
      </div>
    </a>
  );
}
