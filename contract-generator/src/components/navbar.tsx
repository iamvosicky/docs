"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useAuth } from "./auth/auth-provider";
import { FileText, LayoutDashboard, Users, UserPlus } from "lucide-react";

export function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center">
        <div className="mr-6 flex">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:block">Contract Generator</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <>
                    <Button variant="ghost" size="sm" asChild className="gap-1.5">
                      <Link href="/dashboard">
                        <LayoutDashboard className="h-4 w-4" />
                        <span className="hidden md:block">Dashboard</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="gap-1.5">
                      <Link href="/users">
                        <Users className="h-4 w-4" />
                        <span className="hidden md:block">Uživatelé</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="gap-1.5">
                      <Link href="/invite">
                        <UserPlus className="h-4 w-4" />
                        <span className="hidden md:block">Pozvat</span>
                      </Link>
                    </Button>
                  </>
                )}

                <ThemeToggle />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="" alt={user?.name || "User"} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user?.name || "Můj účet"}</p>
                        {user?.email && (
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">Profil</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">Nastavení</DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Administrace</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/users">
                            <Users className="mr-2 h-4 w-4" />
                            Správa uživatelů
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/invite">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Pozvat uživatele
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-muted-foreground">Motiv</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      Světlý
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      Tmavý
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      Systémový
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleLogout}>
                      Odhlásit se
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Button asChild size="sm" className="ml-1">
                  <Link href="/login">Přihlásit se</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
