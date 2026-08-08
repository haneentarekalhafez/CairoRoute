import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function GET() {
 const supabase = await createClient()

  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .eq("is_active", true)
    .order("name")

  if (error) {
    return NextResponse.json(
      {
        message: "Failed to load destinations.",
        error: error.message,
      },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}