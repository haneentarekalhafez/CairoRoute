import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const destinationId = Number(
    searchParams.get("destinationId")
  )

  if (!Number.isInteger(destinationId)) {
    return NextResponse.json(
      {
        message: "A valid destination ID is required.",
      },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("trips")
    .select(`
      id,
      departure_time,
      arrival_time,
      price,
      status,

      route:routes!inner (
        id,
        destination_id,
        estimated_duration_minutes,

        pickup_point:pickup_points (
          id,
          name,
          area,
          latitude,
          longitude
        ),

        destination:destinations (
          id,
          name
        )
      ),

      bus:buses (
        id,
        name,
        brand,
        model,
        plate_number,
        color,
        capacity
      ),

      booking_seats (
        id
      )
    `)
    .eq("route.destination_id", destinationId)
    .eq("status", "scheduled")
    .gte("departure_time", new Date().toISOString())
    .order("departure_time", {
      ascending: true,
    })

  if (error) {
    return NextResponse.json(
      {
        message: "Failed to load trips.",
        error: error.message,
      },
      { status: 500 }
    )
  }

  return NextResponse.json(data ?? [])
}