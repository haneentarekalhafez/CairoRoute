import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pickup_points")
    .select("*")
    .order("name")

  if (error) {
    return NextResponse.json(
      {
        message: "Failed to load pickup points.",
        error: error.message,
      },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}