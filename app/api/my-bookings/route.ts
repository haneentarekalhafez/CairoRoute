import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

type Relation<T> = T | T[] | null

type RawPickupPoint = {
  id: number
  name: string
  area: string | null
}

type RawDestination = {
  id: number
  name: string
}

type RawRoute = {
  id: number
  pickup_point: Relation<RawPickupPoint>
  destination: Relation<RawDestination>
}

type RawBus = {
  id: number
  name: string
  brand: string | null
  model: string | null
  plate_number: string
}

type RawTrip = {
  id: number
  departure_time: string
  arrival_time: string
  route: Relation<RawRoute>
  bus: Relation<RawBus>
}

type RawBookingSeat = {
  seat_number: number
}

type RawBooking = {
  id: number
  booking_reference: string
  status: string
  total_price: number
  passenger_name: string
  passenger_phone: string
  passenger_email: string | null
  created_at: string
  trip: Relation<RawTrip>
  booking_seats: RawBookingSeat[]
}

function getOne<T>(value: Relation<T>): T | null {
  if (!value) {
    return null
  }

  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value
}

export async function GET(request: Request) {
  try {
    /*
     * ---------------------------------------
     * 1. GET AUTH TOKEN
     * ---------------------------------------
     */

    const authorizationHeader =
      request.headers.get("authorization")

    if (
      !authorizationHeader ||
      !authorizationHeader.startsWith("Bearer ")
    ) {
      return NextResponse.json(
        {
          message: "You must be logged in.",
        },
        {
          status: 401,
        }
      )
    }

    const accessToken =
      authorizationHeader.slice("Bearer ".length)

    const supabase =
      await createClient()

    /*
     * ---------------------------------------
     * 2. VERIFY LOGGED-IN USER
     * ---------------------------------------
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
     * ---------------------------------------
     * 3. GET ONLY THIS USER'S BOOKINGS
     * ---------------------------------------
     */

    const {
      data,
      error,
    } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_reference,
        status,
        total_price,
        passenger_name,
        passenger_phone,
        passenger_email,
        created_at,

        trip:trips (
          id,
          departure_time,
          arrival_time,

          route:routes (
            id,

            pickup_point:pickup_points (
              id,
              name,
              area
            ),

            destination:destinations (
              id,
              name
            )
          ),

          bus:buses (
            id,
            name,
            brand,
            model,
            plate_number
          )
        ),

        booking_seats (
          seat_number
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      })

    if (error) {
      return NextResponse.json(
        {
          message:
            "Failed to load your bookings.",
          error: error.message,
        },
        {
          status: 500,
        }
      )
    }

    /*
     * ---------------------------------------
     * 4. CLEAN THE RESPONSE FOR FRONTEND
     * ---------------------------------------
     */

    const rawBookings =
      (data ?? []) as unknown as RawBooking[]

    const bookings =
      rawBookings.map((booking) => {
        const trip =
          getOne(booking.trip)

        const route =
          getOne(trip?.route ?? null)

        const pickupPoint =
          getOne(
            route?.pickup_point ?? null
          )

        const destination =
          getOne(
            route?.destination ?? null
          )

        const bus =
          getOne(trip?.bus ?? null)

        const busName =
          [
            bus?.brand,
            bus?.model,
          ]
            .filter(Boolean)
            .join(" ") ||
          bus?.name ||
          "Bus"

        const seats =
          (booking.booking_seats ?? [])
            .map((seat) =>
              Number(
                seat.seat_number
              )
            )
            .sort(
              (a, b) => a - b
            )

        return {
          id:
            booking.id,

          bookingReference:
            booking.booking_reference,

          status:
            booking.status,

          totalPrice:
            Number(
              booking.total_price
            ),

          passengerName:
            booking.passenger_name,

          passengerPhone:
            booking.passenger_phone,

          passengerEmail:
            booking.passenger_email,

          createdAt:
            booking.created_at,

          tripId:
            trip?.id ?? null,

          departureTime:
            trip?.departure_time ??
            null,

          arrivalTime:
            trip?.arrival_time ??
            null,

          pickupPoint:
            pickupPoint?.name ??
            "Unknown pickup point",

          pickupArea:
            pickupPoint?.area ??
            null,

          destination:
            destination?.name ??
            "Unknown destination",

          bus:
            busName,

          plateNumber:
            bus?.plate_number ??
            "Not available",

          seats,
        }
      })

    return NextResponse.json({
      bookings,
    })
  } catch (error) {
    return NextResponse.json(
      {
        message:
          "Failed to load your bookings.",

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