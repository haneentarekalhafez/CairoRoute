import {
  createHmac,
  timingSafeEqual,
} from "crypto"

import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

/*
 * =========================================
 * PAYMOB TRANSACTION CALLBACK TYPES
 * =========================================
 */

type PaymobOrder = {
  id?: number | string
  merchant_order_id?: string | null
}

type PaymobSourceData = {
  pan?: string | null
  sub_type?: string | null
  type?: string | null
}

type PaymobPaymentKeyClaims = {
  extra?: {
    special_reference?: string | null
  } | null
}

type PaymobTransaction = {
  id?: number | string

  amount_cents?: number | string

  created_at?: string

  currency?: string

  error_occured?: boolean

  has_parent_transaction?: boolean

  integration_id?: number | string

  is_3d_secure?: boolean

  is_auth?: boolean

  is_capture?: boolean

  is_refunded?: boolean

  is_standalone_payment?: boolean

  is_voided?: boolean

  order?: PaymobOrder | number | string | null

  owner?: number | string

  pending?: boolean

  source_data?: PaymobSourceData | null

  success?: boolean

  special_reference?: string | null

  payment_key_claims?: PaymobPaymentKeyClaims | null
}

type PaymobCallbackBody = {
  type?: string
  obj?: PaymobTransaction
}

/*
 * =========================================
 * HMAC HELPERS
 * =========================================
 *
 * Paymob's transaction callback HMAC is built
 * by concatenating the transaction values in
 * the required order and hashing them with
 * HMAC-SHA512.
 */

function valueForHmac(
  value: unknown
) {
  if (
    value ===
      null ||
    value ===
      undefined
  ) {
    return ""
  }

  if (
    typeof value ===
    "boolean"
  ) {
    return value
      ? "true"
      : "false"
  }

  return String(
    value
  )
}

function getOrderId(
  order:
    PaymobTransaction["order"]
) {
  if (
    typeof order ===
      "number" ||
    typeof order ===
      "string"
  ) {
    return order
  }

  return order?.id
}

function createPaymobTransactionHmac(
  transaction:
    PaymobTransaction,
  hmacSecret:
    string
) {
  const sourceData =
    transaction.source_data ??
    {}

  const values = [
    transaction.amount_cents,
    transaction.created_at,
    transaction.currency,
    transaction.error_occured,
    transaction.has_parent_transaction,
    transaction.id,
    transaction.integration_id,
    transaction.is_3d_secure,
    transaction.is_auth,
    transaction.is_capture,
    transaction.is_refunded,
    transaction.is_standalone_payment,
    transaction.is_voided,
    getOrderId(
      transaction.order
    ),
    transaction.owner,
    transaction.pending,
    sourceData.pan,
    sourceData.sub_type,
    sourceData.type,
    transaction.success,
  ]

  const concatenated =
    values
      .map(
        valueForHmac
      )
      .join("")

  return createHmac(
    "sha512",
    hmacSecret
  )
    .update(
      concatenated
    )
    .digest(
      "hex"
    )
}

function secureHmacMatch(
  expected: string,
  received: string
) {
  const expectedBuffer =
    Buffer.from(
      expected,
      "utf8"
    )

  const receivedBuffer =
    Buffer.from(
      received,
      "utf8"
    )

  if (
    expectedBuffer.length !==
    receivedBuffer.length
  ) {
    return false
  }

  return timingSafeEqual(
    expectedBuffer,
    receivedBuffer
  )
}

/*
 * =========================================
 * BOOKING REFERENCE CANDIDATES
 * =========================================
 *
 * We send CairoRoute's booking reference to
 * Paymob as special_reference when creating
 * the intention.
 *
 * Paymob callback payloads can expose that
 * reference in slightly different nested
 * locations depending on the payment flow,
 * so we safely check the known locations.
 */

