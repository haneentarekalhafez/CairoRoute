import {
  NextResponse,
} from "next/server"

import {
  createClient,
} from "@/lib/supabase/server"

export async function GET(
  request: Request
) {
  try {
    const requestUrl =
      new URL(
        request.url
      )

    const transactionId =
      requestUrl.searchParams
        .get(
          "transactionId"
        )
        ?.trim() ||
      null

    const bookingReference =
      requestUrl.searchParams
        .get(
          "bookingReference"
        )
        ?.trim() ||
      null

    if (
      !transactionId &&
      !bookingReference
    ) {
      return NextResponse.json(
        {
          message:
            "A transaction ID or booking reference is required.",
        },
        {
          status: 400,
        }
      )
    }

    const supabase =
      await createClient()

    let bookingId:
      number | null =
      null

    /*
     * ---------------------------------------
     * 1. FIND BOOKING BY CAIROROUTE REFERENCE
     * ---------------------------------------
     */

    if (
      bookingReference
    ) {
      const {
        data:
          bookingByReference,
        error:
          bookingLookupError,
      } =
        await supabase
          .from(
            "bookings"
          )
          .select(`
            id
          `)
          .eq(
            "booking_reference",
            bookingReference
          )
          .maybeSingle()

      if (
        bookingLookupError
      ) {
        return NextResponse.json(
          {
            message:
              "Failed to look up the booking.",

            error:
              bookingLookupError.message,
          },
          {
            status: 500,
          }
        )
      }

      if (
        bookingByReference
      ) {
        bookingId =
          Number(
            bookingByReference.id
          )
      }
    }

    /*
     * ---------------------------------------
     * 2. FALL BACK TO PAYMOB TRANSACTION ID
     * ---------------------------------------
     *
     * The verified webhook stores Paymob's transaction
     * ID in payments.provider_reference.
     */

    if (
      !bookingId &&
      transactionId
    ) {
      const {
        data:
          paymentByTransaction,
        error:
          paymentLookupError,
      } =
        await supabase
          .from(
            "payments"
          )
          .select(`
            booking_id
          `)
          .eq(
            "provider_reference",
            transactionId
          )
          .maybeSingle()

      if (
        paymentLookupError
      ) {
        return NextResponse.json(
          {
            message:
              "Failed to look up the payment transaction.",

            error:
              paymentLookupError.message,
          },
          {
            status: 500,
          }
        )
      }

      if (
        paymentByTransaction
      ) {
        bookingId =
          Number(
            paymentByTransaction.booking_id
          )
      }
    }

    /*
     * ---------------------------------------
     * 3. WEBHOOK MAY STILL BE PROCESSING
     * ---------------------------------------
     *
     * Returning 404 here is intentional. The return
     * page will retry briefly while the Paymob webhook
     * finishes updating Supabase.
     */

    if (
      !bookingId
    ) {
      return NextResponse.json(
        {
          message:
            "Payment confirmation has not reached CairoRoute yet.",
        },
        {
          status: 404,
        }
      )
    }

    /*
     * ---------------------------------------
     * 4. LOAD BOOKING STATUS
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
          status
        `)
        .eq(
          "id",
          bookingId
        )
        .single()

    if (
      bookingError ||
      !booking
    ) {
      return NextResponse.json(
        {
          message:
            "The CairoRoute booking could not be found.",

          error:
            bookingError?.message,
        },
        {
          status: 404,
        }
      )
    }

    /*
     * ---------------------------------------
     * 5. LOAD PAYMENT STATUS
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
          payment_method,
          payment_status,
          amount
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
            "The payment record could not be found.",

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
     * 6. RETURN ONLY THE STATUS DATA NEEDED
     * ---------------------------------------
     *
     * No passenger phone, email, or other private
     * booking details are exposed by this endpoint.
     */

    return NextResponse.json(
      {
        booking: {
          id:
            Number(
              booking.id
            ),

          bookingReference:
            booking.booking_reference,

          status:
            booking.status,
        },

        payment: {
          paymentMethod:
            payment.payment_method,

          paymentStatus:
            payment.payment_status,

          amount:
            Number(
              payment.amount
            ),
        },
      },
      {
        status: 200,
      }
    )
  } catch (
    error
  ) {
    return NextResponse.json(
      {
        message:
          "Failed to check payment status.",

        error:
          error instanceof Error
            ? error.message
            : "Unknown payment status error.",
      },
      {
        status: 500,
      }
    )
  }
}