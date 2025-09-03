import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { credentials, configuration } = body
    const userId = "default-user" // In a real app, get from auth

    // Check if integration exists
    const integration = await db.integration.findUnique({
      where: { id: params.id },
    })

    if (!integration) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 }
      )
    }

    // Check if user already has this integration
    const existingUserIntegration = await db.userIntegration.findUnique({
      where: {
        userId_integrationId: {
          userId,
          integrationId: params.id,
        },
      },
    })

    let userIntegration

    if (existingUserIntegration) {
      // Update existing connection
      userIntegration = await db.userIntegration.update({
        where: { id: existingUserIntegration.id },
        data: {
          status: "CONNECTED",
          credentials,
          configuration,
          connectedAt: new Date(),
          disconnectedAt: null,
        },
      })
    } else {
      // Create new connection
      userIntegration = await db.userIntegration.create({
        data: {
          userId,
          integrationId: params.id,
          status: "CONNECTED",
          credentials,
          configuration,
          connectedAt: new Date(),
        },
      })
    }

    // Simulate OAuth flow if needed
    if (integration.authType === "OAUTH") {
      // In a real app, this would redirect to the OAuth provider
      // For now, we'll just simulate a successful connection
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
    }

    return NextResponse.json(userIntegration)
  } catch (error) {
    console.error("Error connecting integration:", error)
    return NextResponse.json(
      { error: "Failed to connect integration" },
      { status: 500 }
    )
  }
}