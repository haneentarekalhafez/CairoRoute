"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BusFront,
  CalendarDays,
  Clock3,
  LocateFixed,
  MapPin,
  Navigation,
  Route,
  TicketCheck,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"

const PAGE_LOAD_TIME = Date.now()

type Destination = {
  id: number
  name: string
  latitude: number | null
  longitude: number | null
  is_active: boolean
}

type PickupPoint = {
  id: number
  name: string
  area: string | null
  latitude: number | null
  longitude: number | null
}

type Booking = {
  id: number
  bookingReference: string
  status: string
  totalPrice: number
  passengerName: string
  passengerPhone: string
  passengerEmail: string | null
  createdAt: string
  tripId: number | null
  departureTime: string | null
  arrivalTime: string | null
  pickupPoint: string
  pickupArea: string | null
  destination: string
  bus: string
  plateNumber: string
  seats: number[]
}

type BookingsResponse = {
  bookings?: Booking[]
  message?: string
  error?: string
}

type Coordinates = {
  latitude: number
  longitude: number
}

type NearestPickup = {
  pickup: PickupPoint
  distanceKm: number
}

export default function DashboardPage() {
  const router = useRouter()

  const [currentLocation, setCurrentLocation] = useState("")
  const [coordinates, setCoordinates] =
    useState<Coordinates | null>(null)

  const [selectedDestinationId, setSelectedDestinationId] = useState("")
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])

  const [destinationsLoading, setDestinationsLoading] = useState(true)
  const [dashboardLoading, setDashboardLoading] = useState(true)

  const [destinationsError, setDestinationsError] = useState("")
  const [message, setMessage] = useState("")

  const selectedDestination = destinations.find(
    (destination) =>
      destination.id.toString() === selectedDestinationId
  )

  useEffect(() => {
    async function loadDestinations() {
      try {
        const response = await fetch("/api/destinations", {
          cache: "no-store",
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to load destinations."
          )
        }

        setDestinations(result)
      } catch (error) {
        setDestinationsError(
          error instanceof Error
            ? error.message
            : "Failed to load destinations."
        )
      } finally {
        setDestinationsLoading(false)
      }
    }

    loadDestinations()
  }, [])

  useEffect(() => {
    async function loadPickupPoints() {
      try {
        const response = await fetch("/api/pickup-points", {
          cache: "no-store",
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to load pickup points."
          )
        }

        setPickupPoints(result)
      } catch (error) {
        console.error("Failed to load pickup points:", error)
      }
    }

    loadPickupPoints()
  }, [])

  useEffect(() => {
    async function loadBookings() {
      try {
        const supabase = createClient()

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session) {
          return
        }

        const response = await fetch("/api/my-bookings", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        })

        const result =
          (await response.json()) as BookingsResponse

        if (!response.ok) {
          throw new Error(
            result.error
              ? `${result.message} ${result.error}`
              : result.message || "Failed to load bookings."
          )
        }

        setBookings(result.bookings ?? [])
      } catch (error) {
        console.error(
          "Failed to load dashboard bookings:",
          error
        )
      } finally {
        setDashboardLoading(false)
      }
    }

    loadBookings()
  }, [])

  const nextBooking = useMemo(() => {
    return (
      bookings
        .filter((booking) => {
          if (booking.status.toLowerCase() !== "confirmed") {
            return false
          }

          if (!booking.departureTime) {
            return false
          }

          const departure = new Date(
            booking.departureTime
          ).getTime()

          return departure > PAGE_LOAD_TIME
        })
        .sort((a, b) => {
          const aTime = new Date(
            a.departureTime!
          ).getTime()

          const bTime = new Date(
            b.departureTime!
          ).getTime()

          return aTime - bTime
        })[0] ?? null
    )
  }, [bookings])

  const nearestPickup =
    useMemo<NearestPickup | null>(() => {
      if (!coordinates) {
        return null
      }

      const validPickupPoints = pickupPoints.filter(
        (pickup) =>
          pickup.latitude !== null &&
          pickup.longitude !== null
      )

      if (validPickupPoints.length === 0) {
        return null
      }

      const calculated = validPickupPoints.map(
        (pickup) => ({
          pickup,
          distanceKm: calculateDistanceKm(
            coordinates.latitude,
            coordinates.longitude,
            pickup.latitude!,
            pickup.longitude!
          ),
        })
      )

      calculated.sort(
        (a, b) => a.distanceKm - b.distanceKm
      )

      return calculated[0] ?? null
    }, [coordinates, pickupPoints])

  function detectLocation() {
    if (!navigator.geolocation) {
      setMessage(
        "Your browser does not support location detection."
      )
      return
    }

    setMessage("Detecting your current location...")

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        setCoordinates({
          latitude,
          longitude,
        })

        setCurrentLocation(
          `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        )

        setMessage(
          "Your location was detected successfully."
        )
      },
      () => {
        setMessage(
          "Location permission was blocked. Enter your location manually."
        )
      }
    )
  }

  function handleLocationChange(value: string) {
    setCurrentLocation(value)
    setMessage("")

    const parsed = parseCoordinates(value)
    setCoordinates(parsed)
  }

  function searchRoutes() {
    const cleanLocation = currentLocation.trim()

    if (!cleanLocation || !selectedDestination) {
      setMessage(
        "Enter your current location and select a destination."
      )
      return
    }

    setMessage("")

    const params = new URLSearchParams({
      from: cleanLocation,
      to: selectedDestination.name,
      destinationId: selectedDestination.id.toString(),
    })

    router.push(
      `/dashboard/results?${params.toString()}`
    )
  }

  function handleLocationKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      searchRoutes()
    }
  }

  function openBookings() {
    router.push("/dashboard/bookings")
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section
        className="relative min-h-[320px] overflow-hidden rounded-2xl bg-slate-800 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/cairo-bus.jpeg')",
        }}
      >
        <div className="absolute inset-0 bg-slate-950/55" />
        <div className="absolute inset-0 bg-[#32184d]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/10" />

        <div className="relative flex min-h-[320px] items-end p-7 text-white md:p-10">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-white/75">
              Transportation across Cairo
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Where do you want to go?
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-white/85 md:text-base">
              Enter your destination and we will suggest the nearest suitable
              pickup point based on your current location.
            </p>
          </div>
        </div>
      </section>

      <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#512978]">
              <Route className="size-5" />
            </div>

            <div>
              <CardTitle className="text-xl text-slate-900">
                Plan your trip
              </CardTitle>

              <CardDescription className="mt-1">
                Use your current location and select your destination.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid gap-5 xl:grid-cols-[1fr_1fr_auto] xl:items-end">
            <div className="space-y-2">
              <Label
                htmlFor="current-location"
                className="text-sm font-medium text-slate-700"
              >
                Current location
              </Label>

              <div className="relative">
                <Navigation className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                <Input
                  id="current-location"
                  value={currentLocation}
                  onChange={(event) =>
                    handleLocationChange(
                      event.target.value
                    )
                  }
                  onKeyDown={handleLocationKeyDown}
                  placeholder="Enter your current location"
                  className="h-12 border-slate-300 bg-white pl-10 pr-12"
                />

                <button
                  type="button"
                  onClick={detectLocation}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#512978] transition hover:bg-purple-50"
                  aria-label="Use current location"
                  title="Use current location"
                >
                  <LocateFixed className="size-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="destination"
                className="text-sm font-medium text-slate-700"
              >
                Destination
              </Label>

              <Select
                value={selectedDestinationId}
                onValueChange={(value) => {
                  if (value !== null) {
                    setSelectedDestinationId(value)
                    setMessage("")
                  }
                }}
                disabled={
                  destinationsLoading ||
                  Boolean(destinationsError)
                }
              >
                <SelectTrigger
                  id="destination"
                  className="h-12 w-full border-slate-300 bg-white"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 shrink-0 text-slate-400" />

                    <span
                      className={
                        selectedDestination
                          ? "text-slate-900"
                          : "text-slate-500"
                      }
                    >
                      {destinationsLoading
                        ? "Loading destinations..."
                        : selectedDestination?.name ||
                          "Select your destination"}
                    </span>
                  </div>
                </SelectTrigger>

                <SelectContent>
                  {destinations.map((destination) => (
                    <SelectItem
                      key={destination.id}
                      value={destination.id.toString()}
                    >
                      {destination.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {destinationsError && (
                <p className="text-sm text-red-600">
                  {destinationsError}
                </p>
              )}
            </div>

            <Button
              type="button"
              onClick={searchRoutes}
              disabled={
                destinationsLoading ||
                Boolean(destinationsError) ||
                destinations.length === 0
              }
              className="h-12 bg-[#512978] px-6 text-white hover:bg-[#40205f]"
            >
              Search routes
              <ArrowRight className="size-4" />
            </Button>
          </div>

          {message && (
            <p className="mt-4 text-sm text-slate-600">
              {message}
            </p>
          )}
        </CardContent>
      </Card>

      <section className="grid gap-5 md:grid-cols-2">
        <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#512978]">
                <CalendarDays className="size-5" />
              </div>

              <div>
                <CardTitle className="text-lg text-slate-900">
                  Upcoming trip
                </CardTitle>

                <CardDescription className="mt-1">
                  Your next confirmed reservation
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {dashboardLoading ? (
              <div className="flex min-h-44 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm text-slate-500">
                  Loading your next trip...
                </p>
              </div>
            ) : nextBooking ? (
              <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white text-[#512978] shadow-sm">
                    <BusFront className="size-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">
                      {nextBooking.pickupPoint} →{" "}
                      {nextBooking.destination}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {nextBooking.bus}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <DashboardDetail
                    icon={CalendarDays}
                    label="Date"
                    value={
                      nextBooking.departureTime
                        ? formatDate(
                            nextBooking.departureTime
                          )
                        : "Unavailable"
                    }
                  />

                  <DashboardDetail
                    icon={Clock3}
                    label="Departure"
                    value={
                      nextBooking.departureTime
                        ? formatTime(
                            nextBooking.departureTime
                          )
                        : "Unavailable"
                    }
                  />

                  <DashboardDetail
                    icon={TicketCheck}
                    label="Seat"
                    value={
                      nextBooking.seats.length > 0
                        ? nextBooking.seats
                            .map((seat) => `${seat}`)
                            .join(", ")
                        : "Unavailable"
                    }
                  />

                  <DashboardDetail
                    icon={BusFront}
                    label="Plate"
                    value={
                      nextBooking.plateNumber ||
                      "Unavailable"
                    }
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={openBookings}
                  className="mt-5 w-full border-purple-200 text-[#512978] hover:bg-purple-50"
                >
                  View my booking
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <BusFront className="mb-3 size-8 text-slate-400" />

                <p className="font-medium text-slate-800">
                  No upcoming trips
                </p>

                <p className="mt-1 max-w-xs text-sm text-slate-500">
                  Your confirmed bus reservations will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#512978]">
                <MapPin className="size-5" />
              </div>

              <div>
                <CardTitle className="text-lg text-slate-900">
                  Nearest pickup point
                </CardTitle>

                <CardDescription className="mt-1">
                  Suggested using your current location
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {nearestPickup ? (
              <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white text-[#512978] shadow-sm">
                    <Navigation className="size-5" />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">
                      {nearestPickup.pickup.name}
                    </p>

                    {nearestPickup.pickup.area && (
                      <p className="mt-1 text-sm text-slate-500">
                        {nearestPickup.pickup.area}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 rounded-lg bg-white p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Approximate distance
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-[#512978]">
                    {formatDistance(
                      nearestPickup.distanceKm
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Straight-line distance from your detected location.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <MapPin className="mb-3 size-8 text-slate-400" />

                <p className="font-medium text-slate-800">
                  Location not selected
                </p>

                <p className="mt-1 max-w-xs text-sm text-slate-500">
                  Detect your location to view the nearest pickup point.
                </p>

                <Button
                  type="button"
                  variant="outline"
                  onClick={detectLocation}
                  className="mt-4 border-purple-200 text-[#512978] hover:bg-purple-50"
                >
                  <LocateFixed className="size-4" />
                  Detect location
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function DashboardDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-white p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-[#512978]" />

      <div>
        <p className="text-xs text-slate-500">
          {label}
        </p>

        <p className="mt-1 text-sm font-medium text-slate-900">
          {value}
        </p>
      </div>
    </div>
  )
}

function parseCoordinates(
  value: string
): Coordinates | null {
  const parts = value
    .split(",")
    .map((part) => part.trim())

  if (parts.length !== 2) {
    return null
  }

  const latitude = Number(parts[0])
  const longitude = Number(parts[1])

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null
  }

  if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null
  }

  return {
    latitude,
    longitude,
  }
}

function calculateDistanceKm(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
) {
  const earthRadiusKm = 6371

  const latitudeDifference =
    degreesToRadians(
      latitude2 - latitude1
    )

  const longitudeDifference =
    degreesToRadians(
      longitude2 - longitude1
    )

  const firstLatitude =
    degreesToRadians(latitude1)

  const secondLatitude =
    degreesToRadians(latitude2)

  const a =
    Math.sin(
      latitudeDifference / 2
    ) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(
        longitudeDifference / 2
      ) ** 2

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )

  return earthRadiusKm * c
}

function degreesToRadians(
  degrees: number
) {
  return degrees * (Math.PI / 180)
}

function formatDistance(
  distanceKm: number
) {
  if (distanceKm < 1) {
    return `${Math.round(
      distanceKm * 1000
    )} m`
  }

  return `${distanceKm.toFixed(1)} km`
}

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-EG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(value))
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
  ).format(new Date(value))
}