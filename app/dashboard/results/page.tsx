"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  BusFront,
  Clock3,
  MapPin,
  Navigation,
  Route,
  Users,
  WalletCards,
} from "lucide-react"

import ResultsMapWrapper from "@/components/results-map-wrapper"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type PickupPoint = {
  id: number
  name: string
  area: string
  latitude: number
  longitude: number
}

type Destination = {
  id: number
  name: string
}

type Bus = {
  id: number
  name: string
  brand: string | null
  model: string | null
  plate_number: string
  color: string | null
  capacity: number
}

type TripFromApi = {
  id: number
  departure_time: string
  arrival_time: string
  price: number
  status: string

  route: {
    id: number
    destination_id: number
    estimated_duration_minutes: number
    pickup_point: PickupPoint
    destination: Destination
  }

  bus: Bus

  booking_seats: {
    id: number
  }[]
}

type DisplayTrip = TripFromApi & {
  distanceKm: number | null
  availableSeats: number
}

type UserCoordinates = {
  latitude: number
  longitude: number
}

export default function ResultsPage() {
  const searchParams = useSearchParams()

  const currentLocation =
    searchParams.get("from") || "Your current location"

  const destination =
    searchParams.get("to") || "Selected destination"

  const destinationId = searchParams.get("destinationId")

  const [trips, setTrips] = useState<TripFromApi[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const userCoordinates = useMemo(
    () => parseCoordinates(currentLocation),
    [currentLocation]
  )

  useEffect(() => {
    async function loadTrips() {
      if (!destinationId) {
        setErrorMessage("No destination was selected.")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `/api/trips?destinationId=${encodeURIComponent(
            destinationId
          )}`
        )

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to load trips."
          )
        }

        setTrips(result)
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load trips."
        )
      } finally {
        setLoading(false)
      }
    }

    loadTrips()
  }, [destinationId])

  const displayedTrips = useMemo<DisplayTrip[]>(() => {
    const preparedTrips = trips.map((trip) => {
      const bookedSeats = trip.booking_seats?.length ?? 0

      const availableSeats = Math.max(
        trip.bus.capacity - bookedSeats,
        0
      )

      const distanceKm = userCoordinates
        ? calculateDistanceKm(
            userCoordinates.latitude,
            userCoordinates.longitude,
            trip.route.pickup_point.latitude,
            trip.route.pickup_point.longitude
          )
        : null

      return {
        ...trip,
        availableSeats,
        distanceKm,
      }
    })

    return preparedTrips.sort((firstTrip, secondTrip) => {
      if (
        firstTrip.distanceKm !== null &&
        secondTrip.distanceKm !== null
      ) {
        return firstTrip.distanceKm - secondTrip.distanceKm
      }

      return (
        new Date(firstTrip.departure_time).getTime() -
        new Date(secondTrip.departure_time).getTime()
      )
    })
  }, [trips, userCoordinates])

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#512978] hover:underline"
          >
            <ArrowLeft className="size-4" />
            Change search
          </Link>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Suggested trips
          </h1>

          <p className="mt-2 text-slate-600">
            Available trips are ordered by the nearest pickup
            point.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Results found
          </p>

          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {loading ? "—" : displayedTrips.length}
          </p>
        </div>
      </section>

      <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
        <CardContent className="grid gap-5 p-5 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <LocationSummary
            icon={Navigation}
            label="Current location"
            value={currentLocation}
          />

          <div className="hidden items-center md:flex">
            <div className="h-px w-12 bg-slate-300" />

            <BusFront className="mx-3 size-5 text-[#512978]" />

            <div className="h-px w-12 bg-slate-300" />
          </div>

          <LocationSummary
            icon={MapPin}
            label="Destination"
            value={destination}
          />
        </CardContent>
      </Card>

      <ResultsMapWrapper />

      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-slate-900">
            Available trips
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose the pickup point and departure time that work
            best for you.
          </p>
        </div>

        {loading ? (
          <LoadingState />
        ) : errorMessage ? (
          <ErrorState message={errorMessage} />
        ) : displayedTrips.length === 0 ? (
          <EmptyState destination={destination} />
        ) : (
          <div className="space-y-5">
            {displayedTrips.map((trip, index) => (
              <TripResultCard
                key={trip.id}
                trip={trip}
                position={index + 1}
                currentLocation={currentLocation}
                destination={destination}
                destinationId={destinationId || ""}
                recommended={
                  index === 0 &&
                  trip.distanceKm !== null
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function TripResultCard({
  trip,
  position,
  currentLocation,
  destination,
  destinationId,
  recommended,
}: {
  trip: DisplayTrip
  position: number
  currentLocation: string
  destination: string
  destinationId: string
  recommended: boolean
}) {
  const pickupPoint = trip.route.pickup_point

  const routeParams = new URLSearchParams({
    from: currentLocation,
    to: destination,
    destinationId,
  })

  const vehicleName = [
    trip.bus.brand,
    trip.bus.model,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <Card
      className={`overflow-hidden rounded-xl bg-white shadow-sm ${
        recommended
          ? "border-2 border-[#512978]"
          : "border-slate-200"
      }`}
    >
      <CardHeader className="border-b border-slate-100 bg-slate-50/70">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#512978]">
              <MapPin className="size-5" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="text-xl text-slate-900">
                  {pickupPoint.name}
                </CardTitle>

                {recommended && (
                  <span className="rounded-full bg-[#512978] px-3 py-1 text-xs font-medium text-white">
                    Closest suggestion
                  </span>
                )}
              </div>

              <CardDescription className="mt-1">
                {pickupPoint.area}

                {trip.distanceKm !== null &&
                  ` · ${formatDistance(trip.distanceKm)} away`}
              </CardDescription>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Option {position}
            </p>

            <p className="mt-1 text-xl font-semibold text-slate-900">
              EGP {Number(trip.price).toFixed(0)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr_auto] lg:items-center">
          <div className="space-y-4">
            <RouteDetail
              icon={Navigation}
              label="Pickup point"
              value={pickupPoint.name}
            />

            <RouteDetail
              icon={MapPin}
              label="Destination"
              value={trip.route.destination.name}
            />
          </div>

          <div className="grid gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
            <RouteDetail
              icon={Clock3}
              label="Departure"
              value={formatDateTime(
                trip.departure_time
              )}
            />

            <RouteDetail
              icon={Clock3}
              label="Arrival"
              value={formatDateTime(trip.arrival_time)}
            />

            <RouteDetail
              icon={Route}
              label="Trip duration"
              value={`${trip.route.estimated_duration_minutes} minutes`}
            />

            <RouteDetail
              icon={Navigation}
              label="Distance to pickup"
              value={
                trip.distanceKm !== null
                  ? formatDistance(trip.distanceKm)
                  : "Location unavailable"
              }
            />

            <RouteDetail
              icon={BusFront}
              label="Vehicle"
              value={vehicleName || trip.bus.name}
            />

            <RouteDetail
              icon={Users}
              label="Available seats"
              value={`${trip.availableSeats} seats`}
            />
          </div>

          <div className="flex flex-col gap-3 lg:min-w-44">
            <Link
              href={`/dashboard/routes/${trip.id}?${routeParams.toString()}`}
              className={buttonVariants({
                className:
                  "h-11 bg-[#512978] text-white hover:bg-[#40205f]",
              })}
            >
              View trip
            </Link>

            <div className="flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700">
              <WalletCards className="size-4" />
              EGP {Number(trip.price).toFixed(0)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LocationSummary({
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
        <Icon className="size-5" />
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <p className="mt-1 font-medium text-slate-900">
          {value}
        </p>
      </div>
    </div>
  )
}

function RouteDetail({
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

function LoadingState() {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="flex min-h-48 items-center justify-center p-6">
        <p className="text-sm text-slate-500">
          Loading available trips...
        </p>
      </CardContent>
    </Card>
  )
}

function ErrorState({
  message,
}: {
  message: string
}) {
  return (
    <Card className="border-red-200 bg-white shadow-sm">
      <CardContent className="flex min-h-48 flex-col items-center justify-center p-6 text-center">
        <p className="font-medium text-red-700">
          Failed to load trips
        </p>

        <p className="mt-2 text-sm text-red-600">
          {message}
        </p>
      </CardContent>
    </Card>
  )
}

function EmptyState({
  destination,
}: {
  destination: string
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="flex min-h-48 flex-col items-center justify-center p-6 text-center">
        <BusFront className="size-9 text-slate-400" />

        <p className="mt-4 font-medium text-slate-800">
          No future trips found
        </p>

        <p className="mt-2 text-sm text-slate-500">
          There are currently no scheduled trips to{" "}
          {destination}.
        </p>
      </CardContent>
    </Card>
  )
}

function parseCoordinates(
  locationValue: string
): UserCoordinates | null {
  const parts = locationValue
    .split(",")
    .map((part) => Number(part.trim()))

  if (
    parts.length !== 2 ||
    !Number.isFinite(parts[0]) ||
    !Number.isFinite(parts[1])
  ) {
    return null
  }

  return {
    latitude: parts[0],
    longitude: parts[1],
  }
}

function calculateDistanceKm(
  firstLatitude: number,
  firstLongitude: number,
  secondLatitude: number,
  secondLongitude: number
) {
  const earthRadiusKm = 6371

  const latitudeDifference = degreesToRadians(
    secondLatitude - firstLatitude
  )

  const longitudeDifference = degreesToRadians(
    secondLongitude - firstLongitude
  )

  const firstLatitudeRadians =
    degreesToRadians(firstLatitude)

  const secondLatitudeRadians =
    degreesToRadians(secondLatitude)

  const value =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(firstLatitudeRadians) *
      Math.cos(secondLatitudeRadians) *
      Math.sin(longitudeDifference / 2) ** 2

  const angularDistance =
    2 *
    Math.atan2(
      Math.sqrt(value),
      Math.sqrt(1 - value)
    )

  return earthRadiusKm * angularDistance
}

function degreesToRadians(degrees: number) {
  return degrees * (Math.PI / 180)
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`
  }

  return `${distanceKm.toFixed(1)} km`
}

function formatDateTime(dateValue: string) {
  return new Intl.DateTimeFormat("en-EG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateValue))
}