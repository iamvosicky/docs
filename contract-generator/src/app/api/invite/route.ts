import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { email, name, role, message } = body;

    // Validate required fields
    if (!email || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // In a real implementation, this would:
    // 1. Check if the user already exists
    // 2. Create an invitation record in the database
    // 3. Send an email to the user with a signup link
    // 4. Return success or error

    // For now, we'll just simulate a successful invitation
    console.log("Invitation sent to:", { email, name, role, message });

    // Simulate a delay to mimic API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: `Invitation sent to ${email}`,
        data: {
          id: Math.random().toString(36).substring(2, 15),
          email,
          name,
          role,
          sentAt: new Date().toISOString(),
          status: "pending",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending invitation:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // This would typically fetch all invitations from the database
  // For now, we'll return mock data

  const invitations = [
    {
      id: "1",
      email: "martin.horak@example.com",
      name: "Martin Horák",
      role: "user",
      sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: "pending",
    },
    {
      id: "2",
      email: "jana.kolarova@example.com",
      name: "Jana Kolářová",
      role: "editor",
      sentAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      status: "pending",
    },
    {
      id: "3",
      email: "david.novotny@example.com",
      name: "David Novotný",
      role: "user",
      sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "expired",
    },
  ];

  return NextResponse.json({ invitations }, { status: 200 });
}
