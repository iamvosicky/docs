"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    title: "Templates",
    href: "/dashboard/templates",
    icon: "📄",
  },
  {
    title: "Generated Files",
    href: "/dashboard/files",
    icon: "📁",
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: "👥",
  },
  {
    title: "Audit Logs",
    href: "/dashboard/logs",
    icon: "📊",
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
