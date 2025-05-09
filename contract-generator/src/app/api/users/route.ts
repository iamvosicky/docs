import { NextResponse } from "next/server";

export async function GET() {
  // This would typically fetch users from the database
  // For now, we'll return mock data
  
  const users = [
    {
      id: "1",
      name: "Jan Novák",
      email: "jan.novak@example.com",
      role: "admin",
      status: "active",
      lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "2",
      name: "Marie Svobodová",
      email: "marie.svobodova@example.com",
      role: "editor",
      status: "active",
      lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      name: "Petr Černý",
      email: "petr.cerny@example.com",
      role: "user",
      status: "active",
      lastActive: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "4",
      name: "Lucie Dvořáková",
      email: "lucie.dvorakova@example.com",
      role: "user",
      status: "pending",
      lastActive: null,
    },
    {
      id: "5",
      name: "Tomáš Procházka",
      email: "tomas.prochazka@example.com",
      role: "user",
      status: "inactive",
      lastActive: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return NextResponse.json({ users }, { status: 200 });
}
