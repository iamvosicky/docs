"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Search, UserPlus, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";

// Define types for users and invitations
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string | null;
}

interface Invitation {
  id: string;
  email: string;
  name: string;
  role: string;
  sentAt: string;
  status: string;
}

// Loading component for Suspense fallback
function UsersPageLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Správa uživatelů</h1>
          <p className="text-lg text-muted-foreground">
            Načítání...
          </p>
        </div>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <span className="ml-3 text-xl">Načítání uživatelů...</span>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';

// Main component wrapped in Suspense
function UsersPageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users and invitations from the API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch users
        const usersResponse = await fetch('/api/users');
        const usersData = await usersResponse.json();

        // Fetch invitations
        const invitationsResponse = await fetch('/api/invite');
        const invitationsData = await invitationsResponse.json();

        setUsers(usersData.users || []);
        setInvitations(invitationsData.invitations || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Chyba při načítání dat",
          description: "Nastala chyba při načítání uživatelů a pozvánek. Zkuste to prosím znovu.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter invitations based on search term
  const filteredInvitations = invitations.filter(
    (invitation) =>
      invitation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invitation.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date to a readable format
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nikdy";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("cs-CZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="green">Aktivní</Badge>;
      case "pending":
        return <Badge variant="amber">Čeká na potvrzení</Badge>;
      case "inactive":
        return <Badge variant="gray">Neaktivní</Badge>;
      case "expired":
        return <Badge variant="red">Vypršelo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get role badge variant
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="purple">Administrátor</Badge>;
      case "editor":
        return <Badge variant="teal">Editor</Badge>;
      case "user":
        return <Badge variant="blue">Uživatel</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
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
          <h1 className="text-4xl font-bold mb-3">Správa uživatelů</h1>
          <p className="text-lg text-muted-foreground">
            Spravujte uživatele a pozvánky v aplikaci
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Hledat uživatele..."
              className="pl-8 w-full sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button asChild>
            <a href="/invite">
              <UserPlus className="mr-2 h-4 w-4" />
              Pozvat uživatele
            </a>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">Uživatelé ({users.length})</TabsTrigger>
            <TabsTrigger value="invitations">Pozvánky ({invitations.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Seznam uživatelů</CardTitle>
                <CardDescription>
                  Přehled všech uživatelů v aplikaci
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-lg">Načítání uživatelů...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Jméno</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Poslední aktivita</TableHead>
                        <TableHead className="text-right">Akce</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell>{getStatusBadge(user.status)}</TableCell>
                            <TableCell>{formatDate(user.lastActive)}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Otevřít menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Akce</DropdownMenuLabel>
                                  <DropdownMenuItem>Zobrazit profil</DropdownMenuItem>
                                  <DropdownMenuItem>Upravit uživatele</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive">
                                    Deaktivovat uživatele
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                            Žádní uživatelé nebyli nalezeni
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invitations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Seznam pozvánek</CardTitle>
                <CardDescription>
                  Přehled všech odeslaných pozvánek
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-lg">Načítání pozvánek...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Jméno</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Odesláno</TableHead>
                        <TableHead className="text-right">Akce</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvitations.length > 0 ? (
                        filteredInvitations.map((invitation) => (
                          <TableRow key={invitation.id}>
                            <TableCell className="font-medium">{invitation.name}</TableCell>
                            <TableCell>{invitation.email}</TableCell>
                            <TableCell>{getRoleBadge(invitation.role)}</TableCell>
                            <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                            <TableCell>{formatDate(invitation.sentAt)}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Otevřít menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Akce</DropdownMenuLabel>
                                  <DropdownMenuItem>Odeslat znovu</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive">
                                    Zrušit pozvánku
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                            Žádné pozvánky nebyly nalezeny
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<UsersPageLoading />}>
      <UsersPageContent />
    </Suspense>
  );
}
