import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

type PaymentAction =
  | "process_card"
  | "generate_fawry_reference"

type PaymentRequestBody = {
  bookingId?: number
  action?: PaymentAction
}

function createTestTransactionReference() {
  const timestamp = Date.now()

  const randomPart =
    Math.floor(
      100000 +
        Math.random() *
          900000
    )

  return `TEST-${timestamp}-${randomPart}`
}

function createFawryReference() {
  /*
   * Prototype-only Fawry-style reference.
   *
   * This is NOT a real Fawry payment code.
   */
  const timestamp =
    Date.now()
      .toString()
      .slice(-7)

  const randomPart =
    Math.floor(
      100000 +
        Math.random() *
          900000
    )
      .toString()

  return `${timestamp}${randomPart}`
}

export async function POST(
  request: Request
) {
  try {
    /*
     * =========================================
     * 1. AUTHENTICATION
     * =========================================
     */

    const authorizationHeader =
      request.headers.get(
        "authorization"
      )

    if (
      !authorizationHeader ||
      !authorizationHeader.startsWith(
        "Bearer "
      )
    ) {
      return NextResponse.json(
        {
          message:
            "You must be logged in to process a payment.",
        },
        {
          status: 401,
        }
      )
    }

    const accessToken =
      authorizationHeader.slice(
        "Bearer ".length
      )

    const supabase =
      await createClient()

    const {
      data: {
        user,
      },
      error:
        userError,
    } =
      await supabase.auth.getUser(
        accessToken
      )

    if (
      userError ||
      !user
    ) {
      return NextResponse.json(
        {
          message:
            "Your login session is invalid or expired.",

          error:
            userError?.message,
        },
        {
          status: 401,
        }
      )
    }

    /*
     * =========================================
     * 2. READ REQUEST
     * =========================================
     */

    const body =
      (await request.json()) as PaymentRequestBody

    const bookingId =
      Number(
        body.bookingId
      )

    const action =
      body.action

    if (
      !Number.isInteger(
        bookingId
      ) ||
      bookingId <=
        0
    ) {
      return NextResponse.json(
        {
          message:
            "A valid booking ID is required.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      action !==
        "process_card" &&
      action !==
        "generate_fawry_reference"
    ) {
      return NextResponse.json(
        {
          message:
            "A valid payment action is required.",
        },
        {
          status: 400,
        }
      )
    }

    /*
     * =========================================
     * 3. LOAD THE BOOKING
     * =========================================
     *
     * We also verify that this booking belongs
     * to the authenticated user.
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
          user_id,
          booking_reference,
          status,
          total_price
        `)
        .eq(
          "id",
          bookingId
        )
        .eq(
          "user_id",
          user.id
        )
        .single()

    if (
      bookingError ||
      !booking
    ) {
      return NextResponse.json(
        {
          message:
            "The booking could not be found.",

          error:
            bookingError?.message,
        },
        {
          status: 404,
        }
      )
    }

    if (
      booking.status ===
      "cancelled"
    ) {
      return NextResponse.json(
        {
          message:
            "Payment cannot be processed for a cancelled booking.",
        },
        {
          status: 400,
        }
      )
    }

    /*
     * =========================================
     * 4. LOAD PAYMENT RECORD
     * =========================================
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
          paid_at,
          created_at,
          updated_at
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
     * =========================================
     * 5. ALREADY PAID
     * =========================================
     */

    if (
      payment.payment_status ===
      "paid"
    ) {
      return NextResponse.json(
        {
          message:
            "This booking has already been paid.",

          payment,

          alreadyPaid:
            true,
        },
        {
          status: 200,
        }
      )
    }

    /*
     * =========================================
     * 6. CARD SANDBOX PAYMENT
     * =========================================
     */

    if (
      action ===
      "process_card"
    ) {
      if (
        payment.payment_method !==
        "card"
      ) {
        return NextResponse.json(
          {
            message:
              "This booking was not configured for card payment.",
          },
          {
            status: 400,
          }
        )
      }

      /*
       * =========================================
       * SANDBOX SIMULATION
       * =========================================
       *
       * No real money is processed.
       *
       * For the university prototype,
       * pressing the test payment button
       * simulates a successful gateway response.
       */

      const providerReference =
        createTestTransactionReference()

      const paidAt =
        new Date()
          .toISOString()

      const {
        data:
          updatedPayment,
        error:
          updateError,
      } =
        await supabase
          .from(
            "payments"
          )
          .update({
            payment_status:
              "paid",

            provider:
              "paymob-sandbox",

            provider_reference:
              providerReference,

            paid_at:
              paidAt,

            updated_at:
              paidAt,
          })
          .eq(
            "id",
            payment.id
          )
          .select(
            "*"
          )
          .single()

      if (
        updateError ||
        !updatedPayment
      ) {
        return NextResponse.json(
          {
            message:
              "The sandbox payment could not be completed.",

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
            "Sandbox card payment completed successfully.",

          payment:
            updatedPayment,

          sandbox:
            true,
        },
        {
          status: 200,
        }
      )
    }

    /*
     * =========================================
     * 7. FAWRY REFERENCE
     * =========================================
     */

    if (
      action ===
      "generate_fawry_reference"
    ) {
      if (
        payment.payment_method !==
        "fawry"
      ) {
        return NextResponse.json(
          {
            message:
              "This booking was not configured for Fawry payment.",
          },
          {
            status: 400,
          }
        )
      }

      /*
       * If a reference has already been generated,
       * simply return it instead of creating another.
       */

      if (
        payment.provider_reference
      ) {
        return NextResponse.json(
          {
            message:
              "Fawry payment reference already exists.",

            payment,

            fawryReference:
              payment.provider_reference,
          },
          {
            status: 200,
          }
        )
      }

      const fawryReference =
        createFawryReference()

      const updatedAt =
        new Date()
          .toISOString()

      const {
        data:
          updatedPayment,
        error:
          updateError,
      } =
        await supabase
          .from(
            "payments"
          )
          .update({
            payment_status:
              "pending",

            provider:
              "fawry-sandbox",

            provider_reference:
              fawryReference,

            updated_at:
              updatedAt,
          })
          .eq(
            "id",
            payment.id
          )
          .select(
            "*"
          )
          .single()

      if (
        updateError ||
        !updatedPayment
      ) {
        return NextResponse.json(
          {
            message:
              "Failed to generate the Fawry reference.",

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
            "Fawry payment reference generated successfully.",

          payment:
            updatedPayment,

          fawryReference,
        },
        {
          status: 200,
        }
      )
    }

    /*
     * Should never reach this point,
     * because actions were validated above.
     */

    return NextResponse.json(
      {
        message:
          "Unsupported payment action.",
      },
      {
        status: 400,
      }
    )
  } catch (
    error
  ) {
    return NextResponse.json(
      {
        message:
          "Invalid payment request.",

        error:
          error instanceof Error
            ? error.message
            : "Unknown payment error.",
      },
      {
        status: 400,
      }
    )
  }
}