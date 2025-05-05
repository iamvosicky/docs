import { UserManagement } from "@/components/dashboard/user-management";
import { Button } from "@/components/ui/button";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage users of the contract generation platform.
          </p>
        </div>
        <Button>Invite User</Button>
      </div>
      
      <UserManagement />
    </div>
  );
}
