import { UserManagement } from "@/components/dashboard/user-management";
import { Button } from "@/components/ui/button";

export default function UsersPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Users</h1>
          <p className="text-muted-foreground text-lg">
            Manage users of the contract generation platform.
          </p>
        </div>
        <Button size="lg" className="shadow-sm">
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
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
          Invite User
        </Button>
      </div>

      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <UserManagement />
      </div>
    </div>
  );
}
