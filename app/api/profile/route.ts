import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

type UpdateProfileBody = {
  fullName?: string
  phone?: string
  avatarUrl?: string | null
  emergencyName?: string
  emergencyPhone?: string
}

async function getAuthenticatedUser(
  request: Request
) {
  const authorizationHeader =
    request.headers.get("authorization")

  if (
    !authorizationHeader ||
    !authorizationHeader.startsWith("Bearer ")
  ) {
    return {
      user: null,
      supabase: null,
      error: "You must be logged in.",
    }
  }

  const accessToken =
    authorizationHeader.slice("Bearer ".length)

  const supabase =
    await createClient()

  const {
    data: { user },
    error,
  } =
    await supabase.auth.getUser(accessToken)

  if (error || !user) {
    return {
      user: null,
      supabase,
      error:
        "Your login session is invalid or expired.",
    }
  }

  return {
    user,
    supabase,
    error: null,
  }
}

/*
 * GET PROFILE
 */
export async function GET(
  request: Request
) {
  try {
    const {
      user,
      supabase,
      error: authError,
    } =
      await getAuthenticatedUser(
        request
      )

    if (
      authError ||
      !user ||
      !supabase
    ) {
      return NextResponse.json(
        {
          message:
            authError ||
            "Unauthorized.",
        },
        {
          status: 401,
        }
      )
    }

    const {
      data: profile,
      error,
    } =
      await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          phone,
          avatar_url,
          emergency_name,
          emergency_phone,
          created_at
        `)
        .eq("id", user.id)
        .maybeSingle()

    if (error) {
      return NextResponse.json(
        {
          message:
            "Failed to load profile.",
          error:
            error.message,
        },
        {
          status: 500,
        }
      )
    }

    return NextResponse.json({
      profile,
      email:
        user.email ?? null,
    })
  } catch (error) {
    return NextResponse.json(
      {
        message:
          "Failed to load profile.",

        error:
          error instanceof Error
            ? error.message
            : "Unknown error.",
      },
      {
        status: 500,
      }
    )
  }
}

/*
 * CREATE OR UPDATE PROFILE
 */
export async function PUT(
  request: Request
) {
  try {
    const {
      user,
      supabase,
      error: authError,
    } =
      await getAuthenticatedUser(
        request
      )

    if (
      authError ||
      !user ||
      !supabase
    ) {
      return NextResponse.json(
        {
          message:
            authError ||
            "Unauthorized.",
        },
        {
          status: 401,
        }
      )
    }

    const body =
      (await request.json()) as UpdateProfileBody

    const fullName =
      body.fullName?.trim() ||
      null

    const phone =
      body.phone?.trim() ||
      null

    const avatarUrl =
      body.avatarUrl?.trim() ||
      null

    const emergencyName =
      body.emergencyName?.trim() ||
      null

    const emergencyPhone =
      body.emergencyPhone?.trim() ||
      null

    const {
      data: profile,
      error,
    } =
      await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,

            full_name:
              fullName,

            phone,

            avatar_url:
              avatarUrl,

            emergency_name:
              emergencyName,

            emergency_phone:
              emergencyPhone,
          },
          {
            onConflict: "id",
          }
        )
        .select(`
          id,
          full_name,
          phone,
          avatar_url,
          emergency_name,
          emergency_phone,
          created_at
        `)
        .single()

    if (error) {
      return NextResponse.json(
        {
          message:
            "Failed to save profile.",
          error:
            error.message,
        },
        {
          status: 500,
        }
      )
    }

    return NextResponse.json({
      message:
        "Profile saved successfully.",
      profile,
    })
  } catch (error) {
    return NextResponse.json(
      {
        message:
          "Failed to save profile.",

        error:
          error instanceof Error
            ? error.message
            : "Unknown error.",
      },
      {
        status: 500,
      }
    )
  }
}