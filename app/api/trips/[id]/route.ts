import {
  NextRequest,
  NextResponse,
} from "next/server"

import { createClient } from "@/lib/supabase/server"

type RouteStop = {
  id: number
  stop_order: number
  stop_name: string
  area: string | null
  latitude: number | null
  longitude: number | null
  stop_type:
    | "origin"
    | "intermediate"
    | "destination"
}

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string
    }>
  }
) {
  try {
    const {
      id,
    } =
      await context.params

    const tripId =
      Number(id)

    if (
      !Number.isInteger(
        tripId
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid trip ID.",
        },
        {
          status: 400,
        }
      )
    }

    const supabase =
      await createClient()

    /*
     * =========================================
     * GET TRIP
     * =========================================
     *
     * The URL still uses:
     *
     * /dashboard/routes/[id]
     *
     * but [id] is the TRIP ID.
     *
     * We are keeping that working architecture.
     */

    const {
      data,
      error,
    } =
      await supabase
        .from("trips")
        .select(`
          id,
          departure_time,
          arrival_time,
          price,
          status,

          route:routes (
            id,
            estimated_duration_minutes,

            pickup_point:pickup_points (
              id,
              name,
              area,
              latitude,
              longitude
            ),

            destination:destinations (
              id,
              name,
              latitude,
              longitude
            ),

            route_stops (
              id,
              stop_order,
              stop_name,
              area,
              latitude,
              longitude,
              stop_type
            )
          ),

          bus:buses (
            id,
            name,
            brand,
            model,
            plate_number,
            color,
            capacity
          ),

          booking_seats (
            seat_number
          )
        `)
        .eq(
          "id",
          tripId
        )
        .single()

    if (
      error ||
      !data
    ) {
      return NextResponse.json(
        {
          message:
            "Trip not found.",

          error:
            error?.message,
        },
        {
          status: 404,
        }
      )
    }

    /*
     * =========================================
     * NORMALIZE ROUTE STOPS
     * =========================================
     *
     * Supabase does not guarantee the order
     * of the nested relation here, so we sort
     * using stop_order before sending it to
     * the frontend.
     */

    const routeValue =
      Array.isArray(
        data.route
      )
        ? data.route[0]
        : data.route

    const busValue =
      Array.isArray(
        data.bus
      )
        ? data.bus[0]
        : data.bus

    const pickupPoint =
      routeValue
        ? Array.isArray(
            routeValue.pickup_point
          )
          ? routeValue
              .pickup_point[0]
          : routeValue
              .pickup_point
        : null

    const destination =
      routeValue
        ? Array.isArray(
            routeValue.destination
          )
          ? routeValue
              .destination[0]
          : routeValue
              .destination
        : null

    const routeStops =
      (
        routeValue
          ?.route_stops ??
        []
      )
        .slice()
        .sort(
          (
            a: RouteStop,
            b: RouteStop
          ) =>
            a.stop_order -
            b.stop_order
        )

    const occupiedSeats =
      (
        data.booking_seats ??
        []
      )
        .map(
          (
            seat
          ) =>
            seat.seat_number
        )
        .sort(
          (
            a,
            b
          ) =>
            a - b
        )

    /*
     * =========================================
     * RETURN CLEAN TRIP OBJECT
     * =========================================
     */

    return NextResponse.json({
      trip: {
        id:
          data.id,

        departureTime:
          data.departure_time,

        arrivalTime:
          data.arrival_time,

        price:
          data.price,

        status:
          data.status,

        route: {
          id:
            routeValue?.id ??
            null,

          estimatedDurationMinutes:
            routeValue
              ?.estimated_duration_minutes ??
            null,

          pickupPoint: {
            id:
              pickupPoint?.id ??
              null,

            name:
              pickupPoint?.name ??
              "Unknown pickup point",

            area:
              pickupPoint?.area ??
              null,

            latitude:
              pickupPoint?.latitude ??
              null,

            longitude:
              pickupPoint?.longitude ??
              null,
          },

          destination: {
            id:
              destination?.id ??
              null,

            name:
              destination?.name ??
              "Unknown destination",

            latitude:
              destination?.latitude ??
              null,

            longitude:
              destination?.longitude ??
              null,
          },

          stops:
            routeStops.map(
              (
                stop: RouteStop
              ) => ({
                id:
                  stop.id,

                order:
                  stop.stop_order,

                name:
                  stop.stop_name,

                area:
                  stop.area,

                latitude:
                  stop.latitude,

                longitude:
                  stop.longitude,

                type:
                  stop.stop_type,
              })
            ),
        },

        bus: {
          id:
            busValue?.id ??
            null,

          name:
            busValue?.name ??
            "Unknown bus",

          brand:
            busValue?.brand ??
            null,

          model:
            busValue?.model ??
            null,

          plateNumber:
            busValue
              ?.plate_number ??
            "Unavailable",

          color:
            busValue?.color ??
            null,

          capacity:
            busValue?.capacity ??
            0,
        },

        occupiedSeats,

        availableSeats:
          Math.max(
            0,

            (
              busValue
                ?.capacity ??
              0
            ) -
              occupiedSeats.length
          ),
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        message:
          "Failed to load trip.",

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