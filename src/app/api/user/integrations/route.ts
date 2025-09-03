import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = "default-user" // In a real app, get from auth

    const userIntegrations = await db.userIntegration.findMany({
      where: { userId },
      include: {
        integration: true,
      },
      orderBy: { connectedAt: "desc" },
    })

    return NextResponse.json(userIntegrations)
  } catch (error) {
    console.error("Error fetching user integrations:", error)
    return NextResponse.json(
      { error: "Failed to fetch user integrations" },
      { status: 500 }
    )
  }
}