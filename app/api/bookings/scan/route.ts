import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

type ScanBody = {
  bookingReference?: string
}

export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as ScanBody

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
     * Find booking.
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
          passenger_name,
          trip_id
        `)
        .eq(
          "booking_reference",
          bookingReference
        )
        .single()

    if (
      bookingError ||
      !booking
    ) {
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

    /*
     * Cancelled ticket.
     */
    if (
      booking.status ===
      "cancelled"
    ) {
      return NextResponse.json(
        {
          message:
            "This booking has been cancelled.",
        },
        {
          status: 409,
        }
      )
    }

    /*
     * Already scanned.
     *
     * Return success instead of an error.
     */
    if (
      booking.status ===
      "completed"
    ) {
      return NextResponse.json({
        message:
          "This passenger has already checked in.",

        alreadyCompleted:
          true,

        booking,
      })
    }

    if (
      booking.status !==
      "confirmed"
    ) {
      return NextResponse.json(
        {
          message:
            "This booking cannot be checked in.",
        },
        {
          status: 409,
        }
      )
    }

    /*
     * Mark booking completed.
     */
    const {
      data: updatedBooking,
      error: updateError,
    } =
      await supabase
        .from("bookings")
        .update({
          status:
            "completed",
        })
        .eq(
          "id",
          booking.id
        )
        .select(`
          id,
          booking_reference,
          status,
          passenger_name,
          trip_id
        `)
        .single()

    if (
      updateError ||
      !updatedBooking
    ) {
      return NextResponse.json(
        {
          message:
            "Failed to check in passenger.",
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
        "Passenger checked in successfully.",

      alreadyCompleted:
        false,

      booking:
        updatedBooking,
    })
  } catch (error) {
    return NextResponse.json(
      {
        message:
          "Invalid scan request.",

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