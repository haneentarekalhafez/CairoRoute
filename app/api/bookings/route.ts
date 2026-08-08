import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

type CreateBookingBody = {
  tripId?: number
  seatNumbers?: number[]
  passengerName?: string
  passengerPhone?: string
  passengerEmail?: string | null
}

function createBookingReference() {
  const timestamp = Date.now().toString()

  const randomPart = Math.floor(
    1000 + Math.random() * 9000
  ).toString()

  return `CR-${timestamp}-${randomPart}`
}

export async function POST(request: Request) {
  try {
    /*
     * -------------------------------------------------
     * 1. GET THE LOGIN TOKEN FROM THE REQUEST
     * -------------------------------------------------
     */

    const authorizationHeader =
      request.headers.get("authorization")

    if (
      !authorizationHeader ||
      !authorizationHeader.startsWith("Bearer ")
    ) {
      return NextResponse.json(
        {
          message:
            "You must be logged in before creating a booking.",
        },
        {
          status: 401,
        }
      )
    }

    const accessToken =
      authorizationHeader.slice("Bearer ".length)

    const supabase = await createClient()

    /*
     * -------------------------------------------------
     * 2. VERIFY THE TOKEN AND GET THE REAL USER
     * -------------------------------------------------
     */

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken)

    if (userError || !user) {
      return NextResponse.json(
        {
          message:
            "Your login session is invalid or expired.",
          error: userError?.message,
        },
        {
          status: 401,
        }
      )
    }

    /*
     * -------------------------------------------------
     * 3. READ BOOKING DATA
     * -------------------------------------------------
     */

    const body =
      (await request.json()) as CreateBookingBody

    const tripId = Number(body.tripId)

    const seatNumbers =
      body.seatNumbers ?? []

    const passengerName =
      body.passengerName?.trim() || ""

    const passengerPhone =
      body.passengerPhone?.trim() || ""

    const passengerEmail =
      body.passengerEmail?.trim() || null

    /*
     * -------------------------------------------------
     * 4. VALIDATE PASSENGER/TRIP DATA
     * -------------------------------------------------
     */

    if (
      !Number.isInteger(tripId) ||
      tripId <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "A valid trip ID is required.",
        },
        {
          status: 400,
        }
      )
    }

    if (!passengerName) {
      return NextResponse.json(
        {
          message:
            "Passenger name is required.",
        },
        {
          status: 400,
        }
      )
    }

    if (!passengerPhone) {
      return NextResponse.json(
        {
          message:
            "Passenger phone is required.",
        },
        {
          status: 400,
        }
      )
    }

    const cleanedSeatNumbers = [
      ...new Set(
        seatNumbers
          .map((seatNumber) =>
            Number(seatNumber)
          )
          .filter(
            (seatNumber) =>
              Number.isInteger(seatNumber) &&
              seatNumber > 0
          )
      ),
    ]

    if (cleanedSeatNumbers.length === 0) {
      return NextResponse.json(
        {
          message:
            "Select at least one valid seat.",
        },
        {
          status: 400,
        }
      )
    }

    /*
     * -------------------------------------------------
     * 5. GET THE TRIP
     * -------------------------------------------------
     */

    const {
      data: trip,
      error: tripError,
    } = await supabase
      .from("trips")
      .select(`
        id,
        price,
        status,
        departure_time,

        bus:buses (
          id,
          capacity
        )
      `)
      .eq("id", tripId)
      .single()

    if (tripError || !trip) {
      return NextResponse.json(
        {
          message:
            "The selected trip was not found.",
          error: tripError?.message,
        },
        {
          status: 404,
        }
      )
    }

    if (trip.status !== "scheduled") {
      return NextResponse.json(
        {
          message:
            "This trip is not available for booking.",
        },
        {
          status: 400,
        }
      )
    }

    /*
     * -------------------------------------------------
     * 6. MAKE SURE THE TRIP HAS NOT DEPARTED
     * -------------------------------------------------
     */

    const departureTime =
      new Date(
        trip.departure_time
      ).getTime()

    if (
      !Number.isFinite(departureTime) ||
      departureTime <= Date.now()
    ) {
      return NextResponse.json(
        {
          message:
            "This trip has already departed.",
        },
        {
          status: 400,
        }
      )
    }

    /*
     * -------------------------------------------------
     * 7. CHECK BUS CAPACITY
     * -------------------------------------------------
     */

    const bus = Array.isArray(trip.bus)
      ? trip.bus[0]
      : trip.bus

    if (!bus) {
      return NextResponse.json(
        {
          message:
            "No bus is connected to this trip.",
        },
        {
          status: 400,
        }
      )
    }

    const busCapacity =
      Number(bus.capacity)

    if (
      !Number.isInteger(busCapacity) ||
      busCapacity <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "The bus capacity is invalid.",
        },
        {
          status: 400,
        }
      )
    }

    const invalidSeat =
      cleanedSeatNumbers.find(
        (seatNumber) =>
          seatNumber < 1 ||
          seatNumber > busCapacity
      )

    if (invalidSeat !== undefined) {
      return NextResponse.json(
        {
          message: `Seat ${invalidSeat} does not exist on this bus.`,
        },
        {
          status: 400,
        }
      )
    }

    /*
     * -------------------------------------------------
     * 8. CHECK WHETHER THE SEAT IS ALREADY BOOKED
     * -------------------------------------------------
     */

    const {
      data: existingSeats,
      error: existingSeatsError,
    } = await supabase
      .from("booking_seats")
      .select("seat_number")
      .eq("trip_id", tripId)
      .in(
        "seat_number",
        cleanedSeatNumbers
      )

    if (existingSeatsError) {
      return NextResponse.json(
        {
          message:
            "Failed to check seat availability.",
          error:
            existingSeatsError.message,
        },
        {
          status: 500,
        }
      )
    }

    if (
      existingSeats &&
      existingSeats.length > 0
    ) {
      return NextResponse.json(
        {
          message:
            "One or more selected seats are already reserved.",

          unavailableSeats:
            existingSeats.map(
              (seat) =>
                Number(
                  seat.seat_number
                )
            ),
        },
        {
          status: 409,
        }
      )
    }

    /*
     * -------------------------------------------------
     * 9. CALCULATE PRICE
     * -------------------------------------------------
     */

    const tripPrice =
      Number(trip.price)

    if (!Number.isFinite(tripPrice)) {
      return NextResponse.json(
        {
          message:
            "The trip price is invalid.",
        },
        {
          status: 400,
        }
      )
    }

    const totalPrice =
      tripPrice *
      cleanedSeatNumbers.length

    /*
     * -------------------------------------------------
     * 10. CREATE BOOKING
     * -------------------------------------------------
     */

    const bookingReference =
      createBookingReference()

    const {
      data: booking,
      error: bookingError,
    } = await supabase
      .from("bookings")
      .insert({
        /*
         * REAL authenticated user UUID.
         */
        user_id: user.id,

        trip_id: tripId,

        booking_reference:
          bookingReference,

        status: "confirmed",

        passenger_name:
          passengerName,

        passenger_phone:
          passengerPhone,

        passenger_email:
          passengerEmail,

        total_price:
          totalPrice,
      })
      .select("*")
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        {
          message:
            "Failed to create the booking.",
          error:
            bookingError?.message,
        },
        {
          status: 500,
        }
      )
    }

    /*
     * -------------------------------------------------
     * 11. CREATE BOOKING SEATS
     * -------------------------------------------------
     */

    const bookingSeatRows =
      cleanedSeatNumbers.map(
        (seatNumber) => ({
          booking_id:
            booking.id,

          trip_id:
            tripId,

          seat_number:
            seatNumber,
        })
      )

    const {
      data: createdSeats,
      error: seatsInsertError,
    } = await supabase
      .from("booking_seats")
      .insert(bookingSeatRows)
      .select("*")

    /*
     * If the seat insert fails,
     * remove the booking we just created.
     */
    if (seatsInsertError) {
      await supabase
        .from("bookings")
        .delete()
        .eq(
          "id",
          booking.id
        )

      return NextResponse.json(
        {
          message:
            "Failed to reserve the selected seat.",
          error:
            seatsInsertError.message,
        },
        {
          status: 500,
        }
      )
    }

    /*
     * -------------------------------------------------
     * 12. SUCCESS
     * -------------------------------------------------
     */

    return NextResponse.json(
      {
        message:
          "Booking created successfully.",

        booking,

        seats:
          createdSeats ?? [],
      },
      {
        status: 201,
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        message:
          "Invalid booking request.",

        error:
          error instanceof Error
            ? error.message
            : "Unknown request error.",
      },
      {
        status: 400,
      }
    )
  }
}