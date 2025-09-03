import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const integration = await db.integration.findUnique({
      where: { id: params.id },
      include: {
        userIntegrations: {
          where: { userId: "default-user" }, // In a real app, get from auth
        },
      },
    })

    if (!integration) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(integration)
  } catch (error) {
    console.error("Error fetching integration:", error)
    return NextResponse.json(
      { error: "Failed to fetch integration" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, category, icon, authType, configSchema } = body

    const integration = await db.integration.update({
      where: { id: params.id },
      data: {
        name,
        description,
        category,
        icon,
        authType,
        configSchema,
      },
    })

    return NextResponse.json(integration)
  } catch (error) {
    console.error("Error updating integration:", error)
    return NextResponse.json(
      { error: "Failed to update integration" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.integration.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting integration:", error)
    return NextResponse.json(
      { error: "Failed to delete integration" },
      { status: 500 }
    )
  }
}