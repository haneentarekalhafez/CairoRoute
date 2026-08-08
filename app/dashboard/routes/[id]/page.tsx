"use client"

import Link from "next/link"

import {
  useParams,
  useSearchParams,
} from "next/navigation"

import {
  useEffect,
  useState,
} from "react"

import {
  ArrowLeft,
  BusFront,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation,
  Route,
  TicketCheck,
  Users,
} from "lucide-react"

import {
  Button,
  buttonVariants,
} from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

/*
 * =========================================
 * TYPES
 * =========================================
 */

type RouteStop = {
  id: number

  order: number

  name: string

  area:
    | string
    | null

  latitude:
    | number
    | null

  longitude:
    | number
    | null

  type:
    | "origin"
    | "intermediate"
    | "destination"
}

type Trip = {
  id: number

  departureTime: string

  arrivalTime:
    | string
    | null

  price: number

  status: string

  route: {
    id:
      | number
      | null

    estimatedDurationMinutes:
      | number
      | null

    pickupPoint: {
      id:
        | number
        | null

      name: string

      area:
        | string
        | null

      latitude:
        | number
        | null

      longitude:
        | number
        | null
    }

    destination: {
      id:
        | number
        | null

      name: string

      latitude:
        | number
        | null

      longitude:
        | number
        | null
    }

    stops: RouteStop[]
  }

  bus: {
    id:
      | number
      | null

    name: string

    brand:
      | string
      | null

    model:
      | string
      | null

    plateNumber: string

    color:
      | string
      | null

    capacity: number
  }

  occupiedSeats:
    number[]

  availableSeats: number
}

type TripResponse = {
  trip?: Trip

  message?: string

  error?: string
}

/*
 * =========================================
 * PAGE
 * =========================================
 */