function getBookingReferenceCandidates(
  transaction:
    PaymobTransaction
) {
  const candidates =
    new Set<string>()

  if (
    transaction.special_reference
  ) {
    candidates.add(
      String(
        transaction.special_reference
      )
    )
  }

  const specialReference =
    transaction
      .payment_key_claims
      ?.extra
      ?.special_reference

  if (
    specialReference
  ) {
    candidates.add(
      String(
        specialReference
      )
    )
  }

  if (
    transaction.order &&
    typeof transaction.order ===
      "object" &&
    transaction.order
      .merchant_order_id
  ) {
    candidates.add(
      String(
        transaction.order
          .merchant_order_id
      )
    )
  }

  return [
    ...candidates,
  ]
}

/*
 * =========================================
 * WEBHOOK
 * =========================================
 */

export async function POST(
  request: Request
) {
  try {
    /*
     * =========================================
     * 1. CHECK HMAC CONFIGURATION
     * =========================================
     */

    const hmacSecret =
      process.env
        .PAYMOB_HMAC_SECRET

    if (
      !hmacSecret
    ) {
      return NextResponse.json(
        {
          message:
            "Paymob HMAC configuration is missing.",
        },
        {
          status: 500,
        }
      )
    }

    /*
     * =========================================
     * 2. GET RECEIVED HMAC
     * =========================================
     *
     * Paymob sends the HMAC in the callback
     * URL query string:
     *
     * ?hmac=...
     */

    const requestUrl =
      new URL(
        request.url
      )

    const receivedHmac =
      requestUrl.searchParams.get(
        "hmac"
      )

    if (
      !receivedHmac
    ) {
      return NextResponse.json(
        {
          message:
            "Missing Paymob HMAC.",
        },
        {
          status: 401,
        }
      )
    }

    /*
     * =========================================
     * 3. READ CALLBACK
     * =========================================
     */

    const body =
      (await request.json()) as PaymobCallbackBody

    const transaction =
      body.obj

    if (
      !transaction
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid Paymob callback payload.",
        },
        {
          status: 400,
        }
      )
    }

    /*
     * =========================================
     * 4. VERIFY HMAC
     * =========================================
     */

    const calculatedHmac =
      createPaymobTransactionHmac(
        transaction,
        hmacSecret
      )

    if (
      !secureHmacMatch(
        calculatedHmac,
        receivedHmac
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid Paymob callback signature.",
        },
        {
          status: 401,
        }
      )
    }

    /*
     * =========================================
     * 5. VERIFY THIS IS OUR CARD INTEGRATION
     * =========================================
     */

    const configuredIntegrationId =
      Number(
        process.env
          .PAYMOB_CARD_INTEGRATION_ID
      )

    const callbackIntegrationId =
      Number(
        transaction.integration_id
      )

    if (
      !Number.isInteger(
        configuredIntegrationId
      ) ||
      configuredIntegrationId <=
        0
    ) {
      return NextResponse.json(
        {
          message:
            "Paymob card integration ID is not configured.",
        },
        {
          status: 500,
        }
      )
    }

    if (
      callbackIntegrationId !==
      configuredIntegrationId
    ) {
      return NextResponse.json(
        {
          message:
            "Callback belongs to a different Paymob integration.",
        },
        {
          status: 400,
        }
      )
    }

    /*
     * =========================================
     * 6. FIND THE CAIROROUTE BOOKING
     * =========================================
     */

    const supabase =
      await createClient()

    const bookingReferenceCandidates =
      getBookingReferenceCandidates(
        transaction
      )

    let booking:
      | {
          id: number
          trip_id: number
          booking_reference: string
          status: string
          total_price: number
          pending_seat_numbers: number[] | null
        }
      | null =
      null

    /*
     * First choice:
     * match the special_reference /
     * merchant order reference back to our
     * booking_reference.
     */

    for (
      const candidate
      of bookingReferenceCandidates
    ) {
      const {
        data,
      } =
        await supabase
          .from(
            "bookings"
          )
          .select(`
            id,
            trip_id,
            booking_reference,
            status,
            total_price,
            pending_seat_numbers
          `)
          .eq(
            "booking_reference",
            candidate
          )
          .maybeSingle()

      if (
        data
      ) {
        booking =
          data

        break
      }
    }

    /*
     * Fallback:
     * If Paymob did not echo the special
     * reference in the expected location,
     * try the Paymob order/transaction
     * references stored on our payment row.
     */

    if (
      !booking
    ) {
      const possibleProviderReferences =
        [
          transaction.id,
          getOrderId(
            transaction.order
          ),
        ]
          .filter(
            (
              value
            ) =>
              value !==
                undefined &&
              value !==
                null
          )
          .map(
            (
              value
            ) =>
              String(
                value
              )
          )

      for (
        const reference
        of possibleProviderReferences
      ) {
        const {
          data:
            paymentByReference,
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
              reference
            )
            .maybeSingle()

        if (
          !paymentByReference
        ) {
          continue
        }

        const {
          data:
            bookingByPayment,
        } =
          await supabase
            .from(
              "bookings"
            )
            .select(`
              id,
              trip_id,
              booking_reference,
              status,
              total_price,
              pending_seat_numbers
            `)
            .eq(
              "id",
              paymentByReference
                .booking_id
            )
            .maybeSingle()

        if (
          bookingByPayment
        ) {
          booking =
            bookingByPayment

          break
        }
      }
    }

    if (
      !booking
    ) {
      return NextResponse.json(
        {
          message:
            "No CairoRoute booking matches this Paymob callback.",
        },
        {
          status: 404,
        }
      )
    }

    /*
     * =========================================
     * 7. LOAD THE PAYMENT ROW
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
            "The CairoRoute payment record could not be found.",

          error:
            paymentError?.message,
        },
        {
          status: 404,
        }
      )
    }

    if (
      payment.payment_method !==
      "card"
    ) {
      return NextResponse.json(
        {
          message:
            "This booking is not configured for card payment.",
        },
        {
          status: 400,
        }
      )
    }

    /*
     * =========================================
     * 8. VERIFY AMOUNT + CURRENCY
     * =========================================
     *
     * Never accept "success" for the wrong
     * amount.
     */

    const callbackAmountCents =
      Number(
        transaction.amount_cents
      )

    const expectedAmountCents =
      Math.round(
        Number(
          payment.amount
        ) *
          100
      )

    if (
      !Number.isFinite(
        callbackAmountCents
      ) ||
      callbackAmountCents !==
        expectedAmountCents
    ) {
      return NextResponse.json(
        {
          message:
            "Paymob callback amount does not match the booking.",
        },
        {
          status: 400,
        }
      )
    }

    if (
      String(
        transaction.currency ??
          ""
      ).toUpperCase() !==
      "EGP"
    ) {
      return NextResponse.json(
        {
          message:
            "Paymob callback currency does not match the booking.",
        },
        {
          status: 400,
        }
      )
    }

    /*
     * =========================================
     * 9. DETERMINE FINAL PAYMENT RESULT
     * =========================================
     */

    const transactionSucceeded =
      transaction.success ===
        true &&
      transaction.pending !==
        true &&
      transaction.error_occured !==
        true &&
      transaction.is_voided !==
        true &&
      transaction.is_refunded !==
        true

    const now =
      new Date()
        .toISOString()

    const transactionReference =
      transaction.id !==
        undefined &&
      transaction.id !==
        null
        ? String(
            transaction.id
          )
        : payment
            .provider_reference

    /*
     * =========================================
     * 10. SUCCESSFUL CARD PAYMENT
     * =========================================
     */

    if (
      transactionSucceeded
    ) {
      /*
       * =========================================
       * 10A. IDEMPOTENT ALREADY-CONFIRMED CHECK
       * =========================================
       *
       * Paymob may retry a webhook. If this booking
       * is already fully confirmed and paid, return
       * success instead of creating duplicate seats.
       */

      if (
        payment.payment_status ===
          "paid" &&
        booking.status ===
          "confirmed"
      ) {
        return NextResponse.json(
          {
            message:
              "Paymob payment was already processed.",

            bookingId:
              booking.id,

            bookingReference:
              booking.booking_reference,

            paymentStatus:
              "paid",

            bookingStatus:
              "confirmed",
          },
          {
            status: 200,
          }
        )
      }

      /*
       * =========================================
       * 10B. GET THE SEATS REQUESTED BEFORE PAYMENT
       * =========================================
       */

      const requestedSeats =
        Array.isArray(
          booking.pending_seat_numbers
        )
          ? [
              ...new Set(
                booking.pending_seat_numbers
                  .map(
                    (
                      seat
                    ) =>
                      Number(
                        seat
                      )
                  )
                  .filter(
                    (
                      seat
                    ) =>
                      Number.isInteger(
                        seat
                      ) &&
                      seat >
                        0
                  )
              ),
            ]
          : []

      if (
        requestedSeats.length ===
        0
      ) {
        return NextResponse.json(
          {
            message:
              "The paid booking has no pending seat information.",
          },
          {
            status: 409,
          }
        )
      }

      /*
       * =========================================
       * 10C. RE-CHECK SEAT AVAILABILITY
       * =========================================
       *
       * Online payments do not reserve the seat before
       * payment. Therefore we MUST check again now.
       *
       * A webhook retry may find seats already created
       * for this same booking; those are safe.
       */

      const {
        data:
          seatRows,
        error:
          seatLookupError,
      } =
        await supabase
          .from(
            "booking_seats"
          )
          .select(`
            id,
            booking_id,
            trip_id,
            seat_number
          `)
          .eq(
            "trip_id",
            booking.trip_id
          )
          .in(
            "seat_number",
            requestedSeats
          )

      if (
        seatLookupError
      ) {
        return NextResponse.json(
          {
            message:
              "Payment succeeded, but CairoRoute could not re-check seat availability.",

            error:
              seatLookupError.message,
          },
          {
            status: 500,
          }
        )
      }

      const conflictingSeats =
        (
          seatRows ??
          []
        )
          .filter(
            (
              seatRow
            ) =>
              Number(
                seatRow.booking_id
              ) !==
              Number(
                booking.id
              )
          )
          .map(
            (
              seatRow
            ) =>
              Number(
                seatRow.seat_number
              )
          )

      if (
        conflictingSeats.length >
        0
      ) {
        /*
         * The payment itself succeeded, but another
         * booking took the seat before checkout ended.
         *
         * We record the successful provider payment,
         * but deliberately DO NOT confirm the booking.
         * This avoids issuing an invalid ticket.
         */

        const {
          error:
            conflictPaymentUpdateError,
        } =
          await supabase
            .from(
              "payments"
            )
            .update({
              payment_status:
                "paid",

              provider:
                "paymob",

              provider_reference:
                transactionReference,

              paid_at:
                now,

              updated_at:
                now,
            })
            .eq(
              "id",
              payment.id
            )

        if (
          conflictPaymentUpdateError
        ) {
          return NextResponse.json(
            {
              message:
                "Payment succeeded, but CairoRoute could not record the payment conflict.",

              error:
                conflictPaymentUpdateError.message,
            },
            {
              status: 500,
            }
          )
        }

        return NextResponse.json(
          {
            message:
              "Payment succeeded, but one or more selected seats were taken before payment finished.",

            bookingId:
              booking.id,

            bookingReference:
              booking.booking_reference,

            paymentStatus:
              "paid",

            bookingStatus:
              booking.status,

            unavailableSeats:
              conflictingSeats,
          },
          {
            status: 409,
          }
        )
      }

      /*
       * =========================================
       * 10D. CREATE ANY MISSING BOOKING_SEATS
       * =========================================
       */

      const seatsAlreadyOwnedByBooking =
        new Set(
          (
            seatRows ??
            []
          )
            .filter(
              (
                seatRow
              ) =>
                Number(
                  seatRow.booking_id
                ) ===
                Number(
                  booking.id
                )
            )
            .map(
              (
                seatRow
              ) =>
                Number(
                  seatRow.seat_number
                )
            )
        )

      const missingSeats =
        requestedSeats.filter(
          (
            seat
          ) =>
            !seatsAlreadyOwnedByBooking.has(
              seat
            )
        )

      if (
        missingSeats.length >
        0
      ) {
        const {
          error:
            seatInsertError,
        } =
          await supabase
            .from(
              "booking_seats"
            )
            .insert(
              missingSeats.map(
                (
                  seatNumber
                ) => ({
                  booking_id:
                    booking.id,

                  trip_id:
                    booking.trip_id,

                  seat_number:
                    seatNumber,
                })
              )
            )

        if (
          seatInsertError
        ) {
          return NextResponse.json(
            {
              message:
                "Payment succeeded, but CairoRoute could not reserve the selected seat.",

              error:
                seatInsertError.message,
            },
            {
              status: 500,
            }
          )
        }
      }

      /*
       * =========================================
       * 10E. MARK PAYMENT PAID
       * =========================================
       */

      const {
        error:
          paymentUpdateError,
      } =
        await supabase
          .from(
            "payments"
          )
          .update({
            payment_status:
              "paid",

            provider:
              "paymob",

            provider_reference:
              transactionReference,

            paid_at:
              now,

            updated_at:
              now,
          })
          .eq(
            "id",
            payment.id
          )

      if (
        paymentUpdateError
      ) {
        return NextResponse.json(
          {
            message:
              "The Paymob payment succeeded, but the local payment record could not be updated.",

            error:
              paymentUpdateError.message,
          },
          {
            status: 500,
          }
        )
      }

      /*
       * =========================================
       * 10F. CONFIRM BOOKING + CLEAR PENDING SEATS
       * =========================================
       */

      const {
        error:
          bookingUpdateError,
      } =
        await supabase
          .from(
            "bookings"
          )
          .update({
            status:
              "confirmed",

            pending_seat_numbers:
              null,
          })
          .eq(
            "id",
            booking.id
          )

      if (
        bookingUpdateError
      ) {
        return NextResponse.json(
          {
            message:
              "Payment was marked as paid and the seat was reserved, but the booking could not be confirmed.",

            error:
              bookingUpdateError.message,
          },
          {
            status: 500,
          }
        )
      }

      return NextResponse.json(
        {
          message:
            "Paymob payment verified, seat reserved, and booking confirmed.",

          bookingId:
            booking.id,

          bookingReference:
            booking.booking_reference,

          paymentStatus:
            "paid",

          bookingStatus:
            "confirmed",

          seats:
            requestedSeats,
        },
        {
          status: 200,
        }
      )
    }

    /*
     * =========================================
     * 11. DECLINED / FAILED CARD PAYMENT
     * =========================================
     *
     * Paymob sends transaction callbacks for
     * successful or declined transactions.
     *
     * A failed card payment must NOT confirm
     * the booking.
     */

    const {
      error:
        failedPaymentUpdateError,
    } =
      await supabase
        .from(
          "payments"
        )
        .update({
          payment_status:
            "failed",

          provider:
            "paymob",

          provider_reference:
            transactionReference,

          paid_at:
            null,

          updated_at:
            now,
        })
        .eq(
          "id",
          payment.id
        )

    if (
      failedPaymentUpdateError
    ) {
      return NextResponse.json(
        {
          message:
            "Failed Paymob transaction received, but the payment record could not be updated.",

          error:
            failedPaymentUpdateError.message,
        },
        {
          status: 500,
        }
      )
    }

    /*
     * Booking remains pending_payment.
     * We deliberately do NOT confirm it.
     */

    return NextResponse.json(
      {
        message:
          "Paymob transaction was not successful.",

        bookingId:
          booking.id,

        bookingReference:
          booking.booking_reference,

        paymentStatus:
          "failed",

        bookingStatus:
          booking.status,
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
          "Invalid Paymob webhook request.",

        error:
          error instanceof Error
            ? error.message
            : "Unknown Paymob webhook error.",
      },
      {
        status: 500,
      }
    )
  }
}