import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

type ScanBody = {
  bookingReference?: string
  confirmCashCollected?: boolean
}

export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as ScanBody

    const bookingReference =
      body.bookingReference?.trim()

    const confirmCashCollected =
      body.confirmCashCollected ===
      true

    if (
      !bookingReference
    ) {
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
     * 1. FIND BOOKING
     * ---------------------------------------
     */

    const {
      data:
        booking,
      error:
        bookingError,
    } =
      await supabase
        .from(
          "bookings"
        )
        .select(`
          id,
          booking_reference,
          status,
          passenger_name,
          total_price,
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
     * ---------------------------------------
     * 2. LOAD PAYMENT
     * ---------------------------------------
     */

    const {
      data:
        payment,
      error:
        paymentError,
    } =
      await supabase
        .from(
          "payments"
        )
        .select(`
          id,
          booking_id,
          payment_method,
          payment_status,
          amount,
          provider,
          provider_reference,
          paid_at
        `)
        .eq(
          "booking_id",
          booking.id
        )
        .single()

    if (
      paymentError ||
      !payment
    ) {
      return NextResponse.json(
        {
          message:
            "Payment information for this booking could not be found.",

          error:
            paymentError?.message,
        },
        {
          status: 404,
        }
      )
    }

    /*
     * ---------------------------------------
     * 3. CANCELLED TICKET
     * ---------------------------------------
     */

    if (
      booking.status ===
      "cancelled"
    ) {
      return NextResponse.json(
        {
          message:
            "This booking has been cancelled.",

          booking,

          payment,

          canBoard:
            false,
        },
        {
          status: 409,
        }
      )
    }

    /*
     * ---------------------------------------
     * 4. PAYMENT STILL PENDING / FAILED
     * ---------------------------------------
     *
     * A QR ticket must never complete a booking whose
     * online payment has not succeeded.
     */

    if (
      payment.payment_method !==
        "cash" &&
      payment.payment_status !==
        "paid"
    ) {
      return NextResponse.json(
        {
          message:
            payment.payment_status ===
            "failed"
              ? "Payment failed. This passenger cannot board."
              : "Payment is still pending. This passenger cannot board yet.",

          booking,

          payment,

          canBoard:
            false,

          requiresCashCollection:
            false,
        },
        {
          status: 409,
        }
      )
    }

    /*
     * ---------------------------------------
     * 5. CASH PAYMENT DUE ON BOARDING
     * ---------------------------------------
     *
     * First scan:
     *   Return the booking + payment information and
     *   tell the scanner UI that cash must be collected.
     *
     * Second request with confirmCashCollected=true:
     *   Mark the payment paid, then complete check-in.
     */

    if (
      payment.payment_method ===
        "cash" &&
      payment.payment_status !==
        "paid"
    ) {
      if (
        !confirmCashCollected
      ) {
        return NextResponse.json(
          {
            message:
              "Cash payment is due before boarding.",

            booking,

            payment,

            canBoard:
              false,

            requiresCashCollection:
              true,

            amountDue:
              Number(
                payment.amount
              ),
          },
          {
            status: 200,
          }
        )
      }

      const now =
        new Date()
          .toISOString()

      const {
        data:
          updatedPayment,
        error:
          cashPaymentUpdateError,
      } =
        await supabase
          .from(
            "payments"
          )
          .update({
            payment_status:
              "paid",

            paid_at:
              now,

            updated_at:
              now,
          })
          .eq(
            "id",
            payment.id
          )
          .select(`
            id,
            booking_id,
            payment_method,
            payment_status,
            amount,
            provider,
            provider_reference,
            paid_at
          `)
          .single()

      if (
        cashPaymentUpdateError ||
        !updatedPayment
      ) {
        return NextResponse.json(
          {
            message:
              "Cash was confirmed, but the payment record could not be updated.",

            error:
              cashPaymentUpdateError?.message,
          },
          {
            status: 500,
          }
        )
      }

      /*
       * Use the updated payment object from this point.
       */
      Object.assign(
        payment,
        updatedPayment
      )
    }

    /*
     * ---------------------------------------
     * 6. ALREADY SCANNED
     * ---------------------------------------
     */

    if (
      booking.status ===
      "completed"
    ) {
      return NextResponse.json(
        {
          message:
            "This passenger has already checked in.",

          alreadyCompleted:
            true,

          canBoard:
            false,

          requiresCashCollection:
            false,

          booking,

          payment,
        }
      )
    }

    /*
     * ---------------------------------------
     * 7. ONLY CONFIRMED BOOKINGS MAY CHECK IN
     * ---------------------------------------
     */

    if (
      booking.status !==
      "confirmed"
    ) {
      return NextResponse.json(
        {
          message:
            "This booking cannot be checked in.",

          booking,

          payment,

          canBoard:
            false,

          requiresCashCollection:
            false,
        },
        {
          status: 409,
        }
      )
    }

    /*
     * ---------------------------------------
     * 8. FINAL PAYMENT SAFETY CHECK
     * ---------------------------------------
     */

    if (
      payment.payment_status !==
      "paid"
    ) {
      return NextResponse.json(
        {
          message:
            "Payment must be completed before check-in.",

          booking,

          payment,

          canBoard:
            false,

          requiresCashCollection:
            payment.payment_method ===
            "cash",
        },
        {
          status: 409,
        }
      )
    }

    /*
     * ---------------------------------------
     * 9. MARK BOOKING COMPLETED
     * ---------------------------------------
     */

    const {
      data:
        updatedBooking,
      error:
        updateError,
    } =
      await supabase
        .from(
          "bookings"
        )
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
          total_price,
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

    return NextResponse.json(
      {
        message:
          "Passenger checked in successfully.",

        alreadyCompleted:
          false,

        canBoard:
          true,

        requiresCashCollection:
          false,

        booking:
          updatedBooking,

        payment,
      }
    )
  } catch (
    error
  ) {
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