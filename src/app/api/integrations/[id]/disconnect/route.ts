import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = "default-user" // In a real app, get from auth

    const userIntegration = await db.userIntegration.findUnique({
      where: {
        userId_integrationId: {
          userId,
          integrationId: params.id,
        },
      },
    })

    if (!userIntegration) {
      return NextResponse.json(
        { error: "Integration not connected" },
        { status: 404 }
      )
    }

    const updatedUserIntegration = await db.userIntegration.update({
      where: { id: userIntegration.id },
      data: {
        status: "DISCONNECTED",
        disconnectedAt: new Date(),
        credentials: null,
      },
    })

    return NextResponse.json(updatedUserIntegration)
  } catch (error) {
    console.error("Error disconnecting integration:", error)
    return NextResponse.json(
      { error: "Failed to disconnect integration" },
      { status: 500 }
    )
  }
}