"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BusFront,
  CalendarDays,
  LocateFixed,
  MapPin,
  Navigation,
  Route,
} from "lucide-react"

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

type Destination = {
  id: number
  name: string
  latitude: number | null
  longitude: number | null
  is_active: boolean
}

export default function DashboardPage() {
  const router = useRouter()

  const [currentLocation, setCurrentLocation] = useState("")
  const [selectedDestinationId, setSelectedDestinationId] = useState("")
  const [destinations, setDestinations] = useState<Destination[]>([])

  const [destinationsLoading, setDestinationsLoading] = useState(true)
  const [destinationsError, setDestinationsError] = useState("")
  const [message, setMessage] = useState("")

  const selectedDestination = destinations.find(
    (destination) =>
      destination.id.toString() === selectedDestinationId
  )

  useEffect(() => {
    async function loadDestinations() {
      try {
        const response = await fetch("/api/destinations")
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

  function detectLocation() {
    if (!navigator.geolocation) {
      setMessage("Your browser does not support location detection.")
      return
    }

    setMessage("Detecting your current location...")

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(6)
        const longitude = position.coords.longitude.toFixed(6)

        setCurrentLocation(`${latitude}, ${longitude}`)
        setMessage("Your location was detected successfully.")
      },
      () => {
        setMessage(
          "Location permission was blocked. Enter your location manually."
        )
      }
    )
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

    router.push(`/dashboard/results?${params.toString()}`)
  }

  function handleLocationKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      searchRoutes()
    }
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
                  onChange={(event) => {
                    setCurrentLocation(event.target.value)
                    setMessage("")
                  }}
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
                  destinationsLoading || Boolean(destinationsError)
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
            <div className="flex min-h-36 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <BusFront className="mb-3 size-8 text-slate-400" />

              <p className="font-medium text-slate-800">
                No upcoming trips
              </p>

              <p className="mt-1 max-w-xs text-sm text-slate-500">
                Your confirmed bus reservations will appear here.
              </p>
            </div>
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
            <div className="flex min-h-36 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <MapPin className="mb-3 size-8 text-slate-400" />

              <p className="font-medium text-slate-800">
                Location not selected
              </p>

              <p className="mt-1 max-w-xs text-sm text-slate-500">
                Detect your location to view nearby pickup suggestions.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}