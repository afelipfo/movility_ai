import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, origin, destination, route_data, transport_mode } = body

    if (!name || !origin || !destination || !route_data) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: savedRoute, error } = await supabase
      .from("saved_routes")
      .insert({
        user_id: user.id,
        name,
        origin,
        destination,
        route_data,
        transport_mode,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ savedRoute })
  } catch (error) {
    console.error("[v0] Error saving route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: savedRoutes, error } = await supabase
      .from("saved_routes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ savedRoutes })
  } catch (error) {
    console.error("[v0] Error fetching saved routes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const routeId = searchParams.get("id")

    if (!routeId) {
      return NextResponse.json({ error: "Route ID required" }, { status: 400 })
    }

    const { error } = await supabase.from("saved_routes").delete().eq("id", routeId).eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting saved route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
