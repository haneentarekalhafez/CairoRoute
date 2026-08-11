import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

type PaymobRequestBody = {
  bookingId?: number
}

type PaymobIntentionResponse = {
  id?: string
  client_secret?: string
  payment_keys?: unknown
  intention_order_id?: number
  error?: string
  detail?: string
}

export async function POST(
  request: Request
) {
  try {
    /*
     * =========================================
     * 1. AUTHENTICATE CAIROROUTE USER
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
            "You must be logged in before starting payment.",
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
      (await request.json()) as PaymobRequestBody

    const bookingId =
      Number(
        body.bookingId
      )

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

    /*
     * =========================================
     * 3. CHECK PAYMOB ENVIRONMENT VARIABLES
     * =========================================
     */

    const paymobSecretKey =
      process.env.PAYMOB_SECRET_KEY

    const paymobPublicKey =
      process.env.NEXT_PUBLIC_PAYMOB_PUBLIC_KEY

    const integrationId =
      Number(
        process.env.PAYMOB_CARD_INTEGRATION_ID
      )

    if (
      !paymobSecretKey ||
      !paymobPublicKey ||
      !Number.isInteger(
        integrationId
      ) ||
      integrationId <=
        0
    ) {
      return NextResponse.json(
        {
          message:
            "Paymob sandbox configuration is incomplete.",
        },
        {
          status: 500,
        }
      )
    }

    /*
     * =========================================
     * 4. LOAD BOOKING
     * =========================================
     *
     * IMPORTANT:
     * We load the amount from our own database.
     *
     * We do NOT trust an amount sent from
     * the frontend.
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
          passenger_name,
          passenger_phone,
          passenger_email,
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
            "Payment cannot be started for a cancelled booking.",
        },
        {
          status: 400,
        }
      )
    }

    /*
     * =========================================
     * 5. LOAD PAYMENT RECORD
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
     * Only card bookings should use Paymob.
     */

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
     * 6. ALREADY PAID
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

          alreadyPaid:
            true,

          payment,
        },
        {
          status: 200,
        }
      )
    }

    /*
     * =========================================
     * 7. PREPARE PAYMOB AMOUNT
     * =========================================
     *
     * Paymob expects the amount in the
     * smallest currency unit.
     *
     * EGP 120.00 -> 12000 piastres
     */

    const amount =
      Number(
        booking.total_price
      )

    if (
      !Number.isFinite(
        amount
      ) ||
      amount <=
        0
    ) {
      return NextResponse.json(
        {
          message:
            "The booking price is invalid.",
        },
        {
          status: 400,
        }
      )
    }

    const amountInCents =
      Math.round(
        amount *
          100
      )

    /*
     * =========================================
     * 8. PASSENGER BILLING DATA
     * =========================================
     *
     * Paymob requires billing information
     * when creating the intention.
     *
     * We only have name, phone and optional email
     * in CairoRoute, so the other fields use safe
     * prototype placeholder values.
     */

    const nameParts =
      booking.passenger_name
        ?.trim()
        .split(
          /\s+/
        )
        .filter(
          Boolean
        ) ??
      []

    const firstName =
      nameParts[0] ||
      "CairoRoute"

    const lastName =
      nameParts
        .slice(
          1
        )
        .join(
          " "
        ) ||
      "Passenger"

    const email =
      booking.passenger_email ||
      user.email ||
      "customer@cairoroute.test"

    const phone =
      booking.passenger_phone ||
      "+201000000000"

    /*
     * =========================================
     * 9. CREATE REAL PAYMOB TEST INTENTION
     * =========================================
     */

    const intentionResponse =
      await fetch(
        "https://accept.paymob.com/v1/intention/",
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Token ${paymobSecretKey}`,
          },

          body:
            JSON.stringify(
              {
                amount:
                  amountInCents,

                currency:
                  "EGP",

                payment_methods: [
                  integrationId,
                ],

                items:
                  [],

                billing_data: {
                  apartment:
                    "NA",

                  first_name:
                    firstName,

                  last_name:
                    lastName,

                  street:
                    "NA",

                  building:
                    "NA",

                  phone_number:
                    phone,

                  city:
                    "Cairo",

                  country:
                    "EG",

                  email,

                  floor:
                    "NA",

                  state:
                    "Cairo",
                },

                /*
                 * This connects the Paymob transaction
                 * to our CairoRoute booking.
                 */
                special_reference:
                  booking.booking_reference,
              }
            ),
        }
      )

    const intentionResult =
      (await intentionResponse.json()) as PaymobIntentionResponse

    if (
      !intentionResponse.ok
    ) {
      return NextResponse.json(
        {
          message:
            "Paymob could not create the payment intention.",

          error:
            intentionResult.detail ||
            intentionResult.error ||
            JSON.stringify(
              intentionResult
            ),
        },
        {
          status:
            intentionResponse.status,
        }
      )
    }

    /*
     * =========================================
     * 10. GET CLIENT SECRET
     * =========================================
     */

    const clientSecret =
      intentionResult.client_secret

    if (
      !clientSecret
    ) {
      return NextResponse.json(
        {
          message:
            "Paymob did not return a checkout client secret.",
        },
        {
          status: 500,
        }
      )
    }

    /*
     * =========================================
     * 11. CREATE UNIFIED CHECKOUT URL
     * =========================================
     */

    const checkoutUrl =
      new URL(
        "https://accept.paymob.com/unifiedcheckout/"
      )

    checkoutUrl.searchParams.set(
      "publicKey",
      paymobPublicKey
    )

    checkoutUrl.searchParams.set(
      "clientSecret",
      clientSecret
    )

    /*
     * =========================================
     * 12. STORE PAYMOB REFERENCE LOCALLY
     * =========================================
     */

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
            "paymob",

          provider_reference:
            intentionResult.id ??
            booking.booking_reference,

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
            "Paymob payment was created, but CairoRoute could not update the local payment record.",

          error:
            updateError?.message,
        },
        {
          status: 500,
        }
      )
    }

    /*
     * =========================================
     * 13. RETURN CHECKOUT URL
     * =========================================
     *
     * Frontend will redirect the passenger
     * to this URL.
     */

    return NextResponse.json(
      {
        message:
          "Paymob sandbox checkout created successfully.",

        bookingId:
          booking.id,

        bookingReference:
          booking.booking_reference,

        payment:
          updatedPayment,

        clientSecret,

        checkoutUrl:
          checkoutUrl.toString(),

        sandbox:
          true,
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
          "Failed to start Paymob payment.",

        error:
          error instanceof Error
            ? error.message
            : "Unknown Paymob payment error.",
      },
      {
        status: 500,
      }
    )
  }
}