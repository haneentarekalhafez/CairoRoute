import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

type CancelBookingBody = {
  bookingReference?: string
}

async function getAuthenticatedUser(
  request: Request
) {
  const authorization =
    request.headers.get(
      "authorization"
    )

  if (
    !authorization ||
    !authorization.startsWith(
      "Bearer "
    )
  ) {
    return {
      user: null,
      error:
        "Missing authentication token.",
    }
  }

  const accessToken =
    authorization
      .replace(
        "Bearer ",
        ""
      )
      .trim()

  if (!accessToken) {
    return {
      user: null,
      error:
        "Missing authentication token.",
    }
  }

  const supabase =
    await createClient()

  const {
    data: {
      user,
    },
    error,
  } =
    await supabase.auth.getUser(
      accessToken
    )

  if (
    error ||
    !user
  ) {
    return {
      user: null,
      error:
        "Invalid or expired login session.",
    }
  }

  return {
    user,
    error: null,
  }
}

export async function POST(
  request: Request
) {
  try {
    /*
     * ---------------------------------------
     * AUTHENTICATE USER
     * ---------------------------------------
     */

    const {
      user,
      error: authError,
    } =
      await getAuthenticatedUser(
        request
      )

    if (
      authError ||
      !user
    ) {
      return NextResponse.json(
        {
          message:
            authError ||
            "You must be logged in.",
        },
        {
          status: 401,
        }
      )
    }

    /*
     * ---------------------------------------
     * READ REQUEST
     * ---------------------------------------
     */

    const body =
      (await request.json()) as CancelBookingBody

    const bookingReference =
      body.bookingReference?.trim()

    if (!bookingReference) {
      return NextResponse.json(
        {
          message:
            "Booking reference is required.",
        },
        {
          status: 400,
        }
      )
    }

    const supabase =
      await createClient()

    /*
     * ---------------------------------------
     * FIND USER'S BOOKING
     * ---------------------------------------
     *
     * Important:
     * we check both booking_reference
     * AND user_id.
     *
     * A user cannot cancel another
     * passenger's booking.
     */

    const {
      data: booking,
      error: bookingError,
    } =
      await supabase
        .from("bookings")
        .select(`
          id,
          booking_reference,
          status,
          user_id,
          trip_id,
          passenger_name
        `)
        .eq(
          "booking_reference",
          bookingReference
        )
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle()

    if (
      bookingError
    ) {
      return NextResponse.json(
        {
          message:
            "Failed to find booking.",

          error:
            bookingError.message,
        },
        {
          status: 500,
        }
      )
    }

    if (!booking) {
      return NextResponse.json(
        {
          message:
            "Booking not found.",
        },
        {
          status: 404,
        }
      )
    }

    const status =
      booking.status.toLowerCase()

    /*
     * ---------------------------------------
     * ALREADY CANCELLED
     * ---------------------------------------
     */

    if (
      status ===
      "cancelled"
    ) {
      return NextResponse.json({
        message:
          "This booking is already cancelled.",

        alreadyCancelled:
          true,

        booking,
      })
    }

    /*
     * ---------------------------------------
     * COMPLETED BOOKINGS
     * ---------------------------------------
     */

    if (
      status ===
      "completed"
    ) {
      return NextResponse.json(
        {
          message:
            "A completed booking cannot be cancelled.",
        },
        {
          status: 409,
        }
      )
    }

    /*
     * ---------------------------------------
     * ONLY CONFIRMED BOOKINGS
     * ---------------------------------------
     */

    if (
      status !==
      "confirmed"
    ) {
      return NextResponse.json(
        {
          message:
            "This booking cannot be cancelled.",
        },
        {
          status: 409,
        }
      )
    }

    /*
     * ---------------------------------------
     * CANCEL BOOKING
     * ---------------------------------------
     */

    const {
      data: updatedBooking,
      error: updateError,
    } =
      await supabase
        .from("bookings")
        .update({
          status:
            "cancelled",
        })
        .eq(
          "id",
          booking.id
        )
        .eq(
          "user_id",
          user.id
        )
        .select(`
          id,
          booking_reference,
          status,
          user_id,
          trip_id,
          passenger_name
        `)
        .single()

    if (
      updateError ||
      !updatedBooking
    ) {
      return NextResponse.json(
        {
          message:
            "Failed to cancel booking.",

          error:
            updateError?.message,
        },
        {
          status: 500,
        }
      )
    }

    return NextResponse.json({
      message:
        "Booking cancelled successfully.",

      alreadyCancelled:
        false,

      booking:
        updatedBooking,
    })
  } catch (error) {
    return NextResponse.json(
      {
        message:
          "Invalid cancellation request.",

        error:
          error instanceof Error
            ? error.message
            : "Unknown error.",
      },
      {
        status: 400,
      }
    )
  }
}