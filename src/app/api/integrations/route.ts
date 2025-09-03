import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    let whereClause: any = {}
    
    if (category && category !== "all") {
      whereClause.category = category
    }
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const integrations = await db.integration.findMany({
      where: whereClause,
      orderBy: { name: "asc" },
    })

    return NextResponse.json(integrations)
  } catch (error) {
    console.error("Error fetching integrations:", error)
    return NextResponse.json(
      { error: "Failed to fetch integrations" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, category, icon, authType, configSchema } = body

    const integration = await db.integration.create({
      data: {
        name,
        description,
        category,
        icon,
        authType,
        configSchema,
      },
    })

    return NextResponse.json(integration, { status: 201 })
  } catch (error) {
    console.error("Error creating integration:", error)
    return NextResponse.json(
      { error: "Failed to create integration" },
      { status: 500 }
    )
  }
}