export default function RouteDetailsPage() {
  const params =
    useParams<{
      id: string
    }>()

  const searchParams =
    useSearchParams()

  const [
    trip,
    setTrip,
  ] =
    useState<Trip | null>(
      null
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("")

  /*
   * =========================================
   * SEARCH PARAMETERS
   * =========================================
   */

  const from =
    searchParams.get(
      "from"
    ) ||
    "Your current location"

  const searchedDestination =
    searchParams.get(
      "to"
    )

  /*
   * =========================================
   * LOAD TRIP
   * =========================================
   */

  useEffect(() => {
    async function loadTrip() {
      try {
        setLoading(true)

        setErrorMessage("")

        const response =
          await fetch(
            `/api/trips/${params.id}`,
            {
              method:
                "GET",

              cache:
                "no-store",
            }
          )

        const result =
          (await response.json()) as TripResponse

        if (!response.ok) {
          throw new Error(
            result.error
              ? `${result.message} ${result.error}`
              : result.message ||
                  "Failed to load trip."
          )
        }

        if (!result.trip) {
          throw new Error(
            "Trip data was not returned."
          )
        }

        setTrip(
          result.trip
        )
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load trip."
        )
      } finally {
        setLoading(false)
      }
    }

    loadTrip()
  }, [params.id])

  /*
   * =========================================
   * LOADING
   * =========================================
   */

  if (loading) {
    return (
      <div className="mx-auto flex min-h-96 w-full max-w-6xl items-center justify-center">
        <div className="text-center">
          <Route className="mx-auto size-10 animate-pulse text-[#512978]" />

          <p className="mt-4 text-sm text-slate-500">
            Loading route details...
          </p>
        </div>
      </div>
    )
  }

  /*
   * =========================================
   * ERROR
   * =========================================
   */

  if (
    errorMessage ||
    !trip
  ) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
            <Route className="size-10 text-slate-400" />

            <h1 className="mt-4 text-2xl font-semibold text-slate-900">
              Trip not found
            </h1>

            <p className="mt-2 max-w-lg text-sm text-slate-500">
              {errorMessage ||
                "The selected trip could not be loaded."}
            </p>

            <Link
              href="/dashboard/results"
              className={buttonVariants({
                className:
                  "mt-6 bg-[#512978] text-white hover:bg-[#40205f]",
              })}
            >
              Return to results
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  /*
   * =========================================
   * TRIP DATA
   * =========================================
   */

  const pickupName =
    trip.route
      .pickupPoint
      .name

  const pickupArea =
    trip.route
      .pickupPoint
      .area

  const destination =
    trip.route
      .destination
      .name ||
    searchedDestination ||
    "Selected destination"

  const busTitle =
    [
      trip.bus.brand,
      trip.bus.model,
    ]
      .filter(Boolean)
      .join(" ") ||
    trip.bus.name

  const duration =
    trip.route
      .estimatedDurationMinutes

  /*
   * =========================================
   * ROUTE STOPS
   * =========================================
   *
   * These now come from public.route_stops.
   *
   * If a route somehow has no route_stops
   * rows, we still show origin + destination.
   */

  const routeStops =
    trip.route.stops.length >
    0
      ? trip.route.stops
      : [
          {
            id:
              -1,

            order:
              1,

            name:
              pickupName,

            area:
              pickupArea,

            latitude:
              trip.route
                .pickupPoint
                .latitude,

            longitude:
              trip.route
                .pickupPoint
                .longitude,

            type:
              "origin" as const,
          },

          {
            id:
              -2,

            order:
              2,

            name:
              destination,

            area:
              null,

            latitude:
              trip.route
                .destination
                .latitude,

            longitude:
              trip.route
                .destination
                .longitude,

            type:
              "destination" as const,
          },
        ]

  /*
   * =========================================
   * LINKS
   * =========================================
   */

  const resultsParams =
    new URLSearchParams()

  resultsParams.set(
    "from",
    from
  )

  resultsParams.set(
    "to",
    searchedDestination ||
      destination
  )

  const bookingParams =
    new URLSearchParams()

  bookingParams.set(
    "from",
    from
  )

  bookingParams.set(
    "to",
    destination
  )

  /*
   * =========================================
   * RENDER
   * =========================================
   */

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* PAGE HEADER */}

      <section>
        <Link
          href={`/dashboard/results?${resultsParams.toString()}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#512978] hover:underline"
        >
          <ArrowLeft className="size-4" />

          Back to route suggestions
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#512978]">
              Route details
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
              {pickupName}
              {" "}
              to
              {" "}
              {destination}
            </h1>

            <p className="mt-2 text-slate-600">
              Review the route, stops, departure time, vehicle and seat availability before booking.
            </p>
          </div>

          {/* PRICE */}

          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Trip price
            </p>

            <p className="mt-1 text-2xl font-semibold text-slate-900">
              EGP{" "}
              {trip.price}
            </p>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* LEFT */}

        <div className="space-y-6">
          {/* TRIP OVERVIEW */}

          <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl text-slate-900">
                Trip overview
              </CardTitle>

              <CardDescription>
                Your scheduled trip information.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-5 pt-6 sm:grid-cols-2 lg:grid-cols-4">
              <InfoBlock
                icon={
                  CalendarDays
                }
                label="Date"
                value={
                  formatDate(
                    trip.departureTime
                  )
                }
              />

              <InfoBlock
                icon={
                  Clock3
                }
                label="Departure"
                value={
                  formatTime(
                    trip.departureTime
                  )
                }
              />

              <InfoBlock
                icon={
                  Clock3
                }
                label="Arrival"
                value={
                  trip.arrivalTime
                    ? formatTime(
                        trip.arrivalTime
                      )
                    : duration
                      ? `~${duration} min`
                      : "Unavailable"
                }
              />

              <InfoBlock
                icon={
                  Users
                }
                label="Available seats"
                value={
                  `${trip.availableSeats} / ${trip.bus.capacity}`
                }
              />
            </CardContent>
          </Card>

          {/* ROUTE STOPS */}

          <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                <Route className="size-5 text-[#512978]" />

                Route stops
              </CardTitle>

              <CardDescription>
                Stops are shown in the order the bus travels through them.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="relative">
                {routeStops.map(
                  (
                    stop,
                    index
                  ) => {
                    const isFirst =
                      index ===
                      0

                    const isLast =
                      index ===
                      routeStops.length -
                        1

                    return (
                      <div
                        key={
                          `${stop.id}-${stop.order}`
                        }
                        className="relative flex gap-4 pb-8 last:pb-0"
                      >
                        {/* LINE TO NEXT STOP */}

                        {!isLast && (
                          <div className="absolute left-[17px] top-9 h-[calc(100%-20px)] w-0.5 bg-purple-200" />
                        )}

                        {/* STOP ICON */}

                        <div
                          className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 ${
                            isFirst
                              ? "border-[#512978] bg-[#512978] text-white"
                              : isLast
                                ? "border-[#512978] bg-white text-[#512978]"
                                : "border-purple-200 bg-purple-50 text-[#512978]"
                          }`}
                        >
                          {isFirst ? (
                            <Navigation className="size-4" />
                          ) : isLast ? (
                            <MapPin className="size-4" />
                          ) : (
                            <span className="size-2 rounded-full bg-[#512978]" />
                          )}
                        </div>

                        {/* STOP INFORMATION */}

                        <div className="min-w-0 pt-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-slate-900">
                              {
                                stop.name
                              }
                            </p>

                            <StopBadge
                              type={
                                stop.type
                              }
                            />
                          </div>

                          {stop.area && (
                            <p className="mt-1 text-sm text-slate-500">
                              {
                                stop.area
                              }
                            </p>
                          )}

                          {stop.type ===
                            "intermediate" && (
                            <p className="mt-1 text-xs text-slate-400">
                              Intermediate stop
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            </CardContent>
          </Card>

          {/* ENDPOINTS */}

          <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl text-slate-900">
                Trip endpoints
              </CardTitle>

              <CardDescription>
                Starting pickup point and final destination.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-6 pt-6 md:grid-cols-2">
              <LocationCard
                icon={
                  Navigation
                }
                label="Pickup point"
                name={
                  pickupName
                }
                description={
                  pickupArea ||
                  "Selected pickup point"
                }
              />

              <LocationCard
                icon={
                  MapPin
                }
                label="Destination"
                name={
                  destination
                }
                description="Final destination"
              />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDE */}

        <div className="space-y-6">
          {/* BUS INFORMATION */}

          <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                <BusFront className="size-5 text-[#512978]" />

                Your bus
              </CardTitle>

              <CardDescription>
                Vehicle assigned to this trip.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pt-6">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#512978]">
                  <BusFront className="size-6" />
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    {busTitle}
                  </p>

                  {trip.bus.name &&
                    trip.bus.name !==
                      busTitle && (
                      <p className="mt-1 text-sm text-slate-500">
                        {
                          trip.bus.name
                        }
                      </p>
                    )}
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4">
                <DetailRow
                  label="Plate number"
                  value={
                    trip.bus
                      .plateNumber
                  }
                />

                <DetailRow
                  label="Color"
                  value={
                    trip.bus.color ||
                    "Unavailable"
                  }
                />

                <DetailRow
                  label="Capacity"
                  value={
                    `${trip.bus.capacity} seats`
                  }
                />

                <DetailRow
                  label="Available"
                  value={
                    `${trip.availableSeats} seats`
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* AVAILABILITY */}

          <Card className="rounded-xl border-purple-100 bg-purple-50 shadow-sm">
            <CardContent className="p-5">
              <div className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#512978]" />

                <div>
                  <p className="font-medium text-slate-900">
                    {trip.availableSeats >
                    0
                      ? "Trip available"
                      : "Trip full"}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {trip.availableSeats >
                    0
                      ? `This trip currently has ${trip.availableSeats} available ${
                          trip.availableSeats ===
                          1
                            ? "seat"
                            : "seats"
                        }.`
                      : "There are currently no available seats on this trip."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BOOK BUTTON */}

          <Link
            href={`/dashboard/booking/${trip.id}?${bookingParams.toString()}`}
            className="block"
          >
            <Button
              type="button"
              disabled={
                trip.availableSeats <=
                  0 ||
                trip.status.toLowerCase() !==
                  "scheduled"
              }
              className="h-12 w-full bg-[#512978] text-base text-white hover:bg-[#40205f]"
            >
              <TicketCheck className="size-5" />

              {trip.availableSeats >
              0
                ? "Continue to booking"
                : "Trip is full"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

/*
 * =========================================
 * INFO BLOCK
 * =========================================
 */

function InfoBlock({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#512978]">
        <Icon className="size-4" />
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  )
}

/*
 * =========================================
 * LOCATION CARD
 * =========================================
 */

function LocationCard({
  icon: Icon,
  label,
  name,
  description,
}: {
  icon: React.ElementType
  label: string
  name: string
  description: string
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-slate-200 p-4">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#512978]">
        <Icon className="size-5" />
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <p className="mt-1 font-semibold text-slate-900">
          {name}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>
  )
}

/*
 * =========================================
 * STOP BADGE
 * =========================================
 */

function StopBadge({
  type,
}: {
  type:
    | "origin"
    | "intermediate"
    | "destination"
}) {
  if (
    type ===
    "origin"
  ) {
    return (
      <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-[#512978]">
        Pickup
      </span>
    )
  }

  if (
    type ===
    "destination"
  ) {
    return (
      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        Destination
      </span>
    )
  }

  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
      Stop
    </span>
  )
}

/*
 * =========================================
 * DETAIL ROW
 * =========================================
 */

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-slate-900">
        {value}
      </span>
    </div>
  )
}

/*
 * =========================================
 * FORMATTING
 * =========================================
 */

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-EG",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(
    new Date(value)
  )
}

function formatTime(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-EG",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(
    new Date(value)
  )
}