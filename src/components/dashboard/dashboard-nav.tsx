"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    title: "Šablony",
    href: "/dashboard/templates",
    icon: "📄",
  },
  {
    title: "Vygenerované soubory",
    href: "/dashboard/files",
    icon: "📁",
  },
  {
    title: "Firemní profily",
    href: "/dashboard/profiles",
    icon: "🏢",
  },
  {
    title: "Šablony formulářů",
    href: "/dashboard/form-templates",
    icon: "📝",
  },
  {
    title: "Uživatelé",
    href: "/dashboard/users",
    icon: "👥",
  },
  {
    title: "Protokoly aktivit",
    href: "/dashboard/logs",
    icon: "📊",
  },
  {
    title: "Nahrát dokumenty",
    href: "/dashboard/upload",
    icon: "📤",
  },
];

export function DashboardNav() {
  return (
    <nav className="grid items-start gap-2">
      {navItems.map((item, index) => (
        <Button
          key={index}
          variant="ghost"
          className="justify-start"
          asChild
        >
          <Link href={item.href}>
            <span className="mr-2">{item.icon}</span>
            {item.title}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
