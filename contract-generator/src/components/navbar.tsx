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
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-lg">Contract Generator</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <>
                    <Button variant="ghost" asChild className="font-medium">
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                    <Button variant="ghost" asChild className="font-medium">
                      <Link href="/users">Uživatelé</Link>
                    </Button>
                    <Button variant="ghost" asChild className="font-medium">
                      <Link href="/invite">Pozvat</Link>
                    </Button>
                  </>
                )}

                <ThemeToggle />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="" alt={user?.name || "User"} />
                        <AvatarFallback>
                          {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Můj účet</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">Profil</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">Nastavení</DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Administrace</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard">Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/users">Správa uživatelů</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/invite">Pozvat uživatele</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Motiv</DropdownMenuLabel>
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
                    <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                      Odhlásit se
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
