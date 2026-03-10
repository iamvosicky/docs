"use client";

import Link from "next/link";
import { useState } from "react";
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
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useAuth } from "./auth/auth-provider";
import { Sun, Moon, Monitor, LogOut, User, Settings, LayoutDashboard, Users, UserPlus, FileText, Menu, X } from "lucide-react";

export function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Odhlášení proběhlo úspěšně");
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-[oklch(0.6_0.2_310)] flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-base tracking-tight">DocGen</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          {isAuthenticated ? (
            <>
              {/* Desktop admin nav */}
              {isAdmin && (
                <nav className="hidden sm:flex items-center gap-1 mr-2">
                  <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground rounded-lg">
                    <Link href="/dashboard">
                      <LayoutDashboard className="h-4 w-4 mr-1.5" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground rounded-lg">
                    <Link href="/users">
                      <Users className="h-4 w-4 mr-1.5" />
                      Uživatelé
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground rounded-lg">
                    <Link href="/invite">
                      <UserPlus className="h-4 w-4 mr-1.5" />
                      Pozvat
                    </Link>
                  </Button>
                </nav>
              )}

              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Přepnout motiv</span>
              </Button>

              {/* Mobile hamburger (visible only on small screens for admin) */}
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg sm:hidden text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileOpen(!mobileOpen)}
                >
                  {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                  <span className="sr-only">Menu</span>
                </Button>
              )}

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user?.name || "User"} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5">
                  <div className="px-2 py-2 mb-1">
                    <p className="text-sm font-medium">{user?.name || "Uživatel"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer rounded-lg py-2">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer rounded-lg py-2">
                    <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                    Nastavení
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs text-muted-foreground font-normal sm:hidden">Administrace</DropdownMenuLabel>
                      <DropdownMenuItem asChild className="rounded-lg py-2 sm:hidden">
                        <Link href="/dashboard">
                          <LayoutDashboard className="h-4 w-4 mr-2 text-muted-foreground" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg py-2 sm:hidden">
                        <Link href="/users">
                          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                          Správa uživatelů
                        </Link>
                      </DropdownMenuItem>
                      <div className="hidden sm:block">
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Administrace</DropdownMenuLabel>
                        <DropdownMenuItem asChild className="rounded-lg py-2">
                          <Link href="/dashboard">
                            <LayoutDashboard className="h-4 w-4 mr-2 text-muted-foreground" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-lg py-2">
                          <Link href="/users">
                            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                            Správa uživatelů
                          </Link>
                        </DropdownMenuItem>
                      </div>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Motiv</DropdownMenuLabel>
                  <div className="flex gap-1 px-2 py-1.5">
                    <button
                      onClick={() => setTheme("light")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs transition-colors ${theme === 'light' ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-muted-foreground'}`}
                    >
                      <Sun className="h-3.5 w-3.5" />
                      Světlý
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs transition-colors ${theme === 'dark' ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-muted-foreground'}`}
                    >
                      <Moon className="h-3.5 w-3.5" />
                      Tmavý
                    </button>
                    <button
                      onClick={() => setTheme("system")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs transition-colors ${theme === 'system' ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-muted-foreground'}`}
                    >
                      <Monitor className="h-3.5 w-3.5" />
                      Auto
                    </button>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer rounded-lg py-2 text-destructive focus:text-destructive" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Odhlásit se
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Přepnout motiv</span>
              </Button>
              <Button asChild size="sm" className="rounded-xl px-5">
                <Link href="/login">Přihlásit se</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile admin menu slide-down */}
      {isAuthenticated && isAdmin && mobileOpen && (
        <div className="sm:hidden border-t bg-background/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors active:bg-muted"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/users"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors active:bg-muted"
            >
              <Users className="h-4 w-4" />
              Správa uživatelů
            </Link>
            <Link
              href="/invite"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors active:bg-muted"
            >
              <UserPlus className="h-4 w-4" />
              Pozvat uživatele
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